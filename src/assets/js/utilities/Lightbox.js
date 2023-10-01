
export default class{

	constructor(){
       
        this.run();
    }
    run (){
        require('fslightbox');
        if(typeof refreshFsLightbox === "function"){
            refreshFsLightbox();
        }
    }
}