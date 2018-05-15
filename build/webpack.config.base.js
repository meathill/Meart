/**
 * Created by meathill on 2016/11/27.
 */
const path = require('path');

module.exports = {
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
      'src': path.resolve(__dirname, '../app'),
    },
  },
  mode: 'development',
  devtool: 'source-map',
  externals: {
    'vue': 'Vue',
    'vuex': 'Vuex',
    'vue-router': 'VueRouter',
    'handlebars': 'Handlebars',
    'moment': 'moment',
  },
};