

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import CustomEase  from "gsap/CustomEase";

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(CustomEase);


export default class{
    isInit = false;
	constructor(){
        this.run(document);
    }
    run(d){
        const strAnimations = d.querySelectorAll('[data-scroll-trigger="text"]');
        if(strAnimations.length > 0 ){
            strAnimations.forEach((el) => {
                let _str = el.textContent.split("");
                let str = "";
                _str.map( s => {
                    str += "<span data-str-animation translate='no' aria-hidden='true'>" + s  + "</span>";
                });
                el.setAttribute("aria-label",el.textContent);
                el.innerHTML = str;
            });
        }
        let triggered = false;

        // observer が発火しなかった要素を救済するための待機リスト
        const pending = new Set();
        // すでに発動済みの要素（rescue と observer の二重発火を防ぐ）
        const activated = new Set();

        const visible = (t) => {
            // 一度表示したら救済対象から外す（下部デッドゾーンの二重発火を防ぐ）
            pending.delete(t);
            // 同じ要素で複数経路（rescue / observer / scroll）から呼ばれても
            // 登場アニメーションは一度きりにする（カクつき・二度動作の防止）
            if (activated.has(t)) return;
            activated.add(t);
            const triggerType = t.getAttribute('data-scroll-trigger');
            if(triggerType == 'text'){

                if(!triggered){
                    t.classList.add(':visible');
                    const strs = t.querySelectorAll('[data-str-animation]');
                    const each = t.getAttribute('data-each') ? t.getAttribute('data-each') : .02;
                    const duration = t.getAttribute('data-duration') ? t.getAttribute('data-duration') : .4;
                    const delay = t.getAttribute('data-delay') ? t.getAttribute('data-delay') : 0;
                    const y = t.getAttribute('data-y') ? t.getAttribute('data-y') : "100%";
                    const opacity = t.getAttribute('data-opacity') ? t.getAttribute('data-opacity') : 1;

                    CustomEase.create("custom", ".73,.21,.25,1.02");
                    gsap.fromTo(strs,
                        {
                            y: y,
                            opacity: opacity,
                        },
                        {
                            y: 0,
                            opacity: 1,
                            ease: "custom.easeInOut",
                            duration : duration,
                            delay: delay,
                            stagger: { 
                                each:each,
                            },
                            onComplete(){
                                triggered = true;
                            }
                        }
                    );
                }
            }else{
                if(!t.classList.contains(':visible')){
                    let delay = t.getAttribute('data-delay') ? t.getAttribute('data-delay') : 0;
                    if(!this.isInit && delay == 0) {
                        delay = 1;
                    } 
                    setTimeout(() => {
                        t.classList.add(':visible');
                    }, delay * 1000);
                }
            }

        };
        
        const callback = (entries) => {
            entries.forEach( (entry) => {

                if (entry.isIntersecting) {
                    visible(entry.target);
                }
            });
        };
        const observerOptions = {
            rootMargin: "0px 0px 0px 0px",
            threshold: 0
        };
        this.observer = new IntersectionObserver(callback, observerOptions);
        const sections = d.querySelectorAll('[data-scroll-trigger]');
        if( sections.length > 0 ){
            sections.forEach( el => {
                pending.add(el);
                this.observer.observe(el);
            });
        }

       
        // フォールバック
        // rootMargin の下辺 -20% により画面下部20%はデッドゾーンになり、
        // ページ末尾付近の要素やスクロールできない短いページの要素は
        // observer が一度も発火せず :visible が付かないことがある。
        // 画面内に入っている（＝ユーザーから見えている）のに未表示の要素を救済する。
        const rescue = () => {
            if (pending.size === 0) return;
            const vh = window.innerHeight || document.documentElement.clientHeight;
            // forEach 中に pending を変更するため配列に退避
            [...pending].forEach((el) => {
                
                const rect = el.getBoundingClientRect();
                if (rect.top < vh && rect.bottom > 0) {
                    visible(el);
                }
            });
        };
        rescue();
        window.addEventListener('load', () => {
            rescue();
            setTimeout(() => {
                this.isInit = true;
            }, 400);
        }, { passive: true });
        window.addEventListener('resize', rescue, { passive: true });
        window.addEventListener('scroll', rescue, { passive: true });
        if (window.Lenis) {
            window.Lenis.on('scroll', rescue);
        }

    }

}