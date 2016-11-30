const remote = require('electron').remote.getGlobal('sharedObeject');
const Vue = require('vue');
const VueRouter = require('vue-router');

const NotFound = {
  template: '<p>Page not found</p>'
};
const Home = {
  template: '<p>home</p>'
};
const New = {
  template: '<p>new</p>'
};

const routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/new',
    component: New
  }
];
const router = new VueRouter({
  routes
});

const app = new Vue({
  router
}).$mount('#app');
let config = global.config;
let sites = global.remote;
