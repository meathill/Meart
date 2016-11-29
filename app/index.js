const global = require('electron').remote.getGlobal('sharedObeject');
const Vue = require('../vue');
const NotFound = {
  template: '<p>Page not found</p>'
};
const Home = {
  template: '<p>home</p>'
};
const About = {
  template: '<p>about</p>'
};

const routes = {
  '/': home,
  '/about': About
};

let config = global.config;
let sites = global.remote;
