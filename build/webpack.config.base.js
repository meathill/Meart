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
      lodash: 'lodash-es',
    },
  },
  mode: 'development',
  devtool: 'source-map',
};