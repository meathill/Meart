/**
 * Created by meathill on 2017/1/2.
 */

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
publisher.output = __dirname + '/output/' + theme;
publisher.start()
  .then( result => {
    if (result) {
      console.log('ok');
    } else {
      throw new Error('make output error');
    }
  });
