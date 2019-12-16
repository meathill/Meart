import Vue from 'vue';
import App from './app/App.vue';
import router from './app/router';
import store from './app/store';

const app = new Vue({
  store,
  router,
  ...App,
}).$mount('#app');

export {
  app,
  router,
  store,
};
