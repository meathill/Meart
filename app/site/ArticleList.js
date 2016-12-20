/**
 * Created by realm on 2016/12/19.
 */
const remote = require('electron').remote;

module.exports = {
  name: 'ArticleList',
  template: '#article-list-template',
  methods: {
    add: function(event) {
      this.$router.push({
        name: 'newArticle'
      });
    }
  },
  data: () => {
    let site = remote.getGlobal('site');
    site.articles = site.articles ? site.articles : [];
    return site;
  }
};