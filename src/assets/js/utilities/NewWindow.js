
export default class{

	constructor(){
        this.run(document);
    }
    
    run(d){
        this.windowOpens = d.querySelectorAll('[data-window-open]');
        this.windowCloses = d.querySelectorAll('[data-window-close]');

        if(this.windowOpens.length > 0){
            this.windowOpens.forEach((wo) => {
                this.open(wo, "Window-" + Date.now(),650,800);
            });
        }
        if(this.windowCloses.length > 0){
            this.windowCloses.forEach((wc) => {
                this.close(wc);
            });
        }
    }
    open (el,name,width,height){
        if(el){
            const _name = (el.getAttribute('data-name')) ? el.getAttribute('data-name') : name;
            const _width = (el.getAttribute('data-width')) ? el.getAttribute('data-width') : width;
            const _height = (el.getAttribute('data-height')) ? el.getAttribute('data-height') : height;

            const left = (screen.availWidth - _width) / 2; 
            const top = (screen.availHeight - _height) / 2;

            const x = (el.getAttribute('data-x')) ? el.getAttribute('data-x') : left;
            const y = (el.getAttribute('data-y')) ? el.getAttribute('data-y') : top;

            el.addEventListener('click',(e) => {
                e.preventDefault();
                window.open(el.href, _name,'width='+_width+', height='+_height+',left='+x+', top='+y+', menubar=no, toolbar=no, scrollbars=yes'); return false;
            },false);
        
        }
    }
    close (el){
        el.addEventListener('click',(e) => {
            window.open('about:blank','_self').close();
        },false);
    }

}