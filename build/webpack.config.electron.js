const path = require('path');
const base = require('./webpack.config.base');

module.exports = Object.assign({}, base, {
  entry: path.resolve(__dirname, '../electron/index.js'),
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, '../dist'),
  },
  target: 'electron-main',
  watch: true,
  watchOptions: {
    poll: 1000,
    ignored: 'node_modules,',
  },
});