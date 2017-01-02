/**
 * Created by meathill on 2017/1/2.
 */

const Publisher = require('./electron/Publisher');
const site = require('./site/site.json');
const theme = process.argv[2];

site.siteTheme = theme;
let publisher = new Publisher(site);
publisher.output = __dirname + '/output/' + theme;
publisher.start()
  .then( result => {
    if (result) {
      console.log('ok');
    } else {
      throw new Error('make output error');
    }
  });
