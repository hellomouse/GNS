module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
        jest: true
    },
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    extends: ['eslint:recommended', '@hellomouse/eslint-config-wolfy1339'],
    rules: {
        indent: [
            'error',
            2
        ],
        "object-shorthand": ["error", "always"],
        "no-unneeded-ternary": "error"
    },
};
