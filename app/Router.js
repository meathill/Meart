/**
 * Created by realm on 2016/12/19.
 */
const Welcome = require('./Welcome');
const Site = require('./Site');
const SiteSettings = require('./site/SiteSettings');
const SiteServer = require('./site/SiteServer');
const ArticleList = require('./site/ArticleList');
const Article = require('./site/Article');

const routes = [
  {
    path: '/site',
    name: "site",
    component: Site,
    children: [
      {
        path: 'settings',
        component: SiteSettings
      },
      {
        path: 'article',
        name: 'articleList',
        component: ArticleList,
      },
      {
        path: 'article/new',
        component: Article,
        name: 'newArticle'
      },
      {
        path: 'article/:id',
        component: Article
      },
      {
        path: 'server',
        component: SiteServer
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