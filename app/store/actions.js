/**
 * Created by meathill on 2016/12/31.
 */

const {ipcRenderer} = require('electron');
const mutations = require('./mutation-types');
const actions = require('./action-types');

module.exports = {
  [actions.SAVE] ( { state, commit }) {
    ipcRenderer.once('saved', time => {
      console.log('saved');
      commit(mutations.SAVED, time);
    });
    ipcRenderer.send('/site/save', state.site);
  },

  [actions.SAVE_SERVER] ( { state }) {
    ipcRenderer.once('saved', () => {
      console.log('server saved');
    });
    ipcRenderer.send('/server/save', state.server);
  }
};