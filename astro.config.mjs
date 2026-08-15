import { defineConfig } from 'astro/config'
import sassGlobImports from 'vite-plugin-sass-glob-import'
// import relativeLinks from 'astro-relative-links'
import htmlBeautifier from 'astro-html-beautifier';
import chokidar from 'chokidar';
import sharp from 'sharp';

import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

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
        ExportTheme(),
        WpBlocksPreviewStyle()
        // image({
        //     cacheDir: "./.cache/image"
        // }),
    ]
});

const IMAGES_SRC = './src/assets/images'
const IMAGES_DEST = `./public/${assets_path}images`
// 各画像の原寸と生成済みの幅を記録する。マークアップ側でsrcsetやwidth/heightを組み立てるのに使う
const IMAGES_MANIFEST = './.astro/images-manifest.json'

// リサイズ対象の形式（これ以外はそのままコピーする）
const RASTER_EXT = /^\.(jpe?g|png|webp)$/
// レスポンシブ用に生成する幅の候補
const RESPONSIVE_WIDTHS = [480, 768, 1024, 1440, 1920]
// 原寸がこれ以下なら分割しない（小さい画像に複数の幅を用意しても効果がない）
const MIN_RESPONSIVE_WIDTH = 640
// 隣接する幅との差がこの比率未満なら間引く（1200pxに対する1024pxなど、転送量がほぼ変わらないもの）
const NEAR_RATIO = 0.85
// 同時に変換するファイル数
const CONCURRENCY = 4

// 拡張子抜きのパスを取得
const removeExtension = (file) => {
    const ext = path.extname(file)
    return ext ? file.slice(0, -ext.length) : file
}

// 原寸から生成すべき幅を決める。原寸を超える拡大は行わない
const planWidths = (width) => {
    if (!width || width <= MIN_RESPONSIVE_WIDTH) {
        return [width]
    }
    const candidates = RESPONSIVE_WIDTHS.filter(w => w < width)
    candidates.push(width)
    // 大きい方から見て、直前に採用した幅と近すぎるものを捨てる
    const widths = []
    for (let i = candidates.length - 1; i >= 0; i--) {
        const last = widths[widths.length - 1]
        if (last === undefined || candidates[i] < last * NEAR_RATIO) {
            widths.push(candidates[i])
        }
    }
    return widths.reverse()
}

// 元の形式から書き出す形式の一覧を返す
const formatsFor = (ext) => ext === '.webp' ? ['.webp', '.avif'] : [ext, '.webp', '.avif']

// 幅ごとの出力パス。原寸はサフィックスを付けない（既存のマークアップのパスを維持するため）
const variantPath = (dest, width, isOriginal, ext) =>
    `${removeExtension(dest)}${isOriginal ? '' : `-${width}`}${ext}`

// 変換で書き出されるファイルの一覧
const outputFiles = (dest, widths) => {
    const ext = path.extname(dest).toLowerCase()
    if (!RASTER_EXT.test(ext)) {
        return [dest]
    }
    const original = Math.max(...widths)
    return widths.flatMap(width =>
        formatsFor(ext).map(format => variantPath(dest, width, width === original, format))
    )
}

// 指定した形式でエンコードして書き出す
const encodeImage = (pipeline, format, file) => {
    if (format === '.png') return pipeline.png({ quality: 95 }).toFile(file)
    if (format === '.webp') return pipeline.webp({ quality: 85 }).toFile(file)
    if (format === '.avif') return pipeline.avif({ quality: 75 }).toFile(file)
    return pipeline.jpeg({ quality: 90 }).toFile(file)
}

// 1ファイルを幅ごとにリサイズ・圧縮してpublicへ書き出す
// jpg/png/webpはwebp/avifも生成し、それ以外の形式はそのままコピーする
const convertImage = async (src, dest) => {
    try {
        await fsp.mkdir(path.dirname(dest), { recursive: true })
        const ext = path.extname(src).toLowerCase()
        if (!RASTER_EXT.test(ext)) {
            await fsp.copyFile(src, dest)
            return
        }
        const { width: original } = await sharp(src).metadata()
        for (const width of planWidths(original)) {
            const isOriginal = width === original
            const resized = isOriginal ? sharp(src) : sharp(src).resize({ width, withoutEnlargement: true })
            for (const format of formatsFor(ext)) {
                await encodeImage(resized.clone(), format, variantPath(dest, width, isOriginal, format))
            }
        }
    } catch (err) {
        console.error(`[optimize-image] 変換に失敗しました: ${src}`, err)
    }
}

// 同時実行数を絞って順に処理する（avifのエンコードが重いため）
const runPool = async (items, worker) => {
    const queue = [...items]
    const runners = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
        while (queue.length) {
            await worker(queue.shift())
        }
    })
    await Promise.all(runners)
}

// src内の画像を走査して、マニフェストと変換が必要なファイルの一覧を作る
const scanImages = async ({ force = false } = {}) => {
    const manifest = {}
    const targets = []
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
        const key = entry.split(path.sep).join('/')
        const ext = path.extname(src).toLowerCase()
        if (!RASTER_EXT.test(ext)) {
            if (force || !fs.existsSync(dest)) {
                targets.push({ src, dest })
            }
            continue
        }
        const meta = await sharp(src).metadata().catch(() => null)
        if (!meta) {
            console.warn(`[optimize-image] 画像として読めませんでした: ${src}`)
            continue
        }
        const widths = planWidths(meta.width)
        manifest[key] = { width: meta.width, height: meta.height, widths }
        if (force || !outputFiles(dest, widths).every(file => fs.existsSync(file))) {
            targets.push({ src, dest })
        }
    }
    return { manifest, targets }
}

