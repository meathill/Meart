/**
 * Created by meathill on 2017/4/2.
 */

const fs = require('fs');
const {ipcMain} = require('electron');
const Publisher = require('./Publisher');
const Uploader = require('./Uploader');

class ipcHandler {

  constructor(appPath, sitePath, output) {
    this.appPath = appPath;
    this.sitePath = sitePath;
    this.output = output;

    ipcMain.on('/theme/', this.getThemesList.bind(this));
    ipcMain.on('/publish/', this.publish.bind(this));
    ipcMain.on('/upload/', this.upload.bind(this));
  }

  getThemesList(event) {
    let basePath = this.appPath + '/theme/';
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

  publish(event) {
    let publisher = new Publisher(event.sender, this.sitePath);
    publisher.start();
  }

  upload(event) {
    let uploader = new Uploader(event.sender, this.output);
    uploader.start();
  }
}

module.exports = ipcHandler;