

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
gsap.registerPlugin(CustomEase);

export default class{

	constructor(){
        if(!window.isTouchDevice()) {
            this.run(document);
        }
    }
    
    run(d){
        const hover_animation_links = d.querySelectorAll('[data-hover-animation]');
        if(hover_animation_links.length > 0){
            hover_animation_links.forEach(link => {
                const str = link.querySelector('[data-hover-animation-target]');
                if(str){

                    gsap.set(str , {
                        "display": "inline-flex",
                        "position": "relative",
                        "overflow": "hidden",
                        "lineHeight" : 1.3
                    });
                    if(link.getAttribute('aria-label')==null){
                        link.setAttribute('aria-label',str.textContent);
                    }
                    const html = str.innerHTML;
                    str.innerHTML = "";
                    
                    const firstEl = document.createElement('span');
                    firstEl.setAttribute('data-hover-animation-first-el',"");
                    firstEl.setAttribute('aria-hidden',"true");
                    firstEl.innerHTML = html;
                    str.appendChild(firstEl);

                    const secondEl = document.createElement('span');
                    secondEl.setAttribute('data-hover-animation-second-el',"");
                    secondEl.setAttribute('aria-hidden',"true");
                    secondEl.innerHTML = html;
                    str.appendChild(secondEl);

                    let translate = "translateY(150%)";
                    if(link.getAttribute("data-move-horizontal")){
                        translate = "translateX(-150%)";
                    }
                    gsap.set(str.querySelector("[data-hover-animation-second-el]") , {
                        "position":"absolute",
                        "top": 0,
                        "left": 0,
                        "transform" : translate,
                    });
                    

                    link.addEventListener("mouseenter",()=>{
                        this.hover_animation(link);
                    });
                    link.addEventListener("touchstart",()=>{
                        this.hover_animation(link);
                    });
                }
            });
        }
    }
    hover_animation(link){
        CustomEase.create("linkhover",".115,.405,.24,1");
        const first = link.querySelectorAll('[data-hover-animation-first-el]');
        const second = link.querySelectorAll('[data-hover-animation-second-el]');

        if(link.getAttribute("data-move-horizontal")){
            gsap.fromTo(first,
                {
                    x: "0%",
                    opacity:1,
                },
                {
                    x: "-105%",
                    opacity:0,
                    duration:.4,
                    ease: "expo.inout",
                }
            );
            gsap.fromTo(second,
                {
                    x: "105%",
                },
                {
                    x: "0%",
                    duration:.4,
                    ease: "linkhover"
                }
            );
        }else{
            gsap.fromTo(first,
                {
                    y: "0%",
                    opacity:1,
                },
                {
                    y: "-105%",
                    opacity:0,
                    duration:.6,
                    ease: "expo.inout",
                }
            );
            gsap.fromTo(second,
                {
                    y: "105%",
                },
                {
                    y: "0%",
                    duration:.4,
                    ease: "linkhover"
                }
            );
        }
    }
}