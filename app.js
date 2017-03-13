const {remote, shell} = require('electron');
const router = require('./app/Router');
const Publisher = require('./app/popup/Publish');
const Uploader = require('./app/popup/Upload');
const store = require('./app/store/index');
require('./app/system/contextMenu');
require('./electron/template/helpers');

const app = new Vue({
  data: {
    isNew: true
  },
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
  app.isNew = false;
  router.push({
    name: 'articleList'
  });
}

$('#app').click('a', (event) => {
  let href = event.target.href;
  if (/^https?:\/\//.test(href)) {
    shell.openExternal(href);
    event.preventDefault();
  }
});