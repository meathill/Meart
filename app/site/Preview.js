/**
 * Created by realm on 2016/12/19.
 */
const moment = require('../mixin/moment');

module.exports = {
  name: 'Preview',
  template: '#preview-template',
  data() {
    return {
      height: 200
    }
  },
  computed: Vuex.mapState([
    'lastModifiedTime',
    'publishTime'
  ]),
  watch: {
    publishTime() {
      this.refresh();
    }
  },
  mounted() {
    this.history = history.length;
    this.height = window.innerHeight - this.$el.querySelector('header').offsetHeight - 16 * 3;
  },
  methods: {
    goBack() {
      this.$el.querySelector('iframe').contentWindow.history.go(-1);
    },
    refresh() {
      let iframe = this.$el.querySelector('iframe');
      if (iframe) {
        iframe.contentWindow.location.reload();
      }
    }
  },
  mixins: [moment]
};