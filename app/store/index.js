/**
 * Created by meathill on 2016/12/30.
 */
const mutations = require('./mutations');
const actions = require('./actions');
const getters = require('./getters');
let site, publish, server;
try {
  site = require('../../site/site.json');
} catch (e) {
  site = {};
}
try {
  publish = require('../../output/build.json');
} catch (e) {
  publish = {
    publishTime: 0
  };
}
try {
  server = require('../../site/server.json');
} catch (e) {
  server = {
    name: 'qiniu',
    ACCESS_KEY: '',
    SECRET_KEY: '',
    bucket: 'meart'
  };
}

const debug = process.env.NODE_ENV !== 'production';

const state = site;
state.publishTime = publish.publishTime;
state.server = server;

module.exports = new Vuex.Store({
  state,
  actions,
  getters,
  mutations,
  strict: debug
});