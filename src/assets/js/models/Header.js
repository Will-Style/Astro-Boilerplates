
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default class {
    triggers = [];
    constructor() {
        this.run(document);
    }
    run(d) {
        const header = document.querySelector('[data-header]');
        const drawer = document.querySelector('[data-drawer]');
        
        if(header){

            header.classList.remove(':not-top');
            header.classList.remove(':is-dark');

            const not_top = d.querySelector('[data-not-top]');
            this.triggers.push(
                ScrollTrigger.create({
                    trigger: not_top,
                    start (){
                        return '-' + header.clientHeight + 'px top';
                    },
                    endTrigger: document.body,
                    onEnter: () =>{
                        header.classList.add(':not-top');
                        drawer.classList.add(':not-top');
                    },
                    onEnterBack: () =>{
                        header.classList.add(':not-top');
                        drawer.classList.add(':not-top');
                    },
                    onLeave: () =>{
                        header.classList.remove(':not-top');
                        drawer.classList.remove(':not-top');
                    },
                    onLeaveBack: () =>{
                        header.classList.remove(':not-top');
                        drawer.classList.remove(':not-top');
                    }
                })
            );
            
            const darks =  d.querySelectorAll('[data-is-dark]');
            darks.forEach(dark => {
                this.triggers.push(
                    ScrollTrigger.create({
                        trigger: dark,
                        start (){
                            return '-' + header.clientHeight + 'px top';
                        },
                        end (){
                            return 'bottom ' + header.clientHeight + 'px';
                        },
                        onEnter: () =>{
                            header.classList.add(':is-dark');
                        },
                        onEnterBack: () =>{
                            header.classList.add(':is-dark');
                        },
                        onLeave: () =>{
                            header.classList.remove(':is-dark');
                        },
                        onLeaveBack: () =>{
                            header.classList.remove(':is-dark');
                        },
                    })
                );
            });

        }
    }
}
