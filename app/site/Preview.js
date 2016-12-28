/**
 * Created by realm on 2016/12/19.
 */
const remote = require('electron').remote;

module.exports = {
  name: 'Preview',
  template: '#preview-template',
  data: () => {
    return remote.getGlobal('site');
  }
};