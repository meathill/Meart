/**
 * Created by realm on 2016/12/19.
 */
const remote = require('electron').remote;
const moment = require('../mixin/moment');

module.exports = {
  name: 'ArticleList',
  template: '#article-list-template',
  data () {
    let site = remote.getGlobal('site');
    site.artilces = site.artilces || [];
    return site;
  },
  methods: {
    add() {
      this.$router.push({
        name: 'article',
        params: {
          id: 'new'
        }
      });
    },
    isVisible(articles) {
      return articles.filter((article) => {
        return !!article;
      });
    },
    getHref(value) {
      return '#/site/article/' + value;
    }
  },
  mixins: [moment]
};