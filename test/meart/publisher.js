/**
 * Created by meathill on 2017/1/2.
 */
const assert = require('assert');
const fs = require('fs');
const should = require('should');
const del = require('del');
const _ = require('underscore');
const Handlebars = require('handlebars');
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
    del(publisher.output)
      .then( () => {
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
    let from = {
      index: 'i',
      article: ',',
      archive: 'robot'
    };
    let partials = [];
    it('all partial', (done) => {
      new Promise( resolve => {
        fs.readdir(publisher.themePath + 'partial/', 'utf8', (err, files) => {
          if (err) {
            throw err;
          }
          partials = files.map( file => {
            return file.replace('.hbs', '');
          });
          resolve(from);
        })
      })
        .then(publisher.readPartials.bind(publisher))
        .then( templates => {
          templates.should.deepEqual(from);
          partials.forEach( partialName => {
            let template = '{{> ' + partialName + '}}';
            template = Handlebars.compile(template);
            should(template({}).length).above(0);
          });
          done();
        })
        .catch( err => {
          done(err);
        });
    });
  });
  
  describe('#createIndex()', () => {
    let mockTemplates = {
      index: Handlebars.compile('{{siteTitle}}'),
    };
    it('should create file', done => {
      publisher.createIndex(mockTemplates)
        .then( templates => {
          templates.should.deepEqual(mockTemplates);
          return new Promise( resolve => {
            fs.readFile(publisher.output + 'index.html', 'utf8', (err, content) => {
              if (err) {
                return done(err);
              }
              content.should.equal(site.siteTitle);
              resolve();
            });
          });
        })
        .then( () => {
          done();
        })
        .catch( err => {
          done(err);
        });
    })
  });

  describe('#createArchives()', () => {
    let mockTemplates = {
      archive: Handlebars.compile('{{siteTitle}}'),
    };
    it('should create file', done => {
      publisher.createArchives(mockTemplates)
        .then( templates => {
          templates.should.deepEqual(mockTemplates);
          return new Promise( resolve => {
            fs.readFile(publisher.output + 'archive.html', 'utf8', (err, content) => {
              if (err) {
                return done(err);
              }
              content.should.equal(site.siteTitle);
              resolve();
            });
          });
        })
        .then( () => {
          done();
        })
        .catch( err => {
          done(err);
        });
    })
  });

  describe('#createArticles()', () => {
    let mockTemplates = {
      article: Handlebars.compile('{{title}} | {{url}}')
    };
    it('should create file', done => {
      publisher.createArticles(mockTemplates)
        .then( () => {
          return Promise.all(site.articles.map( article => {
            return new Promise( resolve => {
              fs.readFile(publisher.output + article.url + '.html', 'utf8', (err, content) => {
                if (err) {
                  done(err);
                }
                content.should.equal(article.title + ' | ' + article.url);
                resolve();
              });
            });
          }))
        })
        .then( () => {
          done();
        })
        .catch( err => {
          done(err);
        })
    });
  });

  describe('#copyAssets()', () => {
    it('should copy files', done => {
      publisher.copyAssets()
        .then( () => {
          new Promise( resolve => {
            fs.readdir(publisher.themePath + 'css/', 'utf8', (err, files) => {
              if (err) {
                return done(err);
              }
              resolve(files);
            })
          })
            .then( (source) => {
              fs.readdir(publisher.output + 'css/', 'utf8', (err, files) => {
                if (err) {
                  return done(err);
                }
                files.should.containEql(source);
              });
            });
        })
        .then( () => {
          done();
        })
        .catch( err => {
          done(err);
        });
    });
  });

  describe('#logVersions()', () => {
    it('should write log file', done => {
      publisher.logVersions()
        .then( time => {
          fs.readFile(publisher.output + 'build.json', 'utf8', (err, content) => {
            if (err) {
              return done(err);
            }
            let build = JSON.parse(content);
            build.should.have.property('publishTime').to.be.exactly(time);
          });
        })
        .then( () => {
          done();
        })
        .catch( err => {
          done(err);
        });
    });
  });
});
