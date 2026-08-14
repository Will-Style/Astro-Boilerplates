import UAParser from "ua-parser-js";
import { OverlayScrollbars } from 'overlayscrollbars';

import ScrollTrigger from "gsap/ScrollTrigger";

/**
 * [data-scrollbars] を付けた要素に、OS 標準よりも細く出しっぱなしにならない
 * 横スクロールバーを当てる。記事本文の <pre><code> のように、はみ出す幅を持つ
 * ブロックを想定している。
 *
 * ページ全体（body）にも当てたい場合は constructor の run() を有効にする。
 * ネイティブのスクロールを置き換えるので、Lenis や position: sticky との
 * 相性を確認したうえで案件ごとに判断する。
 */
export default class {

    constructor() {
        // iOS のオーバーレイスクロールバーは差し替えず OS 標準のままにする
        const ua = UAParser();
        this.isIOS = ua.os.name == "iOS";

        this.scrollbar();
        // this.run(document);
    }
    run(d) {
        try{

            window.bodyScrollbars = OverlayScrollbars(d.querySelector('body'),
            {
                showNativeOverlaidScrollbars: this.isIOS,
                scrollbars:{
                    autoHide: 'scroll',
                    clickScroll: true
                },
                cancel: {
                    nativeScrollbarsOverlaid: true,
                    body: null,
                }
            },{

                updated(osInstance, onUpdatedArgs) {
                    // 高さだけが変わった（中身の入れ替えではない）ときは
                    // ScrollTrigger の計測がずれるので取り直す
                    if(onUpdatedArgs.updateHints.sizeChanged
                        && !onUpdatedArgs.updateHints.contentMutation
                        && !onUpdatedArgs.updateHints.directionChanged
                        && !onUpdatedArgs.updateHints.heightIntrinsicChanged
                        && !onUpdatedArgs.updateHints.hostMutation
                        && !onUpdatedArgs.updateHints.overflowAmountChanged
                        && !onUpdatedArgs.updateHints.overflowEdgeChanged
                        && !onUpdatedArgs.updateHints.overflowStyleChanged
                    ) {

                        ScrollTrigger.refresh();
                    }
                }
            });


        } catch (e){
            console.log(e);
        }
    }
    scrollbar(){

        const bars = document.querySelectorAll('[data-scrollbars]');
        // ハイライト等でDOMが差し替わったあとの幅で初期化させる
        setTimeout(() => {
            if(bars.length > 0){
                bars.forEach(bar => {
                    OverlayScrollbars(bar,
                    {
                        showNativeOverlaidScrollbars: this.isIOS,
                        overflow: {
                            x: 'scroll',
                        }
                    });

                });
            }
        }, 100);
    }
}
