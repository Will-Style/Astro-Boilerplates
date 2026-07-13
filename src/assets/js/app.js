
import * as Model from "@scripts/models/";
import * as Transition from "@scripts/transitions/";
import * as Util from "@scripts/utilities/";

const main = async () => {

    // 全ページ共通のモジュールは静的import（main.js本体に含まれる）
    Object.values(Model).forEach( Class => {
        new Class;
    });

    Object.values(Transition).forEach( Class => {
        new Class;
    });

    // ここから下はページ・条件ごとの動的import
    // 別チャンク（assets/js/chunks/）に分割され、該当ページでのみmain.jsが自動で読み込む

    // トップページ限定の演出（three.jsなど重いライブラリを使う場合はここへ）
    if (document.querySelector('main#top')) {
        const { default: Top } = await import("@scripts/models/Top");
        new Top;
    }

    // フォームがあるページのみVue本体ごと読み込む
    // ※utilities/Form.js がVue描画後のフォームDOMへイベントを張るため、Utilの初期化前に待つ
    if (import.meta.env.PUBLIC_ENABLE_FORM && document.querySelector('[data-form]')) {
        const Form = await import("@scripts/forms/");
        Object.values(Form).forEach( Class => {
            new Class;
        });
    }

    Object.values(Util).forEach( Class => {
        new Class;
    });
};


if (document.readyState === 'loading'){
    document.addEventListener("DOMContentLoaded", main, false);
} else {
    main();
}
