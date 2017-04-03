const {app, BrowserWindow, Menu} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const _ = require('underscore');
const moment = require('moment');
const mkdirp = require('mkdirp');
const defaultConfig = require('../config/default.json');
const { DEBUG } = require('../config/config.json');
const menuTemplate = require('./menu');
const ipcHandler = require('./ipcHandler');
const EXIST = 'EEXIST';

let isStarted = false;

class Meart {
  constructor() {
    this.appPath = app.getAppPath();
    this.path = app.getPath('home') + '/meart/';
    this.sitePath = this.path + '/site/site.json'; // 站点信息;
    this.output = this.path + '/output/';
    Promise.all([
      this.delegateEvent(),
      this.loadConfig(),
      this.loadSite(),
    ])
      .then(this.startUp.bind(this));
  }

  startUp() {
    if (!isStarted) {
      Meart.checkDebug();
      isStarted = true;
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

    new ipcHandler(this.appPath, this.path, this.sitePath, this.output);

    if (app.isReady()) {
      return true;
    }

    return new Promise(resolve => {
      app.on('ready', () => {
        resolve();
      });
    });
  }

  loadConfig() {
    global.settings = this.settings = defaultConfig;
    if (fs.existsSync(this.sitePath)) {
      return true;
    }

    global.isNew = true;
    return new Promise(resolve => mkdirp(this.path + '/site', err => {
      if (!err || err.code === EXIST) {
        resolve();
      }
      throw err;
    }));
  }

  loadSite() {
    if (!fs.existsSync(this.sitePath)) {
      return true;
    }

    return require(this.sitePath);
  }

  static checkDebug() {
    if (DEBUG) {
      let {vueDevTool} = require('../config/dev.json');
      BrowserWindow.addDevToolsExtension(vueDevTool);
    } else {
      Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
    }
  }
}

module.exports = Meart;