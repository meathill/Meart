/**
 * Created by meathill on 2016/11/27.
 */
const path = require('path');
const webpack = require('webpack');
const dev = require('./config/dev');

module.exports = {
  entry: './app/app.js',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, './dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
    ],
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.common.js'
    }
  },
  target: 'electron-renderer',
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin(dev),
  ],
};