const remote = require('electron').remote;
const Handlebars =require('handlebars');
const router = require('./app/Router');
const Publisher = require('./app/popup/Publish');
const store = require('./app/store/index');

Handlebars.registerHelper('toCalendar', (value) => {
  return moment(value).calendar();
});
Handlebars.registerHelper('toDate', (value) => {
  return moment(value).format('YYYY-MM-DD HH:mm:ss');
});

const app = new Vue({
  store,
  router
}).$mount('#app');

Publisher.store = store;
const publisher = new Vue(Publisher).$mount('#publish-modal .modal-content');

if (remote.getGlobal('isNew')) {
  router.push({
    name: "welcome"
  });
} else {
  router.push({
    name: 'articleList'
  });
}
