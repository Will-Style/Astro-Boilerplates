module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },    
    "rules": {
        "semi": [
            "error",
            "always",
            {
                "omitLastInOneLineBlock": true
            }
        ],
        "prettier/prettier": "off",
        "no-extra-semi": "off",
        "no-undef": "off",
        "no-empty" :"off",
        "no-unused-vars": "off",
        "no-inner-declarations" :"off",
        "no-useless-escape": "off",
        "space-before-blocks": "off"
    }
}