const writeManifest = async (manifest) => {
    await fsp.mkdir(path.dirname(IMAGES_MANIFEST), { recursive: true })
    await fsp.writeFile(IMAGES_MANIFEST, JSON.stringify(manifest, null, 4))
}

// src内の画像をまとめてpublicへ書き出す（書き出し済みのものはスキップ）
// force指定時は書き出し済みでも再変換する
const syncImages = async ({ force = false } = {}) => {
    if (!fs.existsSync(IMAGES_SRC)) {
        return
    }
    const { manifest, targets } = await scanImages({ force })
    if (targets.length) {
        console.log(`[optimize-image] ${targets.length}ファイルを変換します`)
        await runPool(targets, ({ src, dest }) => convertImage(src, dest))
    }
    await writeManifest(manifest)
}

// 削除された画像から生成されたファイル（原寸・縮小版・別形式）をまとめて消す
const removeOutputs = async (dest) => {
    const dir = path.dirname(dest)
    const base = path.basename(removeExtension(dest)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(`^${base}(-\\d+)?\\.[^.]+$`)
    const files = await fsp.readdir(dir).catch(() => [])
    for (const file of files) {
        if (pattern.test(file)) {
            await fsp.rm(path.join(dir, file), { force: true })
        }
    }
}

// devサーバ起動中はsrc内の画像を監視してpublicへ反映する
let watcher
const watchImages = () => {
    if (watcher) {
        return
    }
    const toDest = (src) => path.join(IMAGES_DEST, path.relative(IMAGES_SRC, src))
    const refresh = async (src) => {
        await convertImage(src, toDest(src))
        const { manifest } = await scanImages()
        await writeManifest(manifest)
    }
    watcher = chokidar.watch(IMAGES_SRC, { ignored: /[\/\\]\./, ignoreInitial: true })
        .on('add', refresh)
        .on('change', refresh)
        .on('unlink', async (src) => {
            await removeOutputs(toDest(src))
            const { manifest } = await scanImages()
            await writeManifest(manifest)
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

const PHP_DEST = './themes'
// コンポーネントを単体で展開するためのビルド専用ルート
const PARTS_ROUTE = '-parts'
// Layout.astroが埋めた印。ページ本体（<slot />の中身）だけを取り出す
const PAGE_PATTERN = /<!--astro-page:start-->([\s\S]*?)<!--astro-page:end-->/

const writePhp = async (file, body) => {
    await fsp.mkdir(path.dirname(file), { recursive: true })
    await fsp.writeFile(file, `${body.replace(/^\s*\n|\s+$/g, '')}\n`)
}

// ビルドしたHTMLをsrcと同じ階層のPHPとして書き出す
// componentsはAstroのタグを展開した状態、pagesはLayoutを除いた本体だけになる
function ExportTheme() {
    return {
        name: 'export-theme',
        hooks: {
            'astro:build:done': async ({ dir, routes }) => {
                const distDir = fileURLToPath(dir)
                await fsp.rm(PHP_DEST, { recursive: true, force: true })
                let pageCount = 0
                let componentCount = 0
                for (const route of routes) {
                    const outputs = [route.distURL ?? []].flat()
                    const entrypoint = (route.entrypoint ?? route.component ?? '').split(path.sep).join('/')
                    for (const output of outputs) {
                        const file = fileURLToPath(output)
                        const html = await fsp.readFile(file, 'utf8')
                        const rel = path.relative(distDir, file).split(path.sep).join('/')
                        if (rel.startsWith(`${PARTS_ROUTE}/`)) {
                            // -parts/Top/About/index.html → components/Top/About.php
                            const name = rel.slice(PARTS_ROUTE.length + 1).replace(/\/index\.html$/, '')
                            // Astroがページとして自動で付ける宣言はコンポーネントには不要
                            const body = html.replace(/^\s*<!DOCTYPE html>\s*/i, '')
                            await writePhp(path.join(PHP_DEST, 'components', `${name}.php`), body)
                            componentCount++
                            continue
                        }
                        // srcのページと同じ階層にする（src/pages/blog/single.astro → pages/blog/single.php）
                        const name = entrypoint.replace(/^src\/pages\//, '').replace(/\.astro$/, '')
                            || rel.replace(/\/index\.html$/, '').replace(/\.html$/, '')
                        const body = html.match(PAGE_PATTERN)
                        if (!body) {
                            console.warn(`[export-theme] Layoutの印が見つかりません。ページ全体を書き出します: ${name}`)
                        }
                        await writePhp(path.join(PHP_DEST, 'pages', `${name}.php`), body ? body[1] : html)
                        pageCount++
                    }
                }
                // 展開用のルートは成果物に含めない
                await fsp.rm(path.join(distDir, PARTS_ROUTE), { recursive: true, force: true })
                console.log(`[export-theme] ${pageCount}ページ / ${componentCount}コンポーネントを ${PHP_DEST} へ書き出しました`)
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

// `node astro.config.mjs --images` でビルドを走らせず画像の圧縮だけ実行する
// `--force` を付けると書き出し済みの画像も再変換する
if (process.argv.includes('--images')) {
    const force = process.argv.includes('--force')
    console.log(`[optimize-image] 画像を変換します${force ? '（強制再変換）' : ''}`)
    await syncImages({ force })
    console.log('[optimize-image] 完了しました')
}
