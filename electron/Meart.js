const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const _ = require('underscore');
const defaultConfig = require('../config/default.json');
const config = require('../config');

class Meart {
  constructor() {
    this.path = app.getAppPath();
    this.delegateEvent();
    this.loadConfig();
  }

  startUp() {
    if (this.isAppReady && this.config) {
      this.createWindow();
    }
  }

  createWindow() {
    this.win = new BrowserWindow({
      width: 900,
      height: 450
    });

    this.win.loadURL(url.format({
      pathname: path.join(__dirname, '../index.html'),
      protocol: 'file:',
      slashes: true
    }));

    this.win.on('close',() => {
      this.win = null;
    });

    if (config.isDebug) {
      this.win.webcContents.openDevTools();
    }
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
  }

  loadConfig() {
    let configFile = this.path + '/config.json';
    if (!fs.existsSync(configFile)) {
      // 初始化
      global.sharedObject = this.config = defaultConfig;
      return this.startUp();
    }

    // 加载保存的配置
    let sites = this.path + '/sites.json';
    let configPromise = new Promise(function (resolve, reject) {
      fs.readFile(configFile, 'utf8', (error, content) => {
        if (error) {
          return reject(error);
        }
        resolve(content);
      });
    })
    .then( (content) => {
      global.sharedObject.config = this.config = _.defaults(JSON.parse(content), defaultConfig);
    });
    let sitesPromise = new Promise(function (resolve, reject) {
      fs.readFile(sites, 'utf8', (error, content) => {
        if (error) {
          return reject(error);
        }
        resolve(content)
      });
    }).then( (content) => {
      global.shareObject.sites = this.sites = JSON.parse(content);
    });
    Promise.all([configPromise, sitesPromise])
      .then(() => {
        this.startUp();
      });
  }

  onAppReady() {
    this.isAppReady = true;
    this.startUp();
  }
}

module.exports = Meart;