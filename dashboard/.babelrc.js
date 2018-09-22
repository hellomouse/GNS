module.exports = {
  presets: ['@hellomouse/react-app'],
  plugins: [
    '@babel/proposal-class-properties',
    [
      '@hellomouse/named-asset-import',
      {
        loaderMap: {
          svg: {
            ReactComponent: '@svgr/webpack![path]'
          }
        }
      }
    ]
  ],
  "ignore": [
    "**/*.test.js"
  ]
}
