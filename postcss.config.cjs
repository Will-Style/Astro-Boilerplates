module.exports = {
    plugins: [
        // css-mqpacker(非推奨)の後継。メディアクエリをmobile-first順に統合・ソートする
        require("postcss-sort-media-queries")({
            sort: "mobile-first"
        }),
        require("autoprefixer")(),
        // require('postcss-aspect-ratio-polyfill'),
        require("css-declaration-sorter")({
            order: "smacss", // alphabetical/ smacss / concentric-css
        }),
    ],
};