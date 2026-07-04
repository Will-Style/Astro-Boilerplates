
export default class {
    constructor() {
        this.run(document);
    }
    run(d) {
        const archive_select = d.querySelector('[data-archive-select]');
        if(archive_select){
            archive_select.addEventListener('change',()=>{
                const url = archive_select.value;
                location.href = url;
            });
        }
    }
}
