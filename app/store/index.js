/**
 * Created by meathill on 2016/12/30.
 */

const remote = require('electron').remote;
const mutations = require('./mutations');
const actions = require('./actions');

const debug = process.env.NODE_ENV !== 'production';

const state = remote.getGlobal('site');
state.server = {
  name: '七牛',
  ACCESS_KEY: '',
  SECRET_KEY: ''
};

module.exports = new Vuex.Store({
  state,
  actions,
  mutations,
  strict: debug
});