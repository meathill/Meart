/**
 * Created by realm on 2016/12/19.
 */
const remote = require('electron').remote;

module.exports = {
  name: 'SiteServer',
  template: '#config-template',
  data() {
    let site = remote.getGlobal('site');
    site.server = {
      name: '七牛',
      ACCESS_KEY: '',
      SECRET_KEY: ''
    };
    return site;
  }
};