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
            
            gsap.to("#page",{
                opacity: 1,
                duration:.6,
                delay: .1,
                ease:"Power4.easeOut",
                onComplete(){
                    const TransitionEnd = new CustomEvent('TransitionEnd');
                    dispatchEvent(TransitionEnd);

                
                }
            });
        }
        
        const links = document.querySelectorAll("a");
        
        links.forEach((link) => {

            link.addEventListener("click", (e) => {
                if(this.preventCheck(link)){
                    return; 
                }
                let delay = .3;
                // ページ遷移をキャンセルする
                e.preventDefault();
                if(link.getAttribute('data-drawer-close') !== null){
                    delay = 1;
                }
                // ページ遷移前のアニメーション
                gsap.to("#page",{
                    opacity:0,
                    ease:"Expo.easeInOut",
                    duration:.6,
                    delay:delay,
                    onComplete(){
                        window.location.href = link.href;
                    }
                });
            });
        });

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

    preventCheck(link){
        const href = link.href;
        // 外部リンクなら無効
        const domain = location.protocol + '//' + location.host;
        if (!href.startsWith(domain)) {
            return true;
        }
        const target = link.getAttribute('target');
        if((target == "_blank" || target == "_new") && target){
            return true;
        }
        // アンカーリンクなら無効
        const attr_href = link.getAttribute("href");
        if (attr_href.startsWith('#') || attr_href.startsWith(location.pathname + '#') || attr_href.startsWith(location.protocol + '//' + location.host + location.pathname + '#')){
            return true;
        }
        if (attr_href.startsWith('tel:') ){
            return true;
        }
        // 拡張子が該当する場合はtarget="_blank"に
        if (/\.(xlsx?|docx?|pptx?|pdf|jpe?g|png|gif|svg)/.test(href.toLowerCase())) {
            return true;
        }
        // 該当クラスに属していればBarbaを無効に
        let ignoreClasses = ["no-trans",'ab-item'];
        let r = false;
        ignoreClasses.some((cls) => {
            if(link.classList.contains(cls)){
                r = true;
            }
            return r;
        });
        return r;
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