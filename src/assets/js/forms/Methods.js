
import { defineComponent } from "vue/dist/vue.esm-browser.prod.js";

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
            const input = ev.target;
            try {
                input.style.pointerEvents = "none";
                input.style.cursor = "wait";
                const file = input.files && input.files[0];
                // ファイル選択がキャンセルされた場合は何もしない
                if(!file){
                    return false;
                }
                let accepts = input.getAttribute("accept");
                let maxsize = input.getAttribute("maxsize");
                //check file type and size requirements
                let calc = 10485760;
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
                    return false;
                }
                if (file.size > calc){
                    alert(`ファイルサイズが大きすぎます。`);
                    return false;
                }

                const fd = new FormData();
                fd.append("img", file);

                // const res = {
                //     url:"aaa.com",
                //     name:"aaa",
                // }
                // callback(res)
                // return true;
                const r = await fetch("/wp-json/ws/v1/upload-image", {
                    method: "post",
                    body: fd
                });
                if (!r.ok) {
                    throw Error(r.statusText || `HTTP ${r.status}`);
                }
                const res = await r.json();

                if (res.status) {
                    callback(res);
                    return true;
                }
                alert(`ファイルのアップロードに失敗しました。${res.msg ? "\n" + res.msg : ""}`);
                return false;
            } catch (e) {
                console.log(e);
                alert("ファイルのアップロードに失敗しました。\n通信環境をご確認のうえ、もう一度お試しください。");
                return false;
            } finally {
                // 成功・失敗にかかわらず入力欄を必ず操作可能な状態へ戻す
                input.value = "";
                input.removeAttribute("style");
            }
        };

        const unlink_file = async (url,callback) => {
            try {
                const fd = new FormData();
                fd.append("url", url);

                const r = await fetch("/wp-json/ws/v1/unlink-image", {
                    method: "post",
                    body: fd
                });
                if (!r.ok) {
                    throw Error(r.statusText || `HTTP ${r.status}`);
                }
                await r.json();

                callback();
                return true;
            } catch (e) {
                console.log(e);
                alert("ファイルの削除に失敗しました。\n通信環境をご確認のうえ、もう一度お試しください。");
                return false;
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