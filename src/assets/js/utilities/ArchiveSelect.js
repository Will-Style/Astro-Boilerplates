
export default class {
    constructor() {
        this.run(document);
    }
    run(d) {
        const archive_select = d.querySelector('[data-archive-select]');
        if(archive_select){
            archive_select.addEventListener('change',()=>{
                const url = archive_select.value;
                if (import.meta.env.PUBLIC_ENABLE_BARBA) {
                    const reg = new RegExp("^(https?:)?\/\/"+document.domain);
                    if (url.match(reg) || url.charAt(0) === "/") {
                        barba.go(url);
                    }else{
                        location.href = url;
                    }
                }else{
                    location.href = url;
                }
            });
        }
    }
}
