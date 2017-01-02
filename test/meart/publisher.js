/**
 * Created by meathill on 2017/1/2.
 */
const assert = require('assert');
const should = require('should');
const _ = require('underscore');
const site = require('../../site/site.json');
const Publisher = require('../../electron/Publisher');

describe('Test Publisher', () => {
  let publisher;
  let theme = 'dark';
  let event = {
    sender: {
      send: function (event, label, progress) {
        console.log(event, label, progress);
      }
    }
  };
  
  before( () => {
    site.siteTheme = theme;
    publisher = new Publisher(site, event, __dirname + '/../..');
  });

  describe('#readThemeOptions()', () => {
    let themeOptions = require('../../theme/' + theme + '/package.json');
    let defaults = require('../../theme/defaults.json');
    themeOptions = _.defaults(themeOptions, defaults);
    it('should equal', (done) => {
      publisher.readThemeOptions()
        .then( options => {
          themeOptions.should.deepEqual(options);
          done();
        })
        .catch( err => {
          done(err);
        });
    });
  });

});
