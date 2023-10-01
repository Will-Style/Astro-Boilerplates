import MicroModal from "micromodal";
import gsap from "gsap";

export default class {
    drawerLinks = [];
    opened = false;
    
    animation = {};
    hamburger_id = "[data-hamburger]";
    drawer_id = "js-drawer";
    drawer_close = "[data-drawer-close]";
    
    constructor() {
        
        this.run(document);
    }
    run(d) {
        this.body = d.body;
        this.hamburgers = d.querySelectorAll(this.hamburger_id);
        this.drawer = d.querySelector('#' + this.drawer_id);
        if(this.drawer){
            if(this.hamburgers.length > 0){
                this.hamburgers.forEach(hamburger => {
                    hamburger.addEventListener('click',(e) => {
                        this.drawerClick(d,e);
                    });
                });
            }
            this.drawerCloses = this.drawer.querySelectorAll(this.drawer_close);
            if( this.drawerCloses.length > 0 ){
                this.drawerCloses.forEach( (close) => {
                    this.drawerCloseHandler(d,close);
                });
            }

        }
    }

    drawerClick(d,e){
            
        this.drawerToggleClass(d);
    }
    drawerToggleClass(d){
        if(!this.drawer.classList.contains('is-open')){

            gsap.set(d.querySelector('[data-drawer] .modal__container'),{opacity:0});
            gsap.set(d.querySelector('[data-drawer] .l-drawer__content'),{opacity:0});
            this.open(d);

        }else{
            
            gsap.set(d.querySelector('[data-drawer] .modal__container'),{opacity:1});
            gsap.set(d.querySelector('[data-drawer] .l-drawer__content'),{opacity:1});
            
            this.close(d);
        }
    }
    drawerCloseHandler(d,drawerLink){
        drawerLink.addEventListener('click',() =>{
            if(this.opened){
                this.close(d);
            }
        },false);
    } 
    open(d){

        if(!this.opened){
            MicroModal.show(this.drawer_id,{
                onShow: () => {
                    setTimeout(() => {
                        this.expanded(true);
                        
                    }, 200);

                    this.opened = true;
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
                            },
                            onComplete:()=>{
                            }
                        }
                    );
                    d.querySelector("#js-drawer .modal__container").scrollTop = 0;
                
                }, 
                onClose: () => {
                    this.opened = false;
                    this.expanded(false);
                    window.drawerLinkClicked = false;
                
                }, 
                disableScroll: true,
                disableFocus: true,
                awaitOpenAnimation: true,
                awaitCloseAnimation: true,
            });

            
        }
    }
    close (d){
        if(this.opened){
            window.drawerLinkClicked = true;

            this.animation.pause();
            
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
                    MicroModal.close(this.drawer_id);
                    
                }
            });
        }
    }
    expanded(is){
        if(this.hamburgers.length > 0){
            this.hamburgers.forEach(hamburger => {
                hamburger.setAttribute('aria-expanded',is);
            });
        }
    }
}
