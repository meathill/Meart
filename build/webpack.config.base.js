/**
 * Created by meathill on 2016/11/27.
 */
const path = require('path');
const {IgnorePlugin} = require('webpack');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const {VueLoaderPlugin} = require('vue-loader');
const hasAnalyzer = !!process.env.BUNDLE_ANALYZER;

const plugins = [
  new VueLoaderPlugin(),
  new IgnorePlugin(/^\.\/locale$/, /moment$/),
];
if (hasAnalyzer) {
  plugins.push(new BundleAnalyzerPlugin);
}

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
        test: /\.pug$/,
        use: 'pug-plain-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': path.resolve(__dirname, '../src/app'),
    },
  },
  devtool: 'sourcemap',
  mode: 'development',
  plugins,
};
