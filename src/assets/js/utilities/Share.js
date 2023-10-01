
export default class{

	constructor(){
        this.run(document);
    }
    
    run(d){
        this.shareTws = d.querySelectorAll('[data-share-tw]');
        this.shareFbs = d.querySelectorAll('[data-share-fb]');

        if(this.shareTws.length > 0){
            this.shareTws.forEach((tw) => {
                this.open(tw, "TWwindow",650,300);
            });
        }
        if(this.shareFbs.length > 0){
            this.shareFbs.forEach((fb) => {
                this.open(fb, "FBwindow",650,450);
            });
        }
    }
    open (el,name,width,height){
        if(el){
            let _name = (el.getAttribute('data-name')) ? el.getAttribute('data-name') : name;
            let _width = (el.getAttribute('data-width')) ? el.getAttribute('data-width') : width;
            let _height = (el.getAttribute('data-height')) ? el.getAttribute('data-height') : height;

            const left = (screen.availWidth - _width) / 2; 
            const top = (screen.availHeight - _height) / 2;

            const x = (el.getAttribute('data-x')) ? el.getAttribute('data-x') : left;
            const y = (el.getAttribute('data-y')) ? el.getAttribute('data-y') : top;

            el.addEventListener('click',(e) => {
                e.preventDefault();
                window.open(el.href, _name,'width='+_width+', height='+_height+',left='+x+', top='+y+', menubar=no, toolbar=no, scrollbars=yes'); return false;
            },true);
        }
    }

}