
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
                if(links.length > 0){
                    links.forEach(link => {
                        const href = link.getAttribute('href');
                        if(href.startsWith("#")){

                            const el = document.querySelector(href);
                            if(el){
                                ScrollTrigger.create({
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
                            }
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
