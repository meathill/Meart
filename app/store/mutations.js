/**
 * Created by meathill on 2016/12/30.
 */

const _ = require('underscore');

module.exports = {
  setCurrentData(state, payload) {
    _.extend(state, payload);
  },
  setSiteProp(state, payload) {
    state[payload.key] = payload.value;
  }
};