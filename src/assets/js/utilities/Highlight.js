// 全言語版（highlight.js）は1MB近くあるため、主要言語のみのcommonビルドを使う
// 対応言語: https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md
import hljs from 'highlight.js/lib/common';

/**
 * [data-highlight] の中の <code> をシンタックスハイライトする。
 * 言語は <code class="language-javascript"> のように class で指定する。
 * 配色は foundation/_highlight.scss が読み込むテーマ側が持つ。
 */
export default class{

	constructor(){

        this.run(document);
    }

    run(d){
        const highlights = d.querySelectorAll("[data-highlight]");
        if(highlights.length > 0){
            highlights.forEach(el => {
                const code = el.querySelector("code");
                if(code) hljs.highlightElement(code);
            });
        }
    }
}
