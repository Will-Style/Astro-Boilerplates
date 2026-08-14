
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);


export default class {
    constructor() {
        this.run(document);
    }
    run(d) {
        try{

            const side = d.querySelector("[data-side]");
            const header = document.querySelector('[data-header]');
            if(side){
                const links = side.querySelectorAll("a");
                // 対象セクションが実在するリンクを、生成したトリガーとセットで控えておく。
                // 末尾のフォールバック（最下部の補正）で現在地を付け直すのに使う
                const entries = [];
                if(links.length > 0){
                    links.forEach(link => {
                        const href = link.getAttribute('href');
                        if(href.startsWith("#")){

                            const el = document.querySelector(href);
                            if(el){
                                const st = ScrollTrigger.create({
                                    trigger: el,
                                    start (){
                                        return 'top top+='+ (header.clientHeight + 40);
                                    },
                                    end (){
                                        return 'bottom top+='+ (header.clientHeight + 40);
                                    },
                                    onEnter: () =>{
                                        link.classList.add(':active');
                                    },
                                    onEnterBack: () =>{
                                        link.classList.add(':active');
                                    },
                                    onLeave: () =>{
                                        link.classList.remove(':active');
                                    },
                                    onLeaveBack: () =>{
                                        link.classList.remove(':active');
                                    }
                                });
                                entries.push({ link, st });
                            }
                        }
                    });
                }

                // 最後のセクションは、判定位置（ヘッダー下）まで上がりきる前に
                // スクロールが終端に達することがある。そうなるとどの項目も現在地に
                // ならないままなので、終端に届いた時点で最後の項目を現在地にする
                const last = entries.length ? entries[entries.length - 1].link : null;
                if(last){
                    ScrollTrigger.create({
                        trigger: document.documentElement,
                        // 数値を返すとスクロール量そのものが判定位置になる（trigger の位置は使われない）。
                        // 終端ちょうどを start にすると progress が 0 のままで発動しないため、
                        // 1px 手前を始点にして終端が範囲の内側に入るようにする
                        start (){
                            const max = ScrollTrigger.maxScroll(window);
                            // スクロールできないページでは終端が先頭と同じ位置になり、
                            // 常に最後の項目が現在地になってしまうので発火させない
                            return max > 0 ? max - 1 : Number.MAX_SAFE_INTEGER;
                        },
                        end (){
                            const max = ScrollTrigger.maxScroll(window);
                            return (max > 0 ? max : Number.MAX_SAFE_INTEGER) + 1;
                        },
                        onEnter: () =>{
                            // 手前のセクションも判定位置に届いておらず現在地のまま
                            // 残ることがあるので、ここで一度すべて外す
                            entries.forEach(e => e.link.classList.remove(':active'));
                            last.classList.add(':active');
                        },
                        onLeaveBack: () =>{
                            last.classList.remove(':active');
                            // 上で一度すべて外しているため、戻ってきた先のセクションの
                            // トリガーは範囲を出ておらず onEnterBack が発火しない。
                            // スクロール位置から自分で判定して付け直す
                            const y = window.scrollY;
                            entries.forEach(({ link, st }) => {
                                if(y >= st.start && y < st.end){
                                    link.classList.add(':active');
                                }
                            });
                        }
                    });
                }

                const dark = d.querySelector("[data-is-dark]");
                if(dark){
                    ScrollTrigger.create({
                        trigger: dark,
                        start (){
                            return 'top top+='+ (header.clientHeight + 40);
                        },
                        end (){
                            return 'bottom top+='+ (header.clientHeight + 40);
                        },
                        onEnter: () =>{
                            side.classList.add(':on-dark');
                        },
                        onEnterBack: () =>{
                            side.classList.add(':on-dark');
                        },
                        onLeave: () =>{
                            side.classList.remove(':on-dark');
                        },
                        onLeaveBack: () =>{
                            side.classList.remove(':on-dark');
                        }
                    });
                }
            }
        } catch (e){
            console.log(e);
        }
    }
}
