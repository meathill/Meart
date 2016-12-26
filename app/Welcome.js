'use strict';

const fs = require('fs');
const _ = require('underscore');
const { ipcRenderer } = require('electron');

module.exports = {
  name: 'welcome',
  template: '#welcome',
  data: () => {
    return {
      siteTitle: '',
      siteDesc: '',
      siteIcon: '',
      siteTheme: 'default',
      articles: []
    }
  },
  methods: {
    onSubmit(event) {
      console.log(this.$data);
      ipcRenderer.sendSync('/site/init', _.pick(this.$data, [
        'siteTitle',
        'siteDesc',
        'siteIcon',
        'siteTheme',
        'articles'
      ]));
      this.$router.push({
        name: 'site'
      });
    },
    onSelectFile(event) {
      let file = event.target.files[0];
      this.siteIcon = file.path;
    }
  }
};