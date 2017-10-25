import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

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