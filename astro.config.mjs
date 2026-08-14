import { defineConfig } from 'astro/config'
import sassGlobImports from 'vite-plugin-sass-glob-import'
// import relativeLinks from 'astro-relative-links'
import htmlBeautifier from 'astro-html-beautifier';
import chokidar from 'chokidar';
import sharp from 'sharp';

import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'

const assets_path = "assets/"

// envファイルのtrueやfalseをbooleanに変換する
const envString2Boolean = () => ({
    configResolved: config => {
        const entries = Object.entries(config.env).map(([key, value]) => {
            const target = typeof value === 'string' ? value.toLowerCase() : value
            const results = {
                true: true,
                false: false,
                null: null
            }
            return [key, results[target] === undefined ? value : results[target]]
        })
    
        config.env = Object.fromEntries(entries)
        return config
    }
})


export default defineConfig({

    base:  "",
    publicDir: 'public',
    // Astro 3以降はデフォルトtrue(HTMLの改行・空白を削除)なので無効化する
    compressHTML: false,
    server: {
        open: true,
        host: true,
        port: 3000
    },
    vite: {
        // ssr: {
        //     external: ["@11ty/eleventy-img"],
        // },
        
        plugins: [
            // vite-plugin-sass-glob-import は「?direct」付き以外のクエリ付きid
            // (Astro 5 のdevが使う「?inline」など)を処理しないため、
            // クエリを除去してから渡す
            (() => {
                const base = sassGlobImports();
                return {
                    ...base,
                    transform: (src, id) => base.transform(src, id.split('?')[0])
                };
            })(),
            envString2Boolean()
        ],
        build: {
            outDir: 'dist',
            rollupOptions: {
                output: {
                    entryFileNames: `${assets_path}js/main.js`,
                    assetFileNames: (assetInfo) => {
                        let extType = assetInfo.name.split('.').pop();
                        if (/ttf|oft|eot|woff|woff2/i.test(extType)) {
                            return `${assets_path}webfonts/[name][extname]`;
                        }
                        if (/png|webp|avif|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
                            return `${assets_path}images/[name][extname]`;
                        }
                        if (/css/i.test(extType)) {
                            return `${assets_path}css/style[extname]`;
                        }
                        return `${assets_path}[name].[ext]`
                        // return `assets/${extType}/[name].[hash][extname]`;
                    }
                }
            }
        }
    },
    integrations: [
        // 相対パスにしたい場合は下記を有効にする
        // relativeLinks(),
        // htmlBeautifier(),
        ClientChunkFileNames(),
        OptimizeImage(),
        WpBlocksPreviewStyle()
        // image({
        //     cacheDir: "./.cache/image"
        // }),
    ]
});

const IMAGES_SRC = './src/assets/images'
const IMAGES_DEST = `./public/${assets_path}images`

// 拡張子抜きのパスを取得
const removeExtension = (file) => {
    const ext = path.extname(file)
    return ext ? file.slice(0, -ext.length) : file
}

// 変換で書き出されるファイルの一覧（jpg/pngはwebp/avifも生成される）
const outputFiles = (dest) => {
    const ext = path.extname(dest).toLowerCase()
    if (/^\.(jpe?g|png)$/.test(ext)) {
        return [dest, removeExtension(dest) + '.webp', removeExtension(dest) + '.avif']
    }
    return [dest]
}

// 1ファイルを圧縮してpublicへ書き出す
// jpg/pngは圧縮に加えてwebp/avifも生成し、それ以外の形式はそのままコピーする
const convertImage = async (src, dest) => {
    try {
        await fsp.mkdir(path.dirname(dest), { recursive: true })
        const ext = path.extname(src).toLowerCase()
        if (/^\.(jpe?g|png)$/.test(ext)) {
            if (ext === '.png') {
                await sharp(src).png({ quality: 95 }).toFile(dest)
            } else {
                await sharp(src).jpeg({ quality: 90 }).toFile(dest)
            }
            await sharp(src).webp({ quality: 90 }).toFile(removeExtension(dest) + '.webp')
            await sharp(src).avif({ quality: 90 }).toFile(removeExtension(dest) + '.avif')
        } else {
            await fsp.copyFile(src, dest)
        }
    } catch (err) {
        console.error(`[optimize-image] 変換に失敗しました: ${src}`, err)
    }
}

