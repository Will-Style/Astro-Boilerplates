export default class {
    
    constructor() {
        
        this.run(document);
    }
    run(d) {
        const copy_years = d.querySelectorAll('[data-copy-year]');
        copy_years.forEach(c => {
            const start = parseInt(c.innerText);
            if(new Date().getFullYear() > start){
                c.innerText = start + '-' + new Date().getFullYear();
            }
        });
    }
}
