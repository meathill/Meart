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
  computed: {
    hasPublished() {
      return false;
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

        })
    }
  },
  mixins: [moment]
};