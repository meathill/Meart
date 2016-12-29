/**
 * Created by realm on 2016/12/19.
 */
const Welcome = require('./page/Welcome');
const Site = require('./site/Site');
const Preview = require('./site/Preview');
const SiteConfig = require('./site/Config');
const ArticleList = require('./site/ArticleList');
const Article = require('./site/Article');
const Help = require('./page/Help');

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
      },
      {
        path: 'help',
        name: 'help',
        component: Help
      }
    ]
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: Welcome
  }
];
module.exports = new VueRouter({
  routes
});