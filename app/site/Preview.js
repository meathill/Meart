/**
 * Created by realm on 2016/12/19.
 */
const remote = require('electron').remote;
const moment = require('../mixin/moment');

module.exports = {
  name: 'Preview',
  template: '#preview-template',
  data() {
    return {
      publishTime: 0
    };
  },
  computed: {
    lastModifiedTime() {
      return this.$store.state.lastModifiedTime;
    }
  },
  create() {
    this.checkPreview();
  },
  watch:{
    '$route': 'checkPreview'
  },
  methods: {
    checkPreview() {
      fetch('output/build.json')
        .then(function (response) {
          this.publishTime = response.publishTime;
        })
        .catch(() => {
          this.publishTime = 0;
        });
    }
  },
  mixins: [moment]
};