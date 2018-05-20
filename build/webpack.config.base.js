/**
 * Created by meathill on 2016/11/27.
 */
const path = require('path');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

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
      {
        test: /\.hbs$/,
        loader: "handlebars-loader",
        query: {
          partialDirs: [
            path.resolve(__dirname, '../electron/template'),
          ],
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'src': path.resolve(__dirname, '../app'),
      'any-promise': 'promise-monofill',
    },
  },
  mode: 'development',
};