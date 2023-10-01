

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default class{
    isInit = false;
	constructor(){
        this.isInit = true;
        this.run(document);

        const sections = document.querySelectorAll('[data-scroll-trigger]');
        if( sections.length > 0 ){
            sections.forEach( el => { 
                el.classList.remove(':visible');
            });
        }
    }
    run(d){
        const strAnimations = d.querySelectorAll('[data-scroll-trigger="text"]');
        if(strAnimations.length > 0 ){
            strAnimations.forEach((el) => {
                let _str = el.textContent.split("");
                let str = "";
                _str.map( s => {
                    str += "<span data-str-animation>" + s  + "</span>";
                });
                el.setAttribute("aria-label",el.textContent);
                el.innerHTML = str;
            });
        }
        let triggered = false;

        const visible = (t) => {
            const triggerType = t.getAttribute('data-scroll-trigger');
            if(triggerType == 'text'){

                if(!triggered){
                    const strs = t.querySelectorAll('[data-str-animation]');
                    const each = t.getAttribute('data-each') ? t.getAttribute('data-each') : .03;
                    const duration = t.getAttribute('data-duration') ? t.getAttribute('data-duration') : .5;
                    const delay = t.getAttribute('data-delay') ? t.getAttribute('data-delay') : 0;
                    const y = t.getAttribute('data-y') ? t.getAttribute('data-y') : "100%";
                    const opacity = t.getAttribute('data-opacity') ? t.getAttribute('data-opacity') : 1;

                    gsap.fromTo(strs,
                        {
                            y: y,
                            opacity: opacity,
                        },
                        {
                            y: 0,
                            opacity: 1,
                            ease: "Power1.easeInOut",
                            duration : duration,
                            delay: delay,
                            stagger: { 
                                each:each,
                            },
                            onComplete(){
                                t.classList.add(':visible');
                                triggered = true;
                            }
                        }
                    );
                }
            }else{
                if(!t.classList.contains(':visible')){
                    const delay = t.getAttribute('data-delay') ? t.getAttribute('data-delay') : 0;
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
            rootMargin: "0px 0px -20% 0px",
            threshold: 0
        };
        this.observer = new IntersectionObserver(callback, observerOptions);
        const sections = d.querySelectorAll('[data-scroll-trigger]');
        if( sections.length > 0 ){
            sections.forEach( el => { 
                this.observer.observe(el);
            });
        }

    }

}