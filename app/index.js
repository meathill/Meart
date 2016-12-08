const remote = require('electron').remote;
const Welcome = require('./app/component/Welcome');

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
    path: '/site',
    name: "home",
    component: Home
  },
  {
    path: '/welcome',
    name: "welcome",
    component: Welcome
  }
];
const router = new VueRouter({
  routes
});

const app = new Vue({
  router
}).$mount('#app');

if (remote.getGlobal('isNew')) {
  router.push({
    name: "welcome"
  });
} else {
  router.push({
    name: 'home'
  })
}
