
import * as Model from "@scripts/models/";
import * as Transition from "@scripts/transitions/";
import * as Util from "@scripts/utilities/";
import * as Form from "@scripts/forms/";

const useModels = Object.keys(Model).filter( k => {
    return k;
});
const useTransitions = Object.keys(Transition).filter( k => {
    return k;
});

const useUtils = Object.keys(Util).filter( k => {
    return k;
});
const useForms = Object.keys(Form).filter( k => {
    return k;
});

const main = () => {
    useModels.forEach( model => {
        new Model[model];
    });

    useTransitions.forEach( transition => {
        new Transition[transition];
    });

    if (import.meta.env.PUBLIC_ENABLE_FORM) {
        useForms.forEach( form => {
            new Form[form];
        });
    }
    
    useUtils.forEach( util => {
        new Util[util];
    });       
};


if (document.readyState === 'loading'){
    document.addEventListener("DOMContentLoaded", main, false);
} else {
    main();
}
