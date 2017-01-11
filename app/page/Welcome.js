'use strict';

const fs = require('fs');
const _ = require('underscore');
const { ipcRenderer } = require('electron');
const MutationTypes = require('../store/mutation-types');

module.exports = {
  name: 'welcome',
  template: '#welcome-template',
  data: () => {
    return {
      siteTitle: '',
      siteDesc: '',
      siteIcon: '',
      siteTheme: 'dark',
      articles: []
    }
  },
  methods: {
    onSubmit(event) {
      console.log(this.$data);
      let data = _.pick(this.$data, [
        'siteTitle',
        'siteDesc',
        'siteIcon',
        'siteTheme',
        'articles'
      ]);
      ipcRenderer.sendSync('/site/init', data);
      _.each(data, (value, key) => {
        this.$store.commit(MutationTypes.SET_SITE_PROP, {
          key: key,
          value: value
        });
      });
      this.$router.push({
        name: 'articleList'
      });
    },
    onSelectFile(event) {
      let file = event.target.files[0];
      this.siteIcon = file.path;
    }
  }
};