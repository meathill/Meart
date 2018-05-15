const path = require('path');
const base = require('./webpack.config.base');

module.exports = Object.assign({}, base, {
  entry: path.resolve(__dirname, '../app/app.js'),
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, '../dist/app'),
  },
  target: 'electron-renderer',
  devServer: {
    contentBase: path.resolve(__dirname, '../dist/app'),
    disableHostCheck: true,
    port: 9003,
  },
});