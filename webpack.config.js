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
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.common.js',
      'src': path.resolve(__dirname, './app'),
    },
  },
  target: 'electron-renderer',
  devtool: 'source-map',
  watch: true,
  watchOptions: {
    poll: 1000,
    ignored: 'node_modules',
  },
  plugins: [
    new webpack.DefinePlugin(dev),
  ],
  externals: {
    'vue': 'Vue',
    'vuex': 'Vuex',
    'vue-router': 'VueRouter',
    'handlebars': 'Handlebars',
    'moment': 'moment',
  },
};