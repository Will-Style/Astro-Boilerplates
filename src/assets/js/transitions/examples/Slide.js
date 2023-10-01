import gsap from "gsap";

export default class {

    constructor(){
        this.run();
    }
    run(){

        // ローディングの確認をしたいときはtrueに
        let debug = false;
        const keyName = 'visited';
        const keyValue = true;

        this.visited = sessionStorage.getItem(keyName);
        if ( !this.visited || debug ) {
            //sessionStorageにキーと値を追加
            sessionStorage.setItem(keyName, keyValue);
        
            //ここに初回アクセス時の処理
            // ローディングアニメーションなど
            const intro = document.querySelector("[data-intro]");
            if(intro){
                const tl = gsap.timeline();
                

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
                gsap.set('[data-intro-overlay-second]',{
                    display:"none",
                });
                const tl = gsap.timeline();
                // Fade Transtionの場合 bodyをopacity1にする
                tl.to('[data-intro-overlay-first]',{
                    opacity:0,
                    duration:.5,
                    ease:"Expo.easeInOut",

                    onComplete: ()=>{
                        gsap.set('[data-intro]',{
                            display:"none",
                        });
                    }
                });
            }
        }
        
        const links = document.querySelectorAll("a");
        
        links.forEach((link) => {

            link.addEventListener("click", (e) => {
                if(this.preventCheck(link)){
                    return; 
                }
                // ページ遷移をキャンセルする
                e.preventDefault();
                gsap.to(document.body,{
                    opacity:0,
                    duration:.3,
                    onComplete(){
                        window.location.href = link.href;
                    }
                });
            });
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
        if (attr_href.startsWith('#') ){
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
};