/**
 * Created by realm on 2016/12/19.
 */
import Welcome from '@/module/Welcome.vue';
import Home from '@/module/Home.vue';
import Preview from '@/module/site/container/Preview.vue';
import SiteConfig from '@/module/site/container/Config.vue';
import ArticleList from '@/module/article/container/ArticleList.vue';
import Article from '@/module/article/container/Article.vue';
import Help from '@/module/Help.vue';

const routes = [
  {
    path: '/admin',
    name: "home",
    component: Home,
    children: [
      {
        path: 'preview',
        name: 'preview',
        component: Preview,
      },
      {
        path: 'articles',
        name: 'article.list',
        component: ArticleList,
      },
      {
        path: 'article/:id',
        name: 'article.detail',
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
  {
    path: '/welcome',
    name: 'welcome',
    component: Welcome,
  },
  {
    path: '/(.*)',
    redirect: '/home',
  },
];
export default new VueRouter({
  mode: 'hash',
  routes,
});
