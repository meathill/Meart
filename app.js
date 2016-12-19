const remote = require('electron').remote;
const router = require('./app/Router');

const app = new Vue({
  router
}).$mount('#app');

if (remote.getGlobal('isNew')) {
  router.push({
    name: "welcome"
  });
} else {
  router.push({
    name: 'articleList'
  });
}
