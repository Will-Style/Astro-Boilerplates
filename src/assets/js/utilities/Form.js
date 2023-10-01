
export default class{

    onError = false;
    ajax_zip_api = "https://ajaxzip3.github.io/ajaxzip3.js";
    recaptcha_api = "https://www.google.com/recaptcha/api.js?render=";

	constructor(){

        this.append_api();
        this.zip(document);
        this.alphanum(document);
    }
	append_api (){
        const script_ajax_zip = document.createElement('script');
        script_ajax_zip.setAttribute("src", this.ajax_zip_api ); 
        document.body.appendChild(script_ajax_zip);

        const script_recaptcha = document.createElement('script');
        script_recaptcha.setAttribute("src", this.recaptcha_api + import.meta.env.PUBLIC_RECAPTCHA_SITEKEY ); 
        document.body.appendChild(script_recaptcha);
    }

    alphanum (d){
        // 全角英数を半角に変換する
        const alphanums = d.querySelectorAll('[data-form-alphanum]');

        const toHalfWidth = (str) => {
            return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
                return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
            });
        };
        if(alphanums.length > 0){
            alphanums.forEach( (input) => {
                input.setAttribute("style","ime-mode:disabled");
                input.addEventListener('blur',() => {
                    input.value = toHalfWidth(input.value);
                });
            });
        }
    }

    

    zip (d){
        const postCodeLabel = d.querySelectorAll('[data-form-zip]');
        postCodeLabel.forEach(el => {
            const name = el.getAttribute('data-form-zip');
            el.addEventListener('blur',() => {
                AjaxZip3.zip2addr( el,'',name,name);
            });
        });   
    } 

}