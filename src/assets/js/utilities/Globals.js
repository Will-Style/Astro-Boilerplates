
export default class{
	
	constructor(){
        
        window.isTouchDevice = () => {

            const touch_event = window.ontouchstart;
            const touch_points = navigator.maxTouchPoints;
            
            if( touch_event !== undefined && 0 < touch_points ) {
                return true;
            }else{
                return false;
            }
        };
	}
    
}
