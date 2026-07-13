import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        files: ['src/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module'
        },
        rules: {
            'semi': [
                'error',
                'always',
                {
                    'omitLastInOneLineBlock': true
                }
            ],
            'no-extra-semi': 'off',
            'no-undef': 'off',
            'no-empty': 'off',
            'no-unused-vars': 'off',
            'no-inner-declarations': 'off',
            'no-useless-escape': 'off'
        }
    }
];
