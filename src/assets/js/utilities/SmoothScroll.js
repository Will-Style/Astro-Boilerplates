
import SmoothScroll from "smooth-scroll";

/**
 * #から始まるリンクをクリックした際にスムーススクロールを有効にする
 * リンクに[data-scroll-ignore]を付与すると無効になる
 * [data-header]を付与した要素の高さ分ずらすことが可能
 * initailScrollで初期読み込み時、Pjax遷移時にアンカーリンクの箇所まで移動する
 */
export default class{
    running = false;
    SmoothScroll; 
    options = {
        ignore: '[data-scroll-ignore]',
        header: '[data-header]',
        speed: 1000,
        speedAsDuration: true,
        offset: 0,
        easing: 'easeInOutCubic',
        updateURL: false,
    };
    lenisOptions = {
        duration: 1,
        offset: 0,
    };
	constructor(){
        this.SmoothScroll = new SmoothScroll();
        this.run();
    }
    run(){
        const smoothScrollWithoutHash = (selector) => {
            
        const clickHandler =  (event) => {
    
            let toggle = selector;
            if ( !toggle || toggle.tagName.toLowerCase() !== 'a' ) return;
            let site_url = window.location.protocol + '//' + window.location.host;
            if (!toggle.href.startsWith(site_url)) {
                return;
            }
            let digit = toggle.hash.replace(/^#/,"");
            let anchor = document.getElementById( digit );

            if ( !anchor ) return;
            if(toggle.getAttribute('data-scroll-ignore'))
                return;

            let url = location.protocol + '//' + location.host + location.pathname;
            let extract_hash = toggle.href.replace(/#.*$/,"");
            if (url !== extract_hash) {
                return;
            }
            event.preventDefault();
            if( this.running ){
                this.SmoothScroll.cancelScroll();
                return false;
            }

            if (window.Lenis) {
                window.Lenis.scrollTo(anchor , this.lenisOptions);
            }else{
                this.SmoothScroll.animateScroll( anchor, toggle, this.options );
            }

        };

        if (!window.Lenis) {
            document.addEventListener('scrollStart', () =>{ this.running = true }, false);
            document.addEventListener('scrollStop', () =>{ this.running = false }, false);
        }
        selector.addEventListener('click', clickHandler, false );
    };
    const links = document.querySelectorAll('a[href*="#"]');
    if(links.length > 0){
        links.forEach(l => {
            smoothScrollWithoutHash( l );
        });
    }

    }
    
}