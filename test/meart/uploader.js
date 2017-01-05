/**
 * Created by meathill on 2017/1/6.
 */

const Uploader = require('../../electron/Uploader');
const site = require('../../site/site.json');
const event = require('./MockEvent');

describe('Test Uploader', () => {
  let uploader = new Uploader(site.server, event, __dirname);
  let theme = 'dark';

  before( done => {

  });


});