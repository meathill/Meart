/**
 * Created by meathill on 2017/1/2.
 */

const del = require('del');
const Publisher = require('./electron/Publisher');
const site = require('./site/site.json');
const theme = process.argv[2];

site.siteTheme = theme;
event = {
  sender: {
    send(event, label, progress) {
      console.log(event, label, progress);
    }
  }
};
let publisher = new Publisher(site, event, __dirname, 'dark');
del(publisher.output)
  .then( publisher.start.bind(publisher) )
  .then( result => {
    if (result) {
      console.log('ok');
    } else {
      throw new Error('make output error');
    }
  })
  .catch( err => {
    console.log(err);
  });
