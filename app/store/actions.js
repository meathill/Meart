/**
 * Created by meathill on 2016/12/31.
 */

const {ipcRenderer} = require('electron');
const mutations = require('./mutation-types');
const actions = require('./action-types');

module.exports = {
  [actions.SAVE] ( { state, commit }) {
    ipcRenderer.once('saved', function (time) {
      console.log('saved');
    });
    ipcRenderer.send('/site/save', JSON.stringify(state));
  }
};