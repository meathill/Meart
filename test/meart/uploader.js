/**
 * Created by meathill on 2017/1/6.
 */

const fs = require('fs');
const path = require('path');
const should = require('should');
const _ = require('lodash');
const md5 = require('md5-file/promise');
const Uploader = require('../../src/electron/Uploader');
const server = require('../../site/server.json');
const event = require('./MockEvent');
const copy = require('../../src/electron/lib/copy');

describe('Test Uploader', () => {
  let output = __dirname + '/../../output/';
  let tmp = output + 'tmp/';
  let uploader = new Uploader(server, event, output);
  let site = require('../../site/site.json');

  //before();

  describe('#findFiles()', () => {
    it('should have files', done => {
      uploader.findFiles()
        .then( files => {
          should(files.length).be.greaterThan(1);
          should(files.indexOf('tmp')).be.exactly(-1);
          should(files.indexOf('.DS_Store')).be.exactly(-1);
          done();
        })
        .catch( err => {
          done(err)
        });
    })
  });

  describe('#readHTML()', () => {
    it('should read something', done => {
      uploader.readHTML('index.html', output)
        .then( content => {
          should(content.length).be.greaterThan(1);
          should(content.substr(0, 15)).be.exactly('<!DOCTYPE html>');
          done()
        })
        .catch( err => {
          done(err);
        });
    });
  });

  describe('#findAllImages()', () => {
    it('should find 2 pic', () => {
      let content = fs.readFileSync(output + 'index.html', 'utf8');
      let images = uploader.findAllImages(content);
      should(images.length).be.exactly(3);
      images.forEach( image => {
        image.should.not.match(/background(-image)?:\s*url\(/);
      });
    });
  });

  describe('#uploadFile()', () => {
    it('upload file success', done => {
      uploader.uploadFile(output + 'index.html', 'index.html')
        .then( result => {
          should(result).has.property('key').equal('index.html');
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });

  describe('#uploadSourceImages()', function () {
    this.timeout(60000); // 60s 可以接受
    let album = site.articles[0].album;
    album = _.unique(album);
    album = album.map( photo => {
      return photo.src;
    });
    let notUpload = album.slice(0, 2);
    it('upload all source images', done => {
      let now = Date.now();
      uploader.record = _.object(notUpload, [now, now]);
      uploader.uploadSourceImages(album)
        .then( images => {
          should(images.length).be.exactly(album.length);
          images.forEach( (image, index) => {
            if (index < 2) {
              image.should.not.has.property('key');
            } else {
              image.should.has.property('key');
              image.key.should.match(/^images/);
            }
          });
          done();
        })
        .catch( err => {
          done(err);
        });
    });
  });

  describe('#generateThumbnail()', () => {
    let album = site.articles[0].album;
    it('should generate thumbnail', done => {
      Promise.all(album.map( photo => {
        photo = photo.src;
        return md5(photo)
          .then( hash => {
            let ext = photo.substr(photo.lastIndexOf('.'));
            return {
              src: photo,
              hash: hash,
              key: 'images/' + hash + ext
            };
          });
      }))
        .then( album => {
          return uploader.generateThumbnail(album);
        })
        .then( images => {
          should(images.length).be.exactly(album.length);
          images.forEach( image => {
            should(fs.existsSync(tmp + image.thumbnail)).be.true();
          });
          done();
        })
        .catch( err => {
          done(err);
        });
    });
  });

  describe('#uploadThumbnailImages()', function () {
    this.timeout(60000);
    let count = 0;
    it('should upload thumbnails', done => {
      new Promise( resolve => {
        fs.readdir(tmp, 'utf8', (err, files) => {
          if (err) {
            throw err;
          }
          resolve(files);
        });
      })
        .then( files => {
          return files.map( file => {
            return /@h400\./.test(file) ? {
              thumbnail: file
            } : file;
          });
        })
        .then( files => {
          count = files.length;
          return uploader.uploadThumbnailImages(files);
        })
        .then( files => {
          should(files.length).be.exactly(count);
          done();
        })
        .catch( err => {
          done(err);
        });
    });
  });

  describe('#replaceImageSrc()', () => {
    let filename = 'muimui.html';
    let content = fs.readFileSync(output + filename, 'utf8');
    let [images, html] = uploader.findAllImages(content);
    it('should replace all src', done => {
      Promise.all(images.map( image => {
        return md5(image)
          .then( hash => {
            return {
              src: image,
              hash: hash
            };
          })
      }))
        .then(images => {
          return uploader.replaceImageSrc(html, images, filename);
        })
        .then(toFile => {
          should(path.parse(toFile)).be.deepEqual(path.parse(tmp + filename));
          done();
        })
        .catch( err => {
          done(err);
        })
    });
  });

  describe('#uploadAssets()', function () {
    this.timeout(60000);
    it('should upload all assets', done => {
      uploader.findFiles()
        .then( files => {
          should(files.indexOf('tmp')).be.exactly(-1);
          return files.filter( file => {
            return !/\.html$/.test(file);
          });
        })
        .then( files => {
          return uploader.uploadAssets(files);
        })
        .then( files => {
          files = _.flatten(files);
          should(files.length).be.exactly(2);
          done();
        })
        .catch( err => {
          done(err);
        });
    });
  });
});
