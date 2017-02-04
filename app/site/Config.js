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
    serverName: {
      get() {
        return this.$store.state.server.name;
      },
      set(value) {
        this.$store.commit(MutationTypes.SET_SERVER_PROP, {
          key: 'name',
          value: value
        });
        this.$store.dispatch(ActionTypes.SAVE_SERVER);
      }
    },
    serverACCESS_KEY: {
      get() {
        return this.$store.state.server.ACCESS_KEY;
      },
      set(value) {
        this.$store.commit(MutationTypes.SET_SERVER_PROP, {
          key: 'ACCESS_KEY',
          value: value
        });
        this.$store.dispatch(ActionTypes.SAVE_SERVER);
      }
    },
    serverSECRET_KEY: {
      get() {
        return this.$store.state.server.SECRET_KEY;
      },
      set(value) {
        this.$store.commit(MutationTypes.SET_SERVER_PROP, {
          key: 'SECRET_KEY',
          value: value
        });
        this.$store.dispatch(ActionTypes.SAVE_SERVER);
      }
    },
    serverBucket: {
      get() {
        return this.$store.state.server.bucket;
      },
      set(value) {
        this.$store.commit(MutationTypes.SET_SERVER_PROP, {
          key: 'bucket',
          value: value
        });
        this.$store.dispatch(ActionTypes.SAVE_SERVER);
      }
    },
    serverHost: {
      get() {
        return this.$store.state.server.host;
      },
      set(value) {
        this.$store.commit(MutationTypes.SET_SERVER_PROP, {
          key: 'host',
          value: value
        });
        this.$store.dispatch(ActionTypes.SAVE_SERVER);
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