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
    parser: '@typescript-eslint/parser',
    plugins: [
      '@typescript-eslint',
    ],
    extends: ['eslint:recommended', '@hellomouse/typescript', '@hellomouse/wolfy1339'],
    rules: {
        "no-unused": "off",
        "@typescript-eslint/camelcase": 0,
        "indent": 'off',
        "@typescript-eslint/indent": ['error', 2, { SwitchCase: 1 }],
        "object-shorthand": ["error", "always"],
        "no-unneeded-ternary": "error",
        "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1, maxBOF: 0 }],
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/explicit-function-return-type": "off"
    },
};
