
import vanillaToast from 'vanilla-toast';

export default class{

	constructor(){
        this.run(document);
    }

    run(d){
        this.shareTws = d.querySelectorAll('[data-share-tw]');
        this.shareFbs = d.querySelectorAll('[data-share-fb]');
        this.copys = d.querySelectorAll('[data-copy-url]');

        if(this.shareTws.length > 0){
            this.shareTws.forEach((tw) => {
                this.open(tw, "TWwindow",650,300);
            });
        }
        if(this.shareFbs.length > 0){
            this.shareFbs.forEach((fb) => {
                this.open(fb, "FBwindow",650,450);
            });
        }
        if(this.copys.length > 0){
            this.copys.forEach((cp) => {
                this.copy(cp);
            });
        }
    }
    open (el,name,width,height){
        if(el){
            let _name = (el.getAttribute('data-name')) ? el.getAttribute('data-name') : name;
            let _width = (el.getAttribute('data-width')) ? el.getAttribute('data-width') : width;
            let _height = (el.getAttribute('data-height')) ? el.getAttribute('data-height') : height;

            const left = (screen.availWidth - _width) / 2; 
            const top = (screen.availHeight - _height) / 2;

            const x = (el.getAttribute('data-x')) ? el.getAttribute('data-x') : left;
            const y = (el.getAttribute('data-y')) ? el.getAttribute('data-y') : top;

            el.addEventListener('click',(e) => {
                e.preventDefault();
                window.open(el.href, _name,'width='+_width+', height='+_height+',left='+x+', top='+y+', menubar=no, toolbar=no, scrollbars=yes'); return false;
            },true);
        }
    }

    copy(el){

        el.addEventListener('click',() => {
            // 属性に値があればそれを、無ければ今見ているページの URL を配る
            const url = el.getAttribute('data-copy-url') || location.href;

            this.write(url).then((ok) => {
                if(ok) vanillaToast.show('Link copied.');
                else vanillaToast.error('Copy failed.');
            });
        });
    }

    /**
     * クリップボードへ書き込む。成否を Promise<boolean> で返す。
     *
     * navigator.clipboard は「セキュアなコンテキスト」（https:// と localhost）でしか
     * 生えない。本番が SSL なら通常はこちらを通るが、http:// の検証環境や
     * LAN の IP で開いた開発サーバーでは undefined になるため execCommand へ落とす。
     * SSL 下でも、権限拒否やウィンドウが未フォーカスのときは reject し得る。
     */
    write(text){
        if(navigator.clipboard && window.isSecureContext){
            // ユーザー操作のハンドラ内から同期的に呼ぶ（await を挟むと Safari が拒否する）
            return navigator.clipboard.writeText(text)
                .then(() => true)
                .catch(() => this.legacyWrite(text));
        }
        return Promise.resolve(this.legacyWrite(text));
    }

    /**
     * 選択範囲を作ってコピーする従来の方法。非推奨の API だが、
     * navigator.clipboard が使えない環境で残された唯一の手段なので保険として持つ。
     */
    legacyWrite(text){
        const ta = document.createElement('textarea');
        ta.value = text;
        // iOS でキーボードやズームを誘発しないよう、読み取り専用かつ画面外に置く
        ta.setAttribute('readonly','');
        ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:0;opacity:0;';
        document.body.appendChild(ta);

        // ユーザーが選択していた範囲を壊さないよう、退避してから戻す
        const selection = document.getSelection();
        const selected = (selection && selection.rangeCount > 0) ? selection.getRangeAt(0) : null;

        try {
            ta.select();
            ta.setSelectionRange(0, text.length); // iOS は select() だけでは選択されない
            return document.execCommand('copy');
        } catch (e) {
            return false;
        } finally {
            ta.remove();
            if(selected){
                selection.removeAllRanges();
                selection.addRange(selected);
            }
        }
    }

}