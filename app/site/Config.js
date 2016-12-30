/**
 * Created by realm on 2016/12/19.
 */
module.exports = {
  name: 'config',
  template: '#config-template',
  computed: Vuex.mapState([
    'siteTitle',
    'siteDesc',
    'siteIcon',
    'siteTheme',
    'server'
  ])
};