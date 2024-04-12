
import { defineComponent } from "https://unpkg.com/vue@3.4.21/dist/vue.esm-browser.prod.js";

export default defineComponent({
    setup() {
        
        const year_array = (start,end) => {
            const years = [];
            // endを指定しなければ1年前まで取得
            const endYear = (end) ? end : new Date().getFullYear() - 1;
            // startを指定しなければ80年前から取得
            const startYear = (start) ? start : endYear - 80;
            for(let i = startYear; i <= endYear; i++) {
                years.push(i);
            }
            return years;
        };
        const month_array = () => {
            return [...Array(12)].map((_, i) => i + 1);
        };
        const date_array = () => {
            return [...Array(31)].map((_, i) => i + 1);
        };

        const validate_upload = async (ev,callback) => {
            try {
                ev.target.style.pointerEvents = "none";
                ev.target.style.cursor = "wait";
                const file = ev.target.files[0];
                let accepts = ev.target.getAttribute("accept");
                let maxsize = ev.target.getAttribute("maxsize");
                //check file type and size requirements
                let calc = 5242880;
                if(maxsize && maxsize.match(/[^0-9\+\-\*\/~\(\)\{\}\.]/g) == null){
                    calc = Function('return ('+maxsize+');')();
                }
                if(accepts){
                    accepts = accepts.replace(/\s+/g, '').split(",");
                }else{
                    accepts = [
                        "image/png",
                        "image/jpeg",
                        "image/gif",
                        "application/pdf",
                    ];
                }
                if (!accepts.includes(file.type)) {
                    alert("ファイルタイプが正しくありません。");
                    ev.target.value = "";
                    ev.target.removeAttribute("style")
                    return;
                }
                if (file.size > calc){
                    alert(`ファイルサイズが大きすぎます。`);
                    ev.target.value = "";
                    ev.target.removeAttribute("style")
                    return;
                }
            
                const fd = new FormData();
                fd.append("img", file);
            
                // const res = {
                //     url:"aaa.com",
                //     name:"aaa",
                // }
                // callback(res)
                let res = await fetch("/wp-json/ws/v1/upload-image", {
                    method: "post",
                    body: fd
                })
                .then(r => {
                    if (!r.status) {
                        throw Error(r.statusText);
                    }
                    ev.target.value = "";
                    return r;
                }) 
                .then(r => r.json());
            
                if (res.status) {
                    callback(res);
                } else {
                    ev.target.removeAttribute("style")
                    alert(`Error uploading image: ${res.msg}`);
                }
            } catch (e) {
                console.log(e);
            }
        };

        const unlink_file = async (url,callback) => {
            try {
                const fd = new FormData();
                fd.append("url", url);
            
                let res = await fetch("/wp-json/ws/v1/unlink-image", {
                    method: "post",
                    body: fd
                })
                .then(r => {
                    if (!r.status) {
                        throw Error(r.statusText);
                    }
                    return r;
                }) 
                .then(r => r.json());
            
                callback();
            } catch (e) {
                console.log(e);
            }
        };

        const scrollTo = (form) => {

            const rect = form.getBoundingClientRect();
            const scrollTop = window.scrollY;
            let top = rect.top + scrollTop;
            const header = document.querySelector('[data-header]');
            if(header){
                top = top - header.clientHeight;
            }
            if(window.Lenis){
                window.Lenis.scrollTo(top);
            }else{
                window.scrollTo(0,top);
            }

        };

        return {
            year_array,
            month_array,
            date_array,
            validate_upload,
            unlink_file,
            scrollTo
        };
    }
});