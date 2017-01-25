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
      articles: [
        {
          id: 0,
          title: '你好，世界',
          description: '这是一个范例，你可以通过它简单了解一下 Meart',
          status: 1,
          thumbnail: 'http://blog.meathill.com/wp-content/uploads/2017/01/IMG_2629.jpg',
          url: 'sample',
          tags: '',
          album: [
            {
              src: 'http://blog.meathill.com/wp-content/uploads/2017/01/IMG_2629.jpg',
              title: '台北省城隍庙',
              description: '你也来了，好，欢迎'
            }
          ]
        }
      ]
    }
  },
  methods: {
    onSubmit(event) {
      let data = _.pick(this.$data, [
        'siteTitle',
        'siteDesc',
        'siteIcon',
        'siteTheme',
        'articles'
      ]);
      data.articles[0].createTime = data.articles[0].lastModifiedTime = Date.now();
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