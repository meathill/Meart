/**
 * Created by realm on 2016/12/19.
 */
const Welcome = require('./Welcome');
const Site = require('./Site');
const Preview = require('./site/Preview');
const SiteConfig = require('./site/Config');
const ArticleList = require('./site/ArticleList');
const Article = require('./site/Article');

const routes = [
  {
    path: '/site',
    name: "site",
    component: Site,
    children: [
      {
        path: 'preview',
        component: Preview
      },
      {
        path: 'articles',
        name: 'articleList',
        component: ArticleList,
      },
      {
        path: 'article/:id',
        name: 'article',
        component: Article
      },
      {
        path: 'config',
        component: SiteConfig
      }
    ]
  },
  {
    path: '/welcome',
    name: "welcome",
    component: Welcome
  }
];
module.exports = new VueRouter({
  routes
});