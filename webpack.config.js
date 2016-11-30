/**
 * Created by meathill on 2016/11/27.
 */
module.exports = {
  entry: './app/index.js',
  output: {
    filename: 'bundle.js',
    path: './dist'
  },
  externals: {
    electron: 'electron'
  },
  module: {
    noParse: /vue/
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.js',
      'vue-router$': 'vue-router/dist/vue-router.js'
    }
  }
};