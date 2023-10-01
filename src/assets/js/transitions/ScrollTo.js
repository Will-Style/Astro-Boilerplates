
export default class {

    constructor(){
        this.run();
    }
    run(){
        window.initialScroll = (d,init = false) => {
            if( location.hash ){
                const anchor = document.querySelector( location.hash );
                if(anchor){
                    const rect = anchor.getBoundingClientRect();
                    const scrollTop = window.pageYOffset;
                    let top = rect.top + scrollTop;
                    const header = document.querySelector('[data-header]');
                    let headerHeight = header.clientHeight;
                    
                    if(header){
                        top = top - headerHeight;
                    }
                    if(window.Lenis){
                        window.Lenis.scrollTo(top,this.lenisOptions);
                    }else{
                        window.scrollTo(0,top);
                    }
                }
            }
        };
        window.addEventListener("load",()=>{
            setTimeout(() => {
                window.initialScroll();
            }, 200);
        });
    }
};