// src内の画像をまとめてpublicへ書き出す（書き出し済みのものはスキップ）
const syncImages = async () => {
    if (!fs.existsSync(IMAGES_SRC)) {
        return
    }
    const entries = await fsp.readdir(IMAGES_SRC, { recursive: true })
    for (const entry of entries) {
        // .DS_Storeなどの隠しファイルは対象外
        if (entry.split(path.sep).some(name => name.startsWith('.'))) {
            continue
        }
        const src = path.join(IMAGES_SRC, entry)
        const stat = await fsp.stat(src)
        if (!stat.isFile()) {
            continue
        }
        const dest = path.join(IMAGES_DEST, entry)
        if (outputFiles(dest).every(file => fs.existsSync(file))) {
            continue
        }
        await convertImage(src, dest)
    }
}

// devサーバ起動中はsrc内の画像を監視してpublicへ反映する
let watcher
const watchImages = () => {
    if (watcher) {
        return
    }
    const toDest = (src) => path.join(IMAGES_DEST, path.relative(IMAGES_SRC, src))
    watcher = chokidar.watch(IMAGES_SRC, { ignored: /[\/\\]\./, ignoreInitial: true })
        .on('add', (src) => convertImage(src, toDest(src)))
        .on('change', (src) => convertImage(src, toDest(src)))
        .on('unlink', async (src) => {
            for (const file of outputFiles(toDest(src))) {
                await fsp.rm(file, { force: true })
            }
        })
}

// 動的import()したモジュールの出力先を指定する
// main.jsから相対パスで自動読み込みされるため、テーマ側で参照するのはmain.jsのみでよい
// ※グローバルのrollupOptionsに書くとAstro内部のサーバービルドにも適用され、
//   クリーンアップされないゴミファイルがdistに残るため、クライアントビルド限定で設定する
function ClientChunkFileNames() {
    return {
        name: 'client-chunk-filenames',
        hooks: {
            'astro:build:setup': ({ vite, target }) => {
                if (target === 'client') {
                    vite.build.rollupOptions.output.chunkFileNames = (chunkInfo) => {
                        let name = chunkInfo.name
                        // index.jsのバレルはディレクトリ名をチャンク名にする（forms/index.js → forms）
                        if (name === 'index' && chunkInfo.facadeModuleId) {
                            name = path.basename(path.dirname(chunkInfo.facadeModuleId))
                        }
                        return `${assets_path}js/chunks/${name}.[hash].js`
                    }
                }
            }
        }
    }
}

const WP_BLOCKS_SRC = './node_modules/@wordpress/block-library/build-style/style.css'
const WP_BLOCKS_DEST = `./public/${assets_path}css/wp-blocks.css`

// WordPress標準のブロックCSSをプレビュー用にpublicへ配置する
// 本番テーマではWP本体が出力するwp-block-libraryを使うため、devサーバ時のみ配置し、
// ビルド時は削除してdistに含めない（Layout.astro側もimport.meta.env.DEVで出し分けている）
function WpBlocksPreviewStyle() {
    return {
        name: 'WordPress block style for preview',
        hooks: {
            'astro:server:start': async () => {
                if (!fs.existsSync(WP_BLOCKS_SRC)) {
                    console.warn(`[wp-blocks] ${WP_BLOCKS_SRC} が見つかりません。pnpm install を実行してください`)
                    return
                }
                await fsp.mkdir(path.dirname(WP_BLOCKS_DEST), { recursive: true })
                await fsp.copyFile(WP_BLOCKS_SRC, WP_BLOCKS_DEST)
            },
            'astro:build:start': async () => {
                await fsp.rm(WP_BLOCKS_DEST, { force: true })
            }
        }
    }
}

function OptimizeImage() {
    return {
        name: 'Optimize image from assets',
        hooks: {
            'astro:server:start': async () => {
                await syncImages()
                watchImages()
            },
            'astro:build:start': async () => {
                await syncImages()
            }
        }
    }
}
