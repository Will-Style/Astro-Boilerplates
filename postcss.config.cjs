module.exports = {
    plugins: [
        require( "css-mqpacker")({
            sort : require('sort-css-media-queries')
        }),
        require("autoprefixer")(),
        // require('postcss-aspect-ratio-polyfill'),
        require("css-declaration-sorter")({
            order: "smacss", // alphabetical/ smacss / concentric-css
        }),
    ],
};