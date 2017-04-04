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
      config: _.pick(this.$store.state.site, 'siteTitle', 'siteDesc', 'siteTheme', 'siteIcon'),
      server: _.extend({}, this.$store.state.server),
      themes: null
    };
  },
  created() {
    this.findLocalThemes();
  },
  methods: {
    findLocalThemes() {
      ipcRenderer.once('list-theme', (event, themes) => {
        this.themes = themes;
      });

      ipcRenderer.send('/theme/');
    },
    onSelectFile(event) {
      this.config.siteIcon = event.target.files[0].path;
    }
  },
  beforeRouteLeave(to, from, next) {
    this.$store.commit(MutationTypes.EDIT_CONFIG, this.config);
    this.$store.commit(MutationTypes.EDIT_SERVER, this.server);
    this.$store.dispatch(ActionTypes.SAVE_SERVER);
    this.$store.dispatch(ActionTypes.SAVE);
    next();
  }
};