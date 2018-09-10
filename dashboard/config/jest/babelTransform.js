const babelJest = require('babel-jest');

module.exports = babelJest.createTransformer({
  presets: [require.resolve('@hellomouse/babel-preset-react-app')]

});
