/**
 * Created by meathill on 2016/12/30.
 */

const remote = require('electron').remote;
const mutations = require('./mutations');
const actions = require('./actions');
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
  mutations,
  strict: debug
});