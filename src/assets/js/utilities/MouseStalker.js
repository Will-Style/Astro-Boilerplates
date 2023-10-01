

export default class{

    mouseStalkerClass = "[data-mouse-stalker]";
    mouseCursorClass = "[data-mouse-stalker-cursor]";
    mouseFollowerClass = "[data-mouse-stalker-follower]";
    hoverClass = "is-hover";
    dragClass = "is-drag";
	constructor(){
        this.run(document);
       
    }
    
    run (d){        

        const stalker = d.querySelector(this.mouseStalkerClass);
        const cursor = d.querySelector(this.mouseCursorClass);
        const follower = d.querySelector(this.mouseFollowerClass);
        const links = d.querySelectorAll("a,button,input[type='submit']");
        const stalkerLinks = d.querySelectorAll("[data-stalker-link]");
        const stalkerImageLinks = d.querySelectorAll("[data-stalker-image]");

        const cursorWidth = 20;
        let mouseX = 0;
        let mouseY = 0;
        if(stalker){
            document.addEventListener('mousemove', (e) => {
                stalker.style.opacity = 1;
                mouseX = e.clientX;
                mouseY = e.clientY;
                
                cursor.style.transform = "translate(" + parseInt(mouseX - (cursorWidth / 2)) + "px," + parseInt(mouseY - (cursorWidth / 2)) + "px)";
                follower.style.transform = "translate(" + parseInt(mouseX - (cursorWidth / 2)) + "px," + parseInt(mouseY - (cursorWidth / 2)) + "px)";
            });
            const linkEnter = (el) => {
                if(stalker){
                    el.addEventListener('mouseenter', (e) => {
                        if(!stalker.classList.contains(this.dragClass)){
                            stalker.classList.add(this.hoverClass);
                        }
                    });
                }
            };
            const linkLeave = (el) => {
                if(stalker){
                    el.addEventListener('mouseleave', (e) => {
                        stalker.classList.remove(this.hoverClass);
                    });
                }
            };

        
            const addClassLinkEnter = (el) => {
                if(stalker){
                    el.addEventListener('mouseenter', (e) => {
                        const _class = el.getAttribute("data-class");
                        stalker.classList.add(_class);
                    });
                }
            };
            const addClassLinkLeave = (el) => {
                if(stalker){
                    el.addEventListener('mouseleave', (e) => {
                        const _class = el.getAttribute("data-class");
                        stalker.classList.remove(_class);
                    });
                }
            };

            const imageLinkEnter = (el) => {
                if(cursor){
                    el.addEventListener('mouseenter', (e) => {
                        this.cancel();
                        stalker.classList.add("is-image-hover");
                        const src = el.getAttribute("data-stalker-image");
                        this.loadTexture(src);
                        this.update();
                    });
                }
            };
            const imageLinkLeave = (el) => {
                if(cursor){
                    el.addEventListener('mouseleave', (e) => {
                        stalker.classList.remove("is-image-hover");
                        this.cancel();
                    });
                }
            };
            

            document.addEventListener('mouseleave', (e) => {
                if(stalker){
                    stalker.style.opacity = 0;
                }
            });
            document.addEventListener('mouseenter', (e) => {
                if(stalker){
                    stalker.style.opacity = 1;
                }
            });


            if(links.length > 0){
                links.forEach(element => {
                    linkEnter(element);
                    linkLeave(element);
                });
            }
        

            if(stalkerLinks.length > 0){
                stalkerLinks.forEach(element => {
                    addClassLinkEnter(element);
                    addClassLinkLeave(element);
                });
            }
            if(stalkerImageLinks.length > 0){
                stalkerImageLinks.forEach(element => {
                    imageLinkEnter(element);
                    imageLinkLeave(element);
                });
            }
        }
    }
  
}