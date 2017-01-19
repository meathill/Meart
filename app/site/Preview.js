/**
 * Created by realm on 2016/12/19.
 */
const _ = require('underscore');
const moment = require('../mixin/moment');

module.exports = {
  name: 'Preview',
  template: '#preview-template',
  data() {
    return {
      height: 200
    }
  },
  computed: _.extend({
    hasSever() {
      let server = this.$store.state.server;
      return server.ACCESS_KEY && server.SECRET_KEY && server.bucket;
    },
    hasUpload() {
      return this.hasSever && this.publishTime;
    }
  }, Vuex.mapState([
    'lastModifiedTime',
    'publishTime'
  ])),
  watch: {
    publishTime() {
      this.refresh();
    }
  },
  mounted() {
    this.history = history.length;
    this.height = window.innerHeight - this.$el.querySelector('header').offsetHeight - 105;
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