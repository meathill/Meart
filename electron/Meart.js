const {app, BrowserWindow, ipcMain, Menu} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const _ = require('underscore');
const moment = require('moment');
const ncp = require('ncp').ncp;
const defaultConfig = require('../config/default.json');
const { DEBUG } = require('../config/config.json');
const Publisher = require('./Publisher');
const Uploader = require('./Uploader');
const menuTemplate = require('./menu');
const EXIST = 'EEXIST';

class Meart {
  constructor() {
    this.path = app.getAppPath();
    this.sitePath = this.path + '/site/site.json'; // 站点信息;
    this.output = this.path + '/output/';
    this.delegateEvent();
    this.loadConfig();
  }

  startUp() {
    if (this.isAppReady && !this.isStarted) {
      if (!DEBUG) {
        Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
      }
      this.isStarted = true;
      this.createWindow();
    }
  }

  createWindow() {
    console.log('UI start');
    this.win = new BrowserWindow({
      width: 1200,
      height: 800
    });

    this.win.loadURL(url.format({
      pathname: path.join(__dirname, '../index.html'),
      protocol: 'file:',
      slashes: true
    }));

    this.win.on('close',() => {
      this.win = null;
    });
  }

  delegateEvent() {
    if (!app.isReady()) {
      app.on('ready', this.onAppReady.bind(this));
    } else {
      this.isAppReady = true;
    }
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
    app.on('activate', () => {
      if (this.win === null) {
        this.createWindow();
      }
    });

    ipcMain.on('/theme/', event => {
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
    });

    ipcMain.on('/site/init', (event, site) => {
      fs.writeFile(this.sitePath, JSON.stringify(site), 'utf8');
      event.returnValue = true;
    });

    ipcMain.on('/site/save', (event, site) => {
      let now = Date.now();
      site.lastModifiedTime = now;
      fs.writeFile(this.sitePath, JSON.stringify(site), 'utf8', err => {
        if (err) {
          throw err;
        }
        event.sender.send('saved', now);
      });
    });

    ipcMain.on('/server/save', (event, server) => {
      fs.writeFile(this.path + '/site/server.json', JSON.stringify(server), 'utf8', err => {
        if (err) {
          throw err;
        }
        event.sender.send('saved');
      })
    });

    ipcMain.on('/publish/', (event) => {
      let publisher = new Publisher(event, this.path);
      publisher.start();
    });

    ipcMain.on('/upload/', (event) => {
      let uploader = new Uploader(event, this.output);
      uploader.start();
    });
  }

  loadConfig() {
    global.settings = this.settings = defaultConfig;
    if (!fs.existsSync(this.sitePath)) {
      fs.mkdir(this.path + '/site', (err) => {
        if (!err || err.code === EXIST) {
          return this.startUp();
        }
        console.log(err);
      });
      return;
    }
    this.startUp();
  }

  readFile(file, field, defaults = {}) {
    return new Promise( resolve => {
      fs.readFile(file, 'utf8', (err, content) => {
        if (err) {
          throw err;
        }
        global[field] = this[field] = _.defaults(JSON.parse(content), defaults);
        resolve();
      });
    })
      .catch( err => {
        if (field === 'site') {
          global[field] = this[field] = {};
        }
        console.log(err)
      });
  }

  onAppReady() {
    if (DEBUG) {
      let {vueDevTool} = require('../config/dev.json');
      BrowserWindow.addDevToolsExtension(vueDevTool);
    }
    this.isAppReady = true;
    this.startUp();
  }
}

module.exports = Meart;