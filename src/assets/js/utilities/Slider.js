
import Splide from "@splidejs/splide";

/**
 * 記事内スライダー [data-blog-slider]
 *
 * 中の [data-main-slider] を Splide でマウントし、
 * .blog__slider-progress があればプログレスバー（クリック / ドラッグで移動可）と
 * 「01 / 07」のカウンターを組み立てる。矢印はバーの左へ横並びで置く。
 */
export default class{
    constructor(){
        this.run(document);
    }
    run(d){
        const blog_sliders = d.querySelectorAll('[data-blog-slider]');
        if(blog_sliders.length > 0){
            blog_sliders.forEach(el => {

                const main = new Splide( el.querySelector('[data-main-slider]'), {
                    gap: 2,
                    fixedHeight: "max(60vh, 320px)",
                    pagination : false,
                    arrows : true,
                    drag : true,
                    autoWidth: true,
                    focus : 'center',
                    breakpoints : {
                        991 : {
                            fixedHeight: "max(40vh, 280px)",
                        },
                        640 : {
                            fixedHeight: "max(24vh, 240px)",
                        }
                    }
                });

                const progress = main.root.querySelector( '.blog__slider-progress' );
                const bar      = main.root.querySelector( '.blog__slider-progress-bar' );

                // カウンターは mount 後に生成するので、更新処理は関数にまとめておく
                let counter   = null;
                let scrubbing = false;

                const update = ( index ) => {
                    const length = main.length;
                    if ( ! length ) return;

                    const rate = 100 / length;

                    // スクラブ中はポインタ追従を優先するので、バーの位置には触らない
                    if ( bar && ! scrubbing ) {
                        bar.style.width = `${ rate }%`;
                        bar.style.left  = `${ rate * index }%`;
                    }

                    if ( counter ) {
                        // 総数の桁数に合わせてゼロ埋め（最低 2 桁）
                        const digits = Math.max( 2, String( length ).length );
                        const pad    = ( n ) => String( n ).padStart( digits, '0' );

                        counter.textContent = `${ pad( index + 1 ) } / ${ pad( length ) }`;
                    }
                };

                // プログレスバーのクリック / ドラッグ（スクラブ）でその位置のスライドへ移動
                if ( progress ) {
                    const scrub = ( e ) => {
                        const length = main.length;
                        if ( ! length ) return;

                        const rect = progress.getBoundingClientRect();
                        if ( ! rect.width ) return;

                        const ratio = Math.min( 1, Math.max( 0, ( e.clientX - rect.left ) / rect.width ) );
                        const rate  = 100 / length;

                        // バーはポインタに追従させる（バーの中央がポインタ位置）
                        if ( bar ) {
                            bar.style.width = `${ rate }%`;
                            bar.style.left  = `${ Math.min( 100 - rate, Math.max( 0, ratio * 100 - rate / 2 ) ) }%`;
                        }

                        const index = Math.min( length - 1, Math.floor( ratio * length ) );
                        if ( index !== main.index ) main.go( index );
                    };

                    progress.addEventListener( 'pointerdown', function ( e ) {
                        scrubbing = true;
                        progress.classList.add( 'is-scrubbing' );
                        progress.setPointerCapture( e.pointerId );
                        scrub( e );
                    } );

                    progress.addEventListener( 'pointermove', function ( e ) {
                        if ( ! scrubbing ) return;
                        scrub( e );
                    } );

                    const endScrub = function ( e ) {
                        if ( ! scrubbing ) return;
                        scrubbing = false;
                        progress.classList.remove( 'is-scrubbing' );

                        if ( progress.hasPointerCapture( e.pointerId ) ) {
                            progress.releasePointerCapture( e.pointerId );
                        }

                        // 指を離したら現在のスライド位置へスナップさせる
                        update( main.index );
                    };

                    progress.addEventListener( 'pointerup', endScrub );
                    progress.addEventListener( 'pointercancel', endScrub );
                }

                main.on( 'mounted move', function ( newIndex ) {
                    // move は移動先の index を受け取る。mounted は引数なしなので現在値を使う
                    update( typeof newIndex === 'number' ? newIndex : main.index );
                } );
                main.mount();

                // mount 後に生成される矢印をバーの左へ横並びで配置する。
                // breakpoints でオプションが切り替わると Splide は矢印を destroy / 再生成するので、
                // 生成のたびに再適用する必要がある
                const setupArrows = () => {
                    if ( ! progress ) return;

                    const arrows = main.root.querySelector( '.splide__arrows' );
                    if ( ! arrows ) return;

                    // controls は初回だけ作り、以降は再利用する（progress を巻き込まないため）
                    let controls = main.root.querySelector( '.blog__slider-controls' );

                    if ( ! controls ) {
                        controls = document.createElement( 'div' );
                        controls.className = 'blog__slider-controls';

                        progress.parentNode.insertBefore( controls, progress );
                        controls.appendChild( progress );
                    }

                    if ( arrows.parentNode !== controls ) {
                        controls.insertBefore( arrows, controls.firstChild );
                    }
                };

                setupArrows();

                // 'updated' は Splide 内部の作り直しより先に発火することがある（登録順依存）。
                // 'arrows:mounted' は矢印を生成した直後に必ず発火するのでこちらを使う
                main.on( 'arrows:mounted', setupArrows );

                main.on( 'updated refresh', function () {
                    update( main.index );
                } );

                // 「01 / 07」をプログレスバーの真上・右端に置く
                counter = document.createElement( 'span' );
                counter.className = 'blog__slider-counter';
                counter.setAttribute( 'aria-live', 'polite' );

                if ( progress ) {
                    progress.appendChild( counter );
                } else {
                    main.root.insertAdjacentElement( 'afterend', counter );
                }

                update( main.index );
            });
        }
    }
}
