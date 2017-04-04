/**
 * Created by realm on 2016/12/19.
 */
const moment = require('../mixin/moment');

module.exports = {
  name: 'ArticleList',
  template: '#article-list-template',
  computed: {
    articles() {
      return this.$store.state.site.articles;
    }
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
      return '#/article/' + value;
    }
  },
  mixins: [moment]
};