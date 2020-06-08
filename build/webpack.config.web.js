const {resolve} = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const base = require('./webpack.config.base');

const config = Object.assign({}, base, {
  entry: resolve(__dirname, '../src/app.js'),
  output: {
    filename: 'index.js',
    path: resolve(__dirname, '../dist/ui'),
  },
  devServer: {
    port: 8080,
  },
  plugins: base.plugins.concat([
    new HtmlWebpackPlugin({
      template: resolve(__dirname, '../src/template/index.template.html'),
    }),
  ]),
});

module.exports = config;
