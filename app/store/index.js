/**
 * Created by meathill on 2016/12/30.
 */
const { remote } = require('electron');
const mutations = require('./mutations');
const actions = require('./actions');
const getters = require('./getters');
const {assignRecursive} = require('../utils/object');

const debug = process.env.NODE_ENV !== 'production';


const state = {};
state.site = assignRecursive(remote.getGlobal('site') || {});
state.server = assignRecursive(remote.getGlobal('server') || {});
state.publish = assignRecursive(remote.getGlobal('publish') || {});

module.exports = new Vuex.Store({
  state,
  actions,
  getters,
  mutations,
  strict: debug
});