/**
 * Created by meathill on 2016/12/30.
 */
const mutations = require('./mutations');

const debug = process.env.NODE_ENV !== 'production';

const state = {
  lastModifiedTime: 0,
  siteTitle: '',
  siteDesc: '',
  siteTheme: '',
  siteIcon: '',
  articles: [],
  server: {
    name: '七牛',
    ACCESS_KEY: '',
    SECRET_KEY: ''
  }
};

module.exports = new Vuex.Store({
  state,
  mutations,
  strict: debug
});