/**
 * Created by meathill on 2017/1/6.
 */

const fs = require('fs');
const should = require('should');
const Uploader = require('../../electron/Uploader');
const site = require('../../site/site.json');
const event = require('./MockEvent');

describe('Test Uploader', () => {
  let path = __dirname + '/../../output/';
  let uploader = new Uploader(site.server, event, path);
  let theme = 'dark';

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

  describe('#uploadSourceImages()', () => {
    it
  });
});