module.exports = {
    env: {
        es6: true,
        node: true,
        browser: true,
        jest: true
    },
    parser: 'babel-eslint',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
            
        }
    },
    settings: {
    react: {
        createClass: 'createReactClass', // Regex for Component Factory to use,
                                         // default to 'createReactClass'
        pragma: 'React',  // Pragma to use, default to 'React'
        version: '15.0', // React version, default to the latest React stable release
        flowVersion: '0.53' // Flow version
    },
    propWrapperFunctions: ['forbidExtraProps']     // The names of any functions used to wrap the
                                                   // propTypes object, e.g. `forbidExtraProps`.
                                                   // If this isn't set, any propTypes wrapped in
                                                   // a function will be skipped.
    },
    plugins: ['react', 'babel'],
    extends: ['plugin:react/recommended'],
    rules: {
        'no-console': 'off',
        'babel/semi': 1,
    }
}
