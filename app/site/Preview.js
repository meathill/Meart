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
      lastModifiedTime: 0,
      publishTime: 0
    };
  },
  create() {
    this.checkPreview();
    this.lastModifiedTime = remote.getGlobal('site').lastModifiedTime;
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