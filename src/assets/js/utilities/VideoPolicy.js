// 動画を「動かしてよい環境か」の判定をまとめたもの。
// Hero の WebGL（DistortionPlanes）とブログ本文（Video / LazyVideo）で
// 同じ基準を使うため、ここに集約している。

// 画面幅の境界は SCSS の mq-down(lg) と揃える
const NARROW = "(max-width: 1023.98px)";
const REDUCED = "(prefers-reduced-motion: reduce)";

// poster が無いまま静止画で見せるとき、どの地点のフレームを使うか（秒）。
// 冒頭はフェードインや無地のことが多く絵として成立しないため、少し進めた位置を採る
export const STILL_FRAME_TIME = 5;

// 尺が STILL_FRAME_TIME より短い動画は真ん中あたりを使う。
// duration が取れていない（NaN / Infinity）ときは既定値のまま
export const stillFrameTime = (duration) =>
    duration && isFinite(duration) && duration < STILL_FRAME_TIME
        ? duration / 2
        : STILL_FRAME_TIME;

const media = (q) => typeof matchMedia === "function" && matchMedia(q).matches;

// ユーザーが動きを減らすよう設定している
export const prefersReducedMotion = () => media(REDUCED);

// 通信量を抑えたい状況（データセーバー、または 2G 相当の回線）。
// navigator.connection は未対応のブラウザがあるため存在チェックをする
export const prefersSaveData = () => {
    const c = navigator.connection;
    if (!c) return false;
    return Boolean(c.saveData) || /(^|-)2g$/.test(c.effectiveType || "");
};

// タブレット以下。同時にデコードできる動画の本数が少なく（超えた分は再生されない）、
// 発熱・電池・通信量のいずれも影響が大きいので自動再生はしない
export const isNarrowViewport = () => media(NARROW);

// 画面幅を除いた条件。起動時に決まり、以後変わらない前提で使える
export const prefersStillVideoBase = () => prefersReducedMotion() || prefersSaveData();

// 動画を再生せず静止画（poster、無ければ 1 フレーム目）で見せるべきか
export const prefersStillVideo = () => prefersStillVideoBase() || isNarrowViewport();

// 判定が変わったときに呼び戻す（画面幅の変更、モーション低減の切り替え）。
// 再生中の動画を止め直すために使う
export function onStillVideoChange(fn) {
    if (typeof matchMedia !== "function") return;
    [NARROW, REDUCED].forEach((q) => {
        const mq = matchMedia(q);
        // Safari 13 以前は addEventListener を持たない
        if (mq.addEventListener) mq.addEventListener("change", fn);
        else if (mq.addListener) mq.addListener(fn);
    });
}
