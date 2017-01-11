const remote = require('electron').remote;
const router = require('./app/Router');
const Publisher = require('./app/popup/Publish');
const Uploader = require('./app/popup/Upload');
const store = require('./app/store/index');
const { DEBUG } = require('./config/config.json');
if (DEBUG) {
  require('./app/debug/inspect-element');
}
const helpers = require('./electron/template/helpers');

const app = new Vue({
  store,
  router
}).$mount('#app');

Publisher.store = store;
const publisher = new Vue(Publisher).$mount('#publish-modal .modal-content');
Uploader.store = store;
const uploader = new Vue(Uploader).$mount('#upload-modal .modal-content');

if (remote.getGlobal('isNew')) {
  router.push({
    name: "welcome"
  });
} else {
  router.push({
    name: 'articleList'
  });
}
