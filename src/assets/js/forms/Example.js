import barba from "@barba/core";
import Validates from "/src/assets/js/forms/Validates";
import Methods from "/src/assets/js/forms/Methods";
import { createApp,ref } from "https://unpkg.com/vue@3.4.21/dist/vue.esm-browser.prod.js";

export default class {
    // フォームのIDを指定
    id = "#example-form";
    constructor() {
        this.run(document);
    }
    run(d) {
        const form = d.querySelector(this.id);
        if(form){
            const app = createApp({
                setup(){


                    // 必須項目を設定
                    // ※編集箇所
                    const errors = ref({
                        contact_type: null,
                        name: null,
                        kana: null,
                        address: null,
                        phone: null,
                        email: null,
                        message: null,
                        items: null,
                    });

                    const methods = Methods.setup();
                    const verified = ref(false);
                    const prosessing = ref(false);
                    const isConfirm = ref(false);
                    
                    const data = ref({});

                    // 確認画面表示処理
                    const confirm = (e) => {
                        e.preventDefault();

                        if(!verified.value){
                            return false;
                        }
                        if(prosessing.value){
                            return false;
                        }
                        isConfirm.value = true;
                        const form_el = d.querySelector('[data-form]');
                        const formData = new FormData(form_el);
                        // フォームのデータをdataに代入
                        data.value = Object.fromEntries(formData.entries());
                        
                        // 複数アイテムがある場合の例
                        data.value.contact_type = formData.getAll("contact_type");
                        // 誕生日などのセレクトがある場合の例
                        data.value.birthday = formData.get("birthday.year") + "年" + formData.get("birthday.month") + "月" + formData.get("birthday.date") + "日";
                        // 任意追加項目がある場合の例
                        data.value.items = items.value;

                        methods.scrollTo(form);

                    };

                    //入力画面へ戻る処理
                    const returnInput = (e) => {
                        e.preventDefault();

                        if(prosessing.value){
                            return false;
                        }
                        isConfirm.value = false;
                        methods.scrollTo(form);
                    };

                    // 送信処理
                    const submit = (e) => {
                        e.preventDefault();

                        if(!verified.value){
                            return false;
                        }
                        if(prosessing.value){
                            return false;
                        }
                        prosessing.value = true;
                        grecaptcha.ready(function() {
                            grecaptcha.execute(import.meta.env.PUBLIC_RECAPTCHA_SITEKEY, {action: 'submit'}).then(function(token) {

                                document.querySelector("[name='recaptcha_value']").value = token;
                                
                                const form_el = d.querySelector('[data-form]');

                                // フォーム送信時にデータを編集
                                form.addEventListener('formdata', (e) => {
                                    const formData = e.formData;
                                
                                    // 配列の場合は「、」でつなげる
                                    formData.set("contact_type",data.value.contact_type.join("、"));
                                    // 誕生日などのセレクトがある場合の例
                                    formData.set("birthday",data.value.birthday);
                                    // 任意追加項目がある場合の例
                                    let items = "";
                                    data.value.items.forEach((item,index) => {
                                        items += item.name + " : " + item.count + "個";
                                        if (data.value.items.length-1 != index) items += "\n"; 
                                    });
                                    // 配列の場合は「、」でつなげる
                                    formData.set("items",items);

                                    // 削除するフィールド
                                    formData.delete("items_name");
                                    formData.delete("item_count");
                                    formData.delete("birthday.year");
                                    formData.delete("birthday.month");
                                    formData.delete("birthday.date");
                                });
                                form_el.submit();
                                form_el.reset();
                            });
                        });
                    };



                    const isValidates = () => {

                        let error = false;
                        items.value.some(item => {
                            if(item.error !==false){
                                error = true;
                                return true;
                            }
                        });
                        errors.value.items = error;

                        const isError = Object.values(errors.value).some(error => {
                            if(error!==false){
                                return true;
                            }
                        });
                        verified.value = !isError;

                    };

                    // バリデーション関連
                    const validates = Validates.setup(errors,verified,isValidates);
                    const notEmpty = validates.notEmpty;
                    const notEmail = validates.notEmail;
                    const notChecked = validates.notChecked;
                    const notCheckedAny = validates.notCheckedAny;
                    const notNum = validates.notNum;


                    
                    // 任意追加アイテムのサンプル
                    const items = ref([{
                        name: "",
                        count: 1,
                        error : null
                    }]);

                    const addItem = () => {
                        items.value.push({
                            name: "",
                            count: 1,
                            error : null
                        });
                        isValidates();
                    };

                    const removeItem = (index) => {                       
                        items.value.splice(index,1);
                        if(items.value.length < 1){
                            addItem();
                        }
                        isValidates();
                    };

                    //オリジナルのバリデーション
                    const notEmptyItem = (index) => {
                        
                        if(items.value[index].name === ""){
                            items.value[index].error = true;
                        }else{
                            items.value[index].error = false;
                        }
                        isValidates();
                    };

                    //アップロード関連のサンプル
                    const files = ref({
                        file01 : {
                            url:"",
                            name:""
                        },
                        file02 : {
                            url:"",
                            name:""
                        }
                    });

                    //アップロード完了時の処理
                    const onUpload = async (ev,name) => {
                        if(prosessing.value){
                            return false;
                        }
                        prosessing.value = true;
                        await methods.validate_upload(ev,(res) => {
                            
                            files.value[name] = res;
                            prosessing.value = false;
                            
                            if(errors.value[name] !== undefined){
                                errors.value[name] = false;
                            }
                        });
                        isValidates();
                    };

                     // ファイル削除処理
                     const unlinkFile = (url,name) => {
                        if(prosessing.value){
                            return false;
                        }
                        prosessing.value = true;
                        methods.unlink_file(url,() => {
                            files.value[name] =  {
                                url:"",
                                name:""
                            };
                            prosessing.value = false;
                            
                            if(errors.value[name] !== undefined){
                                errors.value[name] = true;
                            }
                        });
                        isValidates();
                    };


                    const params = new URLSearchParams(window.location.search);
                    const type = ref()
                    if(window.location.search){
                        type.value = params.get('type')
                        errors.value.contact_type = false
                        isValidates();
                    }

                    return {
                        verified,
                        prosessing,
                        isConfirm,

                        methods,
                        data,
                        errors,

                        notEmpty,
                        notEmail,
                        notChecked,
                        notCheckedAny,
                        notNum,
                        
                        returnInput,
                        confirm,
                        submit,

                        
                        items,
                        addItem,
                        removeItem,
                        notEmptyItem,

                        files,
                        onUpload,
                        unlinkFile,
                        type
                    };
                }
            });

            app.mount(this.id);
        }
    }
}
