/**
 * Created by realm on 2016/12/19.
 */
const remote = require('electron').remote;

module.exports = {
  name: 'SiteSettings',
  template: '#site-settings',
  data: () => {
    return remote.getGlobal('site');
  }
};