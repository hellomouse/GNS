module.exports = {
    env: {
        es6: true,
        node: true,
        browser: true,
        jest: true
    },
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true
        }
    },
    plugins: ['react'],
    extends: ['plugin:react/recommended'],
    rules: {
        'no-console': 'off'
    }
}
