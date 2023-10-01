import { defineConfig } from 'astro/config'
import sassGlobImports from 'vite-plugin-sass-glob-import'
// import relativeLinks from 'astro-relative-links'
import htmlBeautifier from 'astro-html-beautifier';
import chokidar from 'chokidar';
import sharp from 'sharp';

import fs from 'fs'
import path from 'path'

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
            sassGlobImports(),
            envString2Boolean()
        ],
        build: {
            outDir: 'dist',
            rollupOptions: {
                input: ['src/assets/js/app.js'],
                
                output: {
                    entryFileNames: `assets/js/main.js`,
                    // chunkFileNames:  assetInfo => {
                    //     // if(assetInfo.name == "app"){
                    //     //     return `assets/js/[name].js`
                    //     // }
                    //     return `assets/js/[name].[hash].js`
                    // },
                    assetFileNames: (assetInfo) => {
                        let extType = assetInfo.name.split('.').pop();
                        if (/ttf|oft|eot|woff|woff2/i.test(extType)) {
                            return `assets/webfonts/[name][extname]`;
                        }
                        if (/png|webp|avif|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
                            return `assets/images/[name][extname]`;
                        }
                        if (/css/i.test(extType)) {
                            return `assets/css/style[extname]`;
                        }
                        return `assets/[name].[ext]`
                        // return `assets/${extType}/[name].[hash][extname]`;
                    }
                }
            }
        }
    },
    integrations: [
        // 相対パスにしたい場合は下記を有効にする
        // relativeLinks(),
        htmlBeautifier(),
        OptimizeImage()
        // image({
        //     cacheDir: "./.cache/image"
        // }),
    ]
});

const syncImages = () => {
    // 拡張子を取得
    const getExtension = (filename) => {
        const ext = path.extname(filename || '').split('.');
        return ext[ext.length - 1];
    }
    // 拡張子抜きのファイル名を取得
    const getRemovedExtension　= (filename) => {
        const pos = filename.lastIndexOf(".");
        return filename.substr(0, pos < 0 ? filename.length : pos) 
    }

   
    chokidar.watch('./src/assets/images/**/*', {ignored: /[\/\\]\./}).on('add', async (path, stats) => {
        syncDirectory("./src/assets/images","./public/assets/images")
    });
    chokidar.watch('./src/assets/images/**/*', {ignored: /[\/\\]\./}).on('change', async (path) => {
        
        syncFile(path.replace('src/assets/images/', ''),"./src/assets/images","./public/assets/images")
    });

    chokidar.watch('./src/assets/images/**/*', {ignored: /[\/\\]\./}).on('unlink', (path) => {
        const filePath = path.replace(new RegExp(/^src/, 'g'), "public");
        try {
            fs.unlinkSync(filePath);
            const RemovedExtension = getRemovedExtension(filePath);
            fs.unlinkSync(RemovedExtension + '.webp');
            fs.unlinkSync(RemovedExtension + '.avif');
        } catch(err) {
           
        }
    });

    /**
     * Copy the src folder to the dest folder
     * @param {string} src
     * @param {string} dest
     * @param {function} callback
     */
    const syncDirectory = (src, dest ,callback) => {
        const copy = (copySrc, copyDest) => {
            fs.readdir(copySrc, (err, list) => {
                if (err) {
                    callback(err);
                    return;
                }
                list.forEach((item) => {
                    const ss = path.resolve(copySrc, item);

                    fs.stat(ss, async (err, stat) => {
                        if (err) {
                            callback(err);
                        } else {
                            const curSrc = path.resolve(copySrc, item);
                            const curDest = path.resolve(copyDest, item);
                            if (stat.isFile()) {
                                
                                const extension = getExtension(item);
                                const RemovedExtension = getRemovedExtension(curDest);

                                const sharpMethod = async () => {
                                    if(/jpe?g/i.test(extension)) {

                                        await sharp(curSrc)
                                        .jpeg({quality:90})
                                        .toFile(curDest)
                                        
                                        await sharp(curSrc)
                                        .webp({quality:90})
                                        .toFile(RemovedExtension + '.webp')

                                        await sharp(curSrc)
                                        .avif({quality:90})
                                        .toFile(RemovedExtension + '.avif') 

                                    }else if(/png/i.test(extension)) {
                                        await sharp(curSrc)
                                        .png({quality:95})
                                        .toFile(curDest)
                                        
                                        await sharp(curSrc)
                                        .webp({quality:90})
                                        .toFile(RemovedExtension + '.webp')

                                        await sharp(curSrc)
                                        .avif({quality:90})
                                        .toFile(RemovedExtension + '.avif')   
                                    }else{

                                        await fs.createReadStream(curSrc).pipe(fs.createWriteStream(curDest));
                                    }
                                } 
                                if (!fs.existsSync(curDest)) {
                                    sharpMethod()
                                }
                            } else if (stat.isDirectory()) {
                                // directory, recursively
                                fs.mkdirSync(curDest, { recursive: true });
                                copy(curSrc, curDest);
                            }
                        
                        }
                    });
                })
            });
        };
    
        fs.access(dest, (err) => {
            if (err) {
                // If the target directory does not exist, create it
                fs.mkdirSync(dest, { recursive: true });
            }
            copy(src, dest);
        });
    };

    const syncFile = (item,copySrc,copyDest,callback) => {
        const curSrc = path.resolve(copySrc, item);
        const curDest = path.resolve(copyDest, item);
            
        const extension = getExtension(item);
        const RemovedExtension = getRemovedExtension(curDest);

        const ss = path.resolve(copySrc, item);

        const sharpMethod = async () => {
            if(/jpe?g/i.test(extension)) {

                await sharp(curSrc)
                .jpeg({quality:90})
                .toFile(curDest)
                
                await sharp(curSrc)
                .webp({quality:90})
                .toFile(RemovedExtension + '.webp')

                await sharp(curSrc)
                .avif({quality:90})
                .toFile(RemovedExtension + '.avif') 

            }else if(/png/i.test(extension)) {
                await sharp(curSrc)
                .png({quality:95})
                .toFile(curDest)
                
                await sharp(curSrc)
                .webp({quality:90})
                .toFile(RemovedExtension + '.webp')

                await sharp(curSrc)
                .avif({quality:90})
                .toFile(RemovedExtension + '.avif')   
            }else{

                await fs.createReadStream(curSrc).pipe(fs.createWriteStream(curDest));
            }
        } 
    

        fs.stat(ss, async (err, stat) => {
            if (err) {
                callback(err);
            } else {
                sharpMethod()
            }
        })
        
    }

    syncDirectory("./src/assets/images","./public/assets/images")
}

function OptimizeImage() {
	return {
		name: 'Optimize image from assets',
		hooks: {
            
			'astro:server:start': () => {
                syncImages()
			},
            'astro:build:start': () => {
                syncImages()
			}
		}
	}
}
