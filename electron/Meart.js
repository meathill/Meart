const {app, BrowserWindow} = require('electron');
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
      this.config = defaultConfig;
      return this.startUp();
    }
    fs.readFile(configFile, 'utf8', (error, content) => {
      if (error) {
        console.log(error);
      }
      global.sharedObject.config = this.config = _.defaults(JSON.parse(content), defaultConfig);
      this.startUp();
    });
  }

  onAppReady() {
    this.isAppReady = true;
    this.startUp();
  }
}

module.exports = Meart;