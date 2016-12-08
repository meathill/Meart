const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const _ = require('underscore');
const defaultConfig = require('../config/default.json');

class Meart {
  constructor() {
    this.path = app.getAppPath();
    this.delegateEvent();
    this.loadConfig();
  }

  startUp() {
    if (this.isAppReady && this.settings) {
      this.createWindow();
    }
  }

  createWindow() {
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

    ipcMain.on('site-init', (event, site) => {
      global.site = this.site = site;
      global.isNew = false;
      event.returnValue = true;
    });
  }

  loadConfig() {
    let settings = this.path + '/settings.json'; // 用户设置
    if (!fs.existsSync(settings)) {
      // 初始化
      global.settings = this.settings = defaultConfig;
      global.isNew = true;
      return this.startUp();
    }

    let site = this.path + '/site.json'; // 站点信息
    let settingsPromise = this.readFile(settings, 'settings', defaultConfig);
    let sitePromise = this.readFile(site, 'site');
    Promise.all([settingsPromise, sitePromise])
      .then(() => {
        this.startUp();
      });
  }

  readFile(file, field, defaults = {}) {
    return new Promise( (resolve, reject) => {
      fs.readFile(file, 'utf8', (error, content) => {
        if (error) {
          console.log(error);
          return reject(error);
        }
        global[field] = this[field] = _.defaults(JSON.parse(content), defaults);
        resolve();
      });
    });
  }

  onAppReady() {
    this.isAppReady = true;
    this.startUp();
  }
}

module.exports = Meart;