/**
 * Created by meathill on 2017/1/2.
 */
const assert = require('assert');
const fs = require('fs');
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
  
  before( (done) => {
    site.siteTheme = theme;
    publisher = new Publisher(site, event, __dirname + '/../..', 'tmp');
    fs.rmdir(publisher.output, err => {
      if (err && err.code != 'ENOENT') {
        throw err;
      }
      done();
    });
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

  describe('#generateOutputDirectory()', () => {
    let obj = {
      code: 42
    };
    it('dir should exists', (done) => {
      publisher.generateOutputDirectory(obj)
        .then( options => {
          obj.should.deepEqual(options);
          should(fs.existsSync(publisher.output)).be.true();
          done()
        } )
        .catch( err => {
          done(err);
        });
    });
  });

  describe('#getThemeTemplates()', () => {
    let least = ['index', 'article', 'archive'];
    it('default', () => {
      let templates = publisher.getThemeTemplates();
      should(least).containDeep(templates);
    });
    it('contain', () => {
      let templates = publisher.getThemeTemplates({ templates: ['page', 'index'] });
      should(templates).containDeep(least);
      should(templates.length).be.exactly(4);
    })
  });

  describe('#readTemplates()', () => {
    let templates = ['index', 'article', 'archive'];
    it('all template', (done) => {
      publisher.readTemplates(templates)
        .then( (templates) => {
          templates.should.have.property('index').which.is.a.Function();
          templates.should.have.property('article').which.is.a.Function();
          templates.should.have.property('archive').which.is.a.Function();
          done();
        })
        .catch( err => {
          done(err);
        })
    });
  });

  describe('#readPartials()', () => {

  });
});
