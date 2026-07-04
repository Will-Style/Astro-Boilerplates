import gsap from "gsap";

export default class {

    constructor(){
        window.addEventListener('load',()=>{
            this.run();

        });
    }
  
    run(){

        // ローディングの確認をしたいときはtrueに
        let debug = false;
        const keyName = 'visited';
        const keyValue = true;

        // this.visited = sessionStorage.getItem(keyName);
        this.visited = this.parseURL(document.referrer);
        if(document.referrer == location.href){
            debug = true;
        }
        if ( this.parseURL(document.referrer) != location.protocol + '//' + location.host || debug ) {
      
            //ここに初回アクセス時の処理
            // ローディングアニメーションなど

           
            const intro = document.querySelector("[data-intro]");
            if(intro){

                gsap.set('[data-intro]',{
                    opacity:1,
                });
                gsap.set('#page',{
                    opacity:1,
                });

                const tl = gsap.timeline();
                
                // ここにロゴアニメーションを挿入する

                tl.to('[data-intro-overlay-first]',{
                    y: "-100%",
                    duration:1,
                    delay :.5,
                    ease:"Power4.easeOut",
                    
                });
                tl.to('[data-intro-overlay-second]',{
                    delay:.3,
                    y: "-100%",
                    duration:.8,
                    ease:"Expo.easeInOut",

                    onComplete: ()=>{
                        gsap.set('[data-intro]',{
                            display:"none",
                        });
                        
                    }
                },"-=1.2");
            }
        } else {
            //ここに通常アクセス時の処理
            // ページ間のフェードは cross-document View Transitions(CSS)が担うため、
            // ここでは即時表示にする
            const intro = document.querySelector("[data-intro]");
            if(intro){

                gsap.set('[data-intro]',{
                    display:"none",
                });

            }
            const header = document.querySelectorAll('[data-header]');
            if(header){
                gsap.set(header,
                {
                    opacity: 1,
                });
            }

            gsap.set("#page",{
                opacity: 1,
            });
            const TransitionEnd = new CustomEvent('TransitionEnd');
            dispatchEvent(TransitionEnd);
        }

        // キャッシュから表示したときの挙動（ブラウザバックなど）
        window.addEventListener('pageshow', (e) => {
            if (e.persisted) {
                gsap.set("#page",{
                    "opacity" :1,
                });
                const header = document.querySelectorAll('[data-header]');
                gsap.set(header,
                {
                    opacity: 1,
                });
            }
        });
    }

    parseURL(url) {
        if(!url){
            return "";
        }
        const a=document.createElement('a');
        a.href=url;
        return a.protocol + '//' + a.host;
    }
};