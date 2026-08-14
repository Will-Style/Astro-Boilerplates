
import * as Model from "@scripts/models/";
import * as Transition from "@scripts/transitions/";
import * as Util from "@scripts/utilities/";

// 1つのモジュールが初期化で例外を投げても、後続のモジュールの初期化を止めない。
// （まとめて forEach すると、前のクラスが落ちた時点で以降が丸ごと未初期化になる）
const init = ( Class ) => {
    try {
        new Class;
    } catch (e) {
        console.error(e);
    }
};

const main = async () => {

    // 全ページ共通のモジュールは静的import（main.js本体に含まれる）
    Object.values(Model).forEach( init );

    Object.values(Transition).forEach( init );

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
        Object.values(Form).forEach( init );
    }

    Object.values(Util).forEach( init );
};


if (document.readyState === 'loading'){
    document.addEventListener("DOMContentLoaded", main, false);
} else {
    main();
}
