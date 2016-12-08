const remote = require('electron').remote;
const Welcome = require('./app/component/Welcome');
const Site = require('./app/component/Site');

const routes = [
  {
    path: '/site',
    name: "home",
    component: Site
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
