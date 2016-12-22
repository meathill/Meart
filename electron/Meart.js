const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const _ = require('underscore');
const defaultConfig = require('../config/default.json');

class Meart {
  constructor() {
    this.path = app.getAppPath();
    this.sitePath = this.path + '/site.json'; // 站点信息;
    this.settingsPath = this.path + '/settings.json'; // 用户设置
    this.delegateEvent();
    this.loadConfig();
  }

  startUp() {
    if (this.isAppReady && this.settings && !this.isStarted) {
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

    ipcMain.on('/site/init', (event, site) => {
      global.site = this.site = site;
      global.isNew = false;
      fs.writeFile(this.path + '/site.json', JSON.stringify(site), 'utf8');
      event.returnValue = true;
    });

    ipcMain.on('/article/new', (event) => {
      event.returnValue = this.site.articles.length + 1;
    });

    ipcMain.on('/article/edit', (event, id, article) => {
      this.site.articles[id] = article;
      fs.writeFileSync(this.sitePath, JSON.stringify(this.site), 'utf8');
      event.returnValue = true;
    });
  }

  loadConfig() {
    global.settings = this.settings = defaultConfig;
    if (!fs.existsSync(this.sitePath)) {
      global.settings = this.settings = defaultConfig;
      global.isNew = true;
      return this.startUp();
    }
    let settingsPromise = this.readFile(this.settingsPath, 'settings', defaultConfig);
    let sitePromise = this.readFile(this.sitePath, 'site');
    Promise.all([settingsPromise, sitePromise])
      .then(() => {
        this.startUp();
      });
  }

  readFile(file, field, defaults = {}) {
    if (!fs.existsSync(file)) {
      return true;
    }
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
    BrowserWindow.addDevToolsExtension('C:\\Users\\realm\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\nhdogjmejiglipccpnnnanhbledajbpd\\2.3.1_0\\');
    this.isAppReady = true;
    this.startUp();
  }
}

module.exports = Meart;