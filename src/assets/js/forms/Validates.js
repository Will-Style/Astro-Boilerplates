
import { defineComponent } from "vue/dist/vue.esm-bundler.js";

export default defineComponent({
    setup(errors,verified,isValidates) {
        
        const notEmpty = (event) => {

            const el = ( event.target ) ?  event.target : event;
            const name = el.getAttribute('name');
            if(el.value === "" || el.value == "選択してください"){
                errors.value[name] = true;
            }else{
                errors.value[name] = false;
            }
            isValidates();
        };

        const notEmptyKana = (event) => {

            const el = ( event.target ) ?  event.target : event;
            const name = el.getAttribute('name');
           
            if(el.value === ""){
                errors.value[name] = 'empty';
            }else{
                if(el.value.match(/^[ァ-ヶー\u3000]*$/)){
                    errors.value[name] = false;
                }else{
                    errors.value[name] = 'not_kana';
                }
            }
            isValidates();
        };

         
        const notEmail = (event) => {
            const el = ( event.target ) ?  event.target : event;
            const name = el.getAttribute('name');
            
            if(el.value === ""){
                errors.value[name] = 'empty';
            }else{
                if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(el.value)){
                    errors.value[name] = false;
                }else{
                    errors.value[name] = 'not_email';
                }
            }
            isValidates();
        };

        const notChecked = (event) => {
            const el = ( event.target ) ?  event.target : event;
            const name = el.getAttribute('name');
            const item = document.querySelector('[name="'+ name +'"]:checked');
            if(item){
                errors.value[name] = false;
            }else{
                errors.value[name] = true;
            }
            isValidates();
        };

        const notCheckedAny = (event) => {
            const el = ( event.target ) ?  event.target : event;
            const name = el.getAttribute('name');
            const items = document.querySelectorAll('[name="'+ name +'"]:checked');
            if(items.length > 0){
                errors.value[name] = false;
            }else{
                errors.value[name] = true;
            }
            isValidates();
        };

        const notNum = (event) => {
            const el = ( event.target ) ?  event.target : event;
            const min = el.getAttribute("min") ? el.getAttribute("min") : 0;
            if(el.value === ""){
                el.value = min;
            }else{
                if (!/^[0-9]+$/.test(el.value)){  
                    el.value = min;
                }
                if (parseFloat(el.value) < min){  
                    el.value = min;
                }
            }
        };


        return {
            notEmpty,
            notEmptyKana,
            notEmail,
            notChecked,
            notCheckedAny,
            notNum,
            isValidates
        };
    }
});