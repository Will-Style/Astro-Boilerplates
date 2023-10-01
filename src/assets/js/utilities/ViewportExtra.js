export default class {

    constructor(){
    
        this.run();
    }
    run (){
        const viewport = document.querySelector('meta[name="viewport"]');
        function switchViewport() {
            if(viewport){
                const value =
                    window.outerWidth >= 375
                    ? 'width=device-width,initial-scale=1'
                    : 'width=375';
                if (viewport.getAttribute('content') !== value) {
                    viewport.setAttribute('content', value);
                }
            }
        }
        addEventListener('resize', switchViewport, false);
        switchViewport();        
    }
}
