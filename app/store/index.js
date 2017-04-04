/**
 * Created by meathill on 2016/12/30.
 */
const { remote } = require('electron');
const _ = require('underscore');
const mutations = require('./mutations');
const actions = require('./actions');
const getters = require('./getters');

const debug = process.env.NODE_ENV !== 'production';

function assignRecursive(from) {
  if (!_.isArray(from) && !_.isObject(from)) {
    return from;
  }
  let to = _.isArray(from) ? from.splice() : Object.assign({}, from);
  for (let prop in from) {
    if (!from.hasOwnProperty(prop)
      || (!_.isArray(from[prop]) && !_.isObject(from[prop]))
      || _.isFunction(from[prop])) {
      continue;
    }
    to[prop] = assignRecursive(from[prop]);
  }
  return to;
}

const state = {};
state.site = assignRecursive(remote.getGlobal('site'));
state.server = assignRecursive(remote.getGlobal('server'));
state.publish = assignRecursive(remote.getGlobal('publish'));

module.exports = new Vuex.Store({
  state,
  actions,
  getters,
  mutations,
  strict: debug
});