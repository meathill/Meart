/**
 * Created by realm on 2016/12/19.
 */

const _ = require('underscore');
const MutationTypes = require('../store/mutation-types');

module.exports = {
  name: 'config',
  template: '#config-template',
  computed: _.extend({
    siteTitle: {
      get() {
        return this.$store.state.siteTitle;
      },
      set(value) {
        this.$store.commit(MutationTypes.SET_SITE_PROP, {
          key: 'siteTitle',
          value: value
        });
      }
    },
    siteDesc: {
      get() {
        return this.$store.state.siteDesc;
      },
      set(value) {
        this.$store.commit(MutationTypes.SET_SITE_PROP, {
          key: 'siteDesc',
          value: value
        });
      }
    },
    server: {
      get() {
        return this.$store.state.server;
      },
      set(value) {
        console.log(arguments);
      }
    }
  }, Vuex.mapState([
    'siteIcon',
    'siteTheme'
  ]))
};