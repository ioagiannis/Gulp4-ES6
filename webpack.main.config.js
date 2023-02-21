const ESLintPlugin = require('eslint-webpack-plugin')
const path = require('path')

module.exports = {
  devtool: 'source-map',
  output: {
    filename: 'main.js',
  },
  module: {
    rules: [
      // this will apply to both plain `.js` files
      // AND `<script>` blocks in `.vue` files
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [
    new ESLintPlugin({
      failOnError: true,
      overrideConfigFile: path.resolve(__dirname, '.eslintrc.js'),
    }),
  ],
}
