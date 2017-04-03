/**
 * Created by meathill on 2017/4/2.
 */

const fs = require('fs');
const {ipcMain} = require('electron');
const Publisher = require('./Publisher');
const Uploader = require('./Uploader');

class ipcHandler {

  constructor(appPath, docPath, sitePath, output) {
    this.appPath = appPath;
    this.docPath = docPath;
    this.sitePath = sitePath;
    this.output = output;

    ipcMain.on('/theme/', this.getThemesList.bind(this));

    ipcMain.on('/site/init', this.initSite.bind(this));

    ipcMain.on('/site/save', this.saveSite.bind(this));

    ipcMain.on('/server/save', this.saveServer.bind(this));

    ipcMain.on('/publish/', this.publish.bind(this));

    ipcMain.on('/upload/', this.upload.bind(this));
  }

  getThemesList(event) {
    let basePath = this.path + '/theme/';
    new Promise( resolve => {
      fs.readdir(basePath, 'utf8', (err, files) => {
        if (err) {
          throw err;
        }

        resolve(files);
      });
    })
      .then( files => {
        return Promise.all(files.map( file => {
          return new Promise( resolve => {
            fs.stat(basePath + file, (err, stat) => {
              if (stat.isFile()) {
                return resolve(false);
              }

              let info;
              try {
                info = require(basePath + file + '/package.json');
                info.dir = file;
              } catch (err) {
                if (err.code === 'ENOENT') { // no package.json, not a theme
                  return resolve(false);
                }
                throw err;
              }
              resolve(info);
            });
          });
        }));
      })
      .then( themesInfo => {
        themesInfo = themesInfo.filter( themeInfo => {
          return !!themeInfo;
        });
        event.sender.send('list-theme', themesInfo);
      })
      .catch( err => {
        console.log(err);
      });
  }

  initSite(event, site)  {
    fs.writeFile(this.sitePath, JSON.stringify(site), 'utf8');
    event.returnValue = true;
  }

  publish(event) {
    let publisher = new Publisher(event.sender, this.sitePath);
    publisher.start();
  }

  saveServer(event, server) {
    fs.writeFile(this.sitePath + '/server.json', JSON.stringify(server), 'utf8', err => {
      if (err) {
        throw err;
      }
      event.sender.send('saved');
    });
  }

  saveSite(event, site) {
    let now = Date.now();
    site.lastModifiedTime = now;
    fs.writeFile(this.sitePath, JSON.stringify(site), 'utf8', err => {
      if (err) {
        throw err;
      }
      event.sender.send('saved', now);
    });
  }

  upload(event) {
    let uploader = new Uploader(event.sender, this.output);
    uploader.start();
  }
}

module.exports = ipcHandler;