/**
 * Created by meathill on 2017/1/6.
 */

const fs = require('fs');
const should = require('should');
const _ = require('underscore');
const Uploader = require('../../electron/Uploader');
const server = require('../../site/server.json');
const event = require('./MockEvent');
const copy = require('../../electron/lib/copy');

describe('Test Uploader', () => {
  let path = __dirname + '/../../output/';
  let uploader = new Uploader(server, event, path);
  let theme = 'dark';
  let site = __dirname + '/../../site/';
  let tmp = __dirname + '/../../tmp/';

  //before();

  describe('#findFiles()', () => {
    it('should have files', done => {
      uploader.findFiles()
        .then( files => {
          should(files.length).be.greaterThan(1);
          done();
        })
        .catch( err => {
          done(err)
        });
    })
  });

  describe('#readHTML()', () => {
    it('should read something', done => {
      uploader.readHTML('index.html', path)
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
      let content = fs.readFileSync(path + 'index.html', 'utf8');
      let [images, html] = uploader.findAllImages(content);
      html.should.equal(content);
      should(images.length).be.exactly(3);
      images.forEach( image => {
        image.should.not.match(/background(-image)?:\s*url\(/);
      });
    });
  });

  describe('#uploadFile()', () => {
    it('upload file success', done => {
      uploader.uploadFile(path + 'index.html', 'index.html')
        .then( result => {
          should(result).has.property('key').equal('index.html');
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });

  describe('#uploadSourceImages()', () => {
    let site = require('../../site/site.json');
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
});