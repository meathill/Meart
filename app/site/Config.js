/**
 * Created by realm on 2016/12/19.
 */

const { ipcRenderer } = require('electron');
const _ = require('underscore');
const MutationTypes = require('../store/mutation-types');
const ActionTypes = require('../store/action-types');

module.exports = {
  name: 'config',
  template: '#config-template',
  data() {
    return {
      themes: null
    };
  },
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
        this.$store.dispatch(ActionTypes.SAVE);
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
        this.$store.dispatch(ActionTypes.SAVE);
      }
    },
    siteTheme: {
      get() {
        return this.$store.state.siteTheme;
      },
      set(value) {
        this.$store.commit(MutationTypes.SET_SITE_PROP, {
          key: 'siteTheme',
          value: value
        });
        this.$store.dispatch(ActionTypes.SAVE);
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
    'siteIcon'
  ])),
  created() {
    this.findLocalThemes();
  },
  methods: {
    findLocalThemes() {
      ipcRenderer.once('list-theme', (event, themes) => {
        this.themes = themes;
      });

      ipcRenderer.send('/theme/');
    }
  }
};