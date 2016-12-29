const remote = require('electron').remote;
const Handlebars =require('handlebars');
const router = require('./app/Router');
const Publisher = require('./app/popup/Publish');

Handlebars.registerHelper('toCalendar', (value) => {
  return moment(value).calendar();
});
Handlebars.registerHelper('toDate', (value) => {
  return moment(value).format('YYYY-MM-DD HH:mm:ss');
});

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
