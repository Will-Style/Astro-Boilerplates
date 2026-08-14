import { observeLazyVideos } from './LazyVideo';

// ブログ本文（エディタ出力）の <video> を、一覧カードと同じ遅延読み込みに揃える。
// エディタは controls 付き・src 直書き（または <source>）で出力するので、
// ここで data-lazy-video 形式に組み替えてから LazyVideo の監視に載せる。
// 自動再生しない環境で再生できなくならないよう、controls を出してよい動画である
// 印（data-video-controls）も付ける。
export default class{
    constructor(){
        this.run(document);
    }
    run(d){
        const videos = d.querySelectorAll('.blog__body video');
        if(videos.length === 0) return;

        videos.forEach(el => {
            // 自動再生する環境では邪魔なので controls は一旦外す。ただし自動再生しない
            // 環境（モバイルなど）では再生する手段が無くなってしまうため、印だけ付けて
            // おき、実際の付け外しは環境を見て LazyVideo が受け持つ
            el.removeAttribute("controls");
            el.setAttribute("data-video-controls","");
            el.setAttribute("playsinline","");
            el.setAttribute("loop","");
            el.setAttribute("muted","");
            el.muted = true; // 属性だけだと反映されない環境があるため
            // autoplay は付けない。付けると src が入った瞬間にブラウザが再生してしまい、
            // 自動再生しない環境（モバイル / 省データ / モーション低減）を素通りする。
            // 再生開始は LazyVideo が可視判定と合わせて一括で受け持つ
            el.removeAttribute("autoplay");

            // すでに遅延読み込みの形になっているものは触らない
            if (el.hasAttribute("data-lazy-video")) return;

            // src を data-src へ退避して、可視になるまで読み込ませない。
            // エディタの出力は src 直書きと <source> の両方があり得る。
            const src = el.getAttribute("src");
            if (src) {
                // src 属性があるとブラウザは <source> を見ないので、ここでも
                // src を採用して <source> は捨てる（挙動を変えないため）
                el.querySelectorAll("source").forEach(s => s.remove());
                el.removeAttribute("src");
                el.dataset.src = src;
            } else {
                // <source> は形式の出し分けなので、1 本にまとめず個別に退避する
                const sources = el.querySelectorAll("source[src]");
                if (sources.length === 0) return;
                sources.forEach(s => {
                    s.dataset.src = s.getAttribute("src");
                    s.removeAttribute("src");
                });
            }
            el.preload = "none";
            el.setAttribute("data-lazy-video","");
            // src を外しただけでは、パース時に始まった取得（既定は preload="metadata"）が
            // 止まらない。load() を呼んで読み込みを打ち切る
            el.load();
        });

        // 初期化順に依存しないよう、ここで監視に載せる（二重登録はされない）
        observeLazyVideos(d);
    }
}
