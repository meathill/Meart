const remote = require('electron').remote;
const router = require('./app/Router');
const Publisher = require('./app/Publish');

const app = new Vue({
  router
}).$mount('#app');

const publisher = new Vue(Publisher).$mount('#publish-modal .modal-body');

if (remote.getGlobal('isNew')) {
  router.push({
    name: "welcome"
  });
} else {
  router.push({
    name: 'articleList'
  });
}
