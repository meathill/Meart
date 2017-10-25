/**
 * Created by realm on 2016/12/19.
 */
const Welcome = require('../page/Welcome.vue');
const Home = require('../Home.vue');
const Preview = require('../site/Preview.vue');
const SiteConfig = require('../site/Config.vue');
const ArticleList = require('../site/ArticleList.vue');
const Article = require('../site/Article');
const Help = require('../page/Help.vue');

const routes = [
  {
    path: '/',
    name: "home",
    component: Home,
    children: [
      {
        path: 'welcome',
        name: 'welcome',
        component: Welcome
      },
      {
        path: 'preview',
        name: 'preview',
        component: Preview,
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
      },
    ],
  },
];
export default new VueRouter({
  routes
});