/**
 * Created by meathill on 2016/12/30.
 */

const _ = require('underscore');
const types = require('./mutation-types');
const article = require('./articleInit.json');

module.exports = {
  [types.SET_SITE_PROP] (state, {key, value}) {
    state.site[key] = value;
  },
  [types.SET_SERVER_PROP] (state, {key, value}) {
    state.server[key] = value;
  },
  [types.EDIT_CONFIG] (state, config) {
    _.each(config, (value, key) => {
      state.site[key] = value;
    });
  },
  [types.EDIT_SERVER] (state, server) {
    _.each(server, (value, key) => {
      state.server[key] = value;
    });
  },

  [types.ADD_ARTICLE] (state, { id }) {
    let articles = state.site.articles;
    let newArticle = _.clone(article);
    newArticle.id = id;
    newArticle.createTime = Date.now();
    articles.push(newArticle);
    state.site.articles = articles;
  },
  [types.EDIT_ARTICLE] (state, {id, key, value}) {
    if (key !== 'status') {
      state.site.articles[id]['lastModifiedTime'] = Date.now();
    }
    state.site.articles[id][key] = value;
  },
  [types.SAVE_ARTICLE] (state, {id, article}) {
    article.lastModifiedTime = Date.now();
    state.site.articles.splice(id, 1, article);
  },

  [types.ADD_PHOTO] (state, { id, photos }) {
    state.site.articles[id]['lastModifiedTime'] = Date.now();
    state.site.articles[id].album = state.site.articles[id].album.concat(photos);
  },
  [types.EDIT_PHOTO] (state, {id, index, key, value}) {
    state.site.articles[id]['lastModifiedTime'] = Date.now();
    state.site.articles[id].album[index][key] = value;
  },
  [types.REMOVE_PHOTO] (state, {id, index}) {
    state.site.articles[id]['lastModifiedTime'] = Date.now();
    state.site.articles[id].album.splice(index, 1);
  },
  [types.SELECT_PHOTO] (state, {id, index}) {
    state.site.articles[id].album[index].isActive = !state.site.articles[id].album[index].isActive;
  },
  [types.SET_PHOTO_ATTR] (state, {id, index, width, height}) {
    state.site.articles[id].album[index] = _.extend(state.site.articles[id].album[index], {
      width: width,
      height: height,
      aspectRatio: width / height
    });
  },

  [types.SAVED] (state, {time}) {
    state.site.lastModifiedTime = time;
  },

  [types.SET_PUBLISH_TIME] (state, { time }) {
    state.publish.publishTime = time;
  }
};