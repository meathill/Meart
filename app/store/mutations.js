/**
 * Created by meathill on 2016/12/30.
 */

const _ = require('underscore');
const types = require('./mutation-types');
const article = require('./articleInit.json');

module.exports = {
  setCurrentData(state, payload) {
    _.extend(state, payload);
  },
  [types.SET_SITE_PROP] (state, {key, value}) {
    state[key] = value;
  },
  [types.SET_SERVER_PROP] (state, payload) {
    state.server[payload.key] = payload.value;
  },

  [types.ADD_ARTICLE] (state, {id}) {
    state.articles.splice(id, 0, _.clone(article));
  },
  [types.EDIT_ARTICLE] (state, {id, key, value}) {
    state.articles[id]['lastModifiedTime'] = Date.now();
    state.articles[id][key] = value;
  },

  [types.ADD_PHOTO] (state, { id, photos }) {
    state.articles[id]['lastModifiedTime'] = Date.now();
    state.articles[id].album = state.articles[id].album.concat(photos);
  },
  [types.EDIT_PHOTO] (state, {id, index, key, value}) {
    state.articles[id]['lastModifiedTime'] = Date.now();
    state.articles[id].album[index][key] = value;
  },
  [types.REMOVE_PHOTO] (state, {id, index}) {
    state.articles[id]['lastModifiedTime'] = Date.now();
    state.articles[id].album.splice(index, 1);
  },
  [types.SELECT_PHOTO] (state, {id, index}) {
    state.articles[id].album[index].isActive = !state.articles[id].album[index].isActive;
  },

  [types.SAVED] (state, {time}) {
    state.lastModifiedTime = time;
  },

  [types.SET_PUBLISH_TIME] (state, { time }) {
    state.publishTime = time;
  }
};