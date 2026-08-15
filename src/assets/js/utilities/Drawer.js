import gsap from "gsap";

/**
 * グローバルメニュー（ドロワー）の開閉
 *
 * ネイティブ <dialog> の showModal() を使うので、フォーカストラップ・Esc・背景の inert 化・
 * 暗幕（::backdrop）はブラウザに任せる。ここが持つのは「いつ開く／閉じるか」と GSAP の出入りだけ。
 *
 * 閉じるときは out アニメーションを最後まで再生してから dialog.close() を呼ぶ。
 * [open] は閉じ切るまで付いたままなので、CSS 側の out 用フックとして is-closing を別に付ける。
 */
const CLOSING_CLASS = 'is-closing';

// 指・マウスで開いたことを表すフラグ（html に付ける）。
// showModal() は dialog 内の autofocus 要素へブラウザがフォーカスを移すため、
// 環境によってはタップで開いただけでもハンバーガーにフォーカスリングが出る。
// その抑制だけに使い、キーが押された時点で外す（キーボードで辿ってきた人には出す）
const POINTER_CLASS = 'is-pointer-open';

export default class {
    opened = false;
    closing = false;

    animation = {};
    hamburger_id = "[data-hamburger]";
    drawer_id = "js-drawer";
    drawer_close = "[data-drawer-close]";

    constructor() {

        this.run(document);
    }
    run(d) {
        this.body = d.body;
        // 同じ関数を渡すので、開くたびに登録しても二重には積まれない
        this.clearPointerOpen = () => d.documentElement.classList.remove(POINTER_CLASS);
        this.hamburgers = d.querySelectorAll(this.hamburger_id);
        this.drawer = d.querySelector('#' + this.drawer_id);
        if(this.drawer){
            this.scroller = this.drawer.querySelector('[data-drawer-container]');

            if(this.hamburgers.length > 0){
                this.hamburgers.forEach(hamburger => {
                    hamburger.addEventListener('click',(e) => {
                        this.drawerClick(d,e);
                    });
                });
            }
            this.drawerCloses = d.querySelectorAll(this.drawer_close);
            if( this.drawerCloses.length > 0 ){
                this.drawerCloses.forEach( (close) => {
                    this.drawerCloseHandler(d,close);
                });
            }

            // 暗幕（::backdrop）のクリックは dialog 自身が target になる。
            // 中身は [data-drawer-container] が埋めているので、これで暗幕クリックだけを拾える
            this.drawer.addEventListener('click', (e) => {
                if(e.target === this.drawer){
                    this.close(d);
                }
            });

            // Esc。既定の即閉じを止めて、他の経路と同じ out アニメーションを通す
            this.drawer.addEventListener('cancel', (e) => {
                e.preventDefault();
                this.close(d);
            });

            // 閉じ切ったあとの後始末はここに一本化する
            this.drawer.addEventListener('close', () => {
                this.opened = false;
                this.closing = false;
                this.drawer.classList.remove(CLOSING_CLASS);
                this.expanded(false);
                if(this.scroller) this.scroller.scrollTo(0,0);
                window.Lenis?.start();
            });

        }
    }

    drawerClick(d,e){
        // キーボード（Enter / Space）から起きた click は detail が 0 になる
        this.pointerOpen = Boolean(e && e.detail);
        this.drawerToggleClass(d);
    }
    drawerToggleClass(d){
        if(!this.drawer.open){

            this.open(d);

        }else{

            this.close(d);
        }
    }
    drawerCloseHandler(d,drawerLink){
        // capture で拾うのは、同ページ内アンカーを処理する utilities/SmoothScroll.js の
        // click ハンドラ（Lenis.scrollTo を呼ぶ）より先に close() を走らせるため。
        // 停止中の Lenis は scrollTo を無視するので、先に start() まで戻しておく必要がある
        drawerLink.addEventListener('click',() =>{
            if(this.opened){
                this.close(d);
            }
        },true);
    }
    open(d){

        if(!this.opened){
            this.drawer.classList.remove(CLOSING_CLASS);
            // showModal() より前に決めておく（フォーカスは開いた時点で移るため）
            this.pointerFocus(d);
            this.drawer.showModal();
            this.opened = true;
            this.expanded(true);

            // 開いている間は背景を動かさない（Lenis 無効時は CSS の html:has(.l-drawer[open]) が受け持つ）
            window.Lenis?.stop();

            const items = this.drawer.querySelectorAll('[data-drawer-items]');
            if(items.length > 0){
                this.animation = gsap.fromTo(
                    '[data-drawer-items]',
                    {
                        "opacity": 0,
                        "y": "20px"
                    },
                    {
                        "opacity": 1,
                        "y": 0,
                        delay:.3,
                        duration: .6,
                        ease: "Power1.easeOut",
                        stagger :{
                            each : .04
                        }
                    }
                );
            }
            const fades = this.drawer.querySelectorAll('[data-drawer-items-fade]');
            if(fades.length > 0){
                 gsap.fromTo(
                    '[data-drawer-items-fade]',
                    {
                        "opacity": 0,
                    },
                    {
                        "opacity": 1,
                        delay:.3,
                        duration: .4,
                        ease: "Power1.easeOut",
                        stagger :{
                            each : .02
                        },
                    }
                );
            }
        }
    }
    close (d){
        if(this.opened && !this.closing){
            this.closing = true;
            this.drawer.classList.add(CLOSING_CLASS);

            // スクロールの復帰は閉じ切るのを待たずここで行う。
            // Lenis.stop() は html に .lenis-stopped（overflow: hidden）を付けるので、
            // 付いたままだと同ページ内アンカーのクリックでブラウザがスクロールできない
            window.Lenis?.start();

            this.animation.pause();

            const items = this.drawer.querySelectorAll('[data-drawer-items]');
            if(items.length > 0){
                gsap.fromTo(
                    '[data-drawer-items]',
                {
                    "opacity": 1,
                    "y": "0px"
                },
                {
                    "opacity": 0,
                    "y": "-20px",
                    ease: "Power1.easeOut",
                    duration: .3,
                    stagger :{
                        each : .002
                    },
                    onComplete:()=>{
                        this.drawer.close();

                    }
                });
            }

            const fades = this.drawer.querySelectorAll('[data-drawer-items-fade]');
            if(fades.length > 0){
                gsap.fromTo(
                    '[data-drawer-items-fade]',
                {
                    "opacity": 1,
                },
                {
                    "opacity": 0,
                    ease: "Power1.easeOut",
                    duration: .3,
                    stagger :{
                        each : .01
                    },
                });
            }
        }
    }
    // 自動フォーカスのリングを出すかどうかを html のクラスで伝える。
    // キーを触った時点で外れるので、Tab で辿ってきたときのリングは残る
    pointerFocus(d){
        if(!this.pointerOpen){
            this.clearPointerOpen();
            return;
        }
        d.documentElement.classList.add(POINTER_CLASS);
        d.addEventListener('keydown', this.clearPointerOpen, { once: true });
    }
    expanded(is){
        if(this.hamburgers.length > 0){
            this.hamburgers.forEach(hamburger => {
                hamburger.setAttribute('aria-expanded',is);
            });
        }
    }
}
