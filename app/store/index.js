/**
 * Created by meathill on 2016/12/30.
 */

const { remote } = require('electron');
const mutations = require('./mutations');
const actions = require('./actions');
const getters = require('./getters');
let publish;
try {
  publish = require('../../output/build.json');
} catch (e) {
  publish = {
    publishTime: 0
  };
}

const debug = process.env.NODE_ENV !== 'production';

const state = remote.getGlobal('site');
state.publishTime = publish.publishTime;
state.server = {
  name: '七牛',
  ACCESS_KEY: '',
  SECRET_KEY: ''
};

module.exports = new Vuex.Store({
  state,
  actions,
  getters,
  mutations,
  strict: debug
});