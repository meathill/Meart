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
  }
};