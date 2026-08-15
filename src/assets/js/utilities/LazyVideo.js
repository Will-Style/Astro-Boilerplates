// [data-lazy-video] の遅延読み込み。
// 画面外では src を持たせず、可視になった時点で読み込んで再生する。
// マークアップ側は data-src に URL を置き、preload="none" にしておく。
// 形式の出し分けが要る場合は <video> ではなく各 <source> に data-src を置く。
//
// モバイル / 省データ / モーション低減の環境では自動再生しない。
// poster があれば動画は読み込まずポスターだけを出し、無ければメタデータだけ読んで
// 1 フレーム目を出す（判定は videoPolicy に集約）。
// この環境では再生する手段が無くなるので、[data-video-controls] が付いた動画
// （ブログ本文）には controls を出して、ユーザー操作で再生できるようにする。

import { prefersStillVideo, onStillVideoChange, stillFrameTime } from './VideoPolicy';

// 監視中の動画。二重登録を防ぐのと、DOM から外れたものを掃除するために持っている
const observed = new Set();

let io = null;

// まだ URL を戻していない＝読み込みが始まっていない状態か
const pending = (v) => !v.src && !v.querySelector("source[src]");

// 自動再生しない環境で、ユーザーが自分で再生できるようにするか。
// 自動再生する環境（PC）では演出の邪魔になるので出さない
const showsControls = (v) => v.hasAttribute("data-video-controls") && prefersStillVideo();

// 環境に合わせて controls を付け外しする。画面幅やモーション設定は途中で変わるため、
// 監視に載せるときと判定が変わったときの両方から呼ぶ
const applyControls = (v) => v.toggleAttribute("controls", showsControls(v));

// data-src を src へ戻して読み込みを始める。
// <source> があるときは <video> 側に src を入れてはいけない。src 属性のある
// <video> は子の <source> を無視するため、形式のフォールバックを潰してしまう
function load(v) {
    if (!restore(v)) return;
    v.preload = "auto";
    v.load();
}

// data-src を src へ戻す。戻すものが無ければ false
function restore(v) {
    const sources = v.querySelectorAll("source[data-src]");
    if (sources.length) sources.forEach(s => s.src = s.dataset.src);
    else if (v.dataset.src) v.src = v.dataset.src;
    else return false;
    return true;
}

// 自動再生しない環境向けの読み込み。
// poster があれば動画は取得せずポスター画像だけで見せる。無いときはメタデータ
// （＝先頭フレーム）までに留めて、本体を丸ごと落とさないようにする
function loadStill(v) {
    v.removeAttribute("autoplay");
    const poster = Boolean(v.getAttribute("poster"));
    // poster だけで見せられる場合も、controls を出すなら src は戻しておく。
    // src が無いままだと再生ボタンを押しても何も起きない
    if (poster && !showsControls(v)) return;
    if (!restore(v)) return;
    v.preload = "metadata";
    v.load();
    // poster があるときはそれを出したままにする（シークすると動画のフレームに変わる）
    if (!poster) seekStill(v);
}

// 冒頭ではなく少し進めた位置のフレームを出す。
// 動画の 1 フレーム目はフェードインや無地のことが多く、静止画としては絵にならない
function seekStill(v) {
    const apply = () => {
        const t = stillFrameTime(v.duration);
        if (!t || v.currentTime >= t) return;
        try {
            v.currentTime = t;
        } catch (e) {
            // シークできない形式・配信（Range 非対応など）は冒頭のままにする
        }
    };
    if (v.readyState >= 1) apply();
    else v.addEventListener("loadedmetadata", apply, { once: true });
    rewindOnPlay(v);
}

// 静止画として途中のフレームを出しているので、ユーザーが再生を始めたら頭に戻す。
// 自分でシークした位置から再生したいこともあるため、静止画の位置のままのときだけ
function rewindOnPlay(v) {
    if (v.dataset.rewindOnPlay) return; // 再交差のたびに登録しない
    v.dataset.rewindOnPlay = "";
    v.addEventListener("play", () => {
        if (Math.abs(v.currentTime - stillFrameTime(v.duration)) < 0.5) v.currentTime = 0;
    }, { once: true });
}

function observer() {
    if (io) return io;
    // 可視時に src 付与 → play()、離脱で pause()
    io = new IntersectionObserver((es) => es.forEach(e => {
        const v = e.target;
        if (!e.isIntersecting) {
            v.pause();
            return;
        }
        // 自動再生しない環境では静止画のまま出す
        if (prefersStillVideo()) {
            loadStill(v);
            v.pause();
            return;
        }
        if (pending(v)) load(v);
        v.muted = true;           // 属性だけでなくプロパティでも確実に
        v.play().catch(() => {});
    }), { rootMargin: "200px" });
    return io;
}

// 監視対象を追加する。あとから DOM に足された動画にも使えるよう、
// 同じ要素を二重に登録しないようにしている
export function observeLazyVideos(root = document) {
    const o = observer();
    const add = (v) => {
        // controls の判定は登録済みでもやり直す。マークアップの時点で
        // [data-lazy-video] が付いている動画は Video が [data-video-controls] を
        // 付ける前にここへ来ることがあり（バンドル後の初期化順は import 順どおりに
        // ならない）、登録済みだからと飛ばすと controls が出ないまま固定されてしまう
        applyControls(v); // 画面外のうちに済ませ、表示された時点では出揃っている状態にする
        if (observed.has(v)) return;
        observed.add(v);
        o.observe(v);
    };
    // 差し替えられた要素そのものが動画のこともあるので、root 自身も見る
    if (root instanceof Element && root.matches("[data-lazy-video]")) add(root);
    root.querySelectorAll("[data-lazy-video]").forEach(add);
}

// 一覧の絞り込みやページャなどで DOM を差し替えたら、差し替えた側からこれを呼ぶ。
// 呼ばないと、増えた <video> は誰にも監視されず src が入らないまま止まる。
// container を渡すと走査範囲をそこに絞れる（省略時は document 全体）
export function notifyContentUpdated(container) {
    window.dispatchEvent(new CustomEvent("ContentUpdated", { detail: { container } }));
}

// DOM から外れた動画を監視から外す。
// IntersectionObserver は observe した要素を強参照するため、一覧の差し替えで
// 捨てられた <video> を放置すると読み込み済みのバッファごと残り続ける
function pruneLazyVideos() {
    if (!io) return;
    observed.forEach((v) => {
        if (v.isConnected) return;
        io.unobserve(v);
        observed.delete(v);
    });
}

// 監視中の動画をすべて止める。画面幅やモーション設定が途中で変わり、
// 自動再生しない条件に入ったときに使う（IntersectionObserver は交差状態が
// 変わらないと発火しないので、再生中のものはこれが無いと動いたまま残る）
function pauseAll() {
    observed.forEach((v) => {
        v.removeAttribute("autoplay");
        v.pause();
    });
}

export default class{
    constructor(){
        this.run();

        onStillVideoChange(() => {
            if (prefersStillVideo()) pauseAll();
            // 自動再生する / しないが入れ替わるので controls も合わせ直す
            observed.forEach(applyControls);
        });

        // 一覧が丸ごと差し替わると、新しい <video> は誰にも監視されず
        // src が入らないまま止まってしまう。差し替え側が notifyContentUpdated() で
        // 投げる ContentUpdated を受けて、増えた分を監視に載せ直す
        window.addEventListener("ContentUpdated", (e) => {
            pruneLazyVideos();
            const container = e.detail && e.detail.container;
            observeLazyVideos(container instanceof Element ? container : document);
        });
    }
    run(){
        observeLazyVideos(document);
    }
}
