import App from 'App.vue';
import router from './Router';
import store from './store';

const app = new Vue({
  store,
  router,
  methods: {
    onSiteInit() {
      this.isNew = false;
    }
  },
  ...App,
});

Publisher.store = store;
const publisher = new Vue(Publisher).$mount('#publish-modal .modal-content');
Uploader.store = store;
const uploader = new Vue(Uploader).$mount('#upload-modal .modal-content');

if (remote.getGlobal('isNew')) {
  router.push({
    name: "welcome"
  });
  router.app.$once('site-init', () => {
    console.log('ok');
    app.isNew = false;
  });
} else {
  app.isNew = false;
  router.push({
    name: 'articleList'
  });
}

document.getElementById('app').addEventListener('click', (event) => {
  if (event.target.tagName.toLowerCase() !== 'a') {
    return;
  }
  let href = event.target.href;
  if (/^https?:\/\//.test(href)) {
    shell.openExternal(href);
    event.preventDefault();
  }
}, false);