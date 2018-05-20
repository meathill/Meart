const path = require('path');
const base = require('./webpack.config.base');

const config = Object.assign({}, base, {
  entry: path.resolve(__dirname, '../app/app.js'),
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, '../dist/app'),
  },
  target: 'electron-renderer',
  externals: {
    'vue': 'Vue',
    'vuex': 'Vuex',
    'vue-router': 'VueRouter',
    'handlebars': 'Handlebars',
    'moment': 'moment',
  },
  devServer: {
    contentBase: path.resolve(__dirname, '../dist/app'),
    disableHostCheck: true,
    port: 9003,
  },
});
config.resolve.alias.lodash = 'lodash-es';
config.module.rules[0].options = {
  presets: [
    "env", {
      "targets": {
        "chrome": "61"
      },
    },
  ],
};

module.exports = config;