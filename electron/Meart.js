const {app, BrowserWindow, Menu} = require('electron');
const path = require('path');
const url = require('url');
const {exists, mkdirp, readJSON} = require('./util/fs');
const defaultConfig = require('../config/default.json');
const { DEBUG } = require('../config/config.json');
const menuTemplate = require('./menu');
import Site from './model/Site';
import ipcHandler from './ipcHandler';

const EXIST = 'EEXIST';
let isStarted = false;

export default class Meart {
  constructor() {
    this.appPath = app.getAppPath();
    this.path = path.resolve(app.getPath('home'), 'meart');
    this.sitePath = path.resolve(this.path, 'site/site.json'); // 站点信息;
    this.serverPath = path.resolve(this.path,  'site/server.json'); // 服务器配置
    this.output = path.resolve(this.path, '/output/');
    try {
      this.init();
    } catch (e) {
      console.log(e);
    }
  }

  async init() {
    await Promise.all([
      this.delegateEvent(),
      this.loadConfig(),
      this.loadSite(),
    ]);
    this.startUp();
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

    console.log('[Init: Delegate event]', app.isReady());
    if (app.isReady()) {
      return true;
    }

    return new Promise(resolve => {
      app.on('ready', () => {
        resolve();
      });
    });
  }

  async loadConfig() {
    global.settings = this.settings = defaultConfig;
    const isExists = exists(this.sitePath);

    if (isExists) {
      return true;
    }
    console.log('here i am');

    global.isNew = true;
    return mkdirp(this.path + '/site')
      .catch(err => {
        if (err.code !== EXIST) {
          throw err;
        }
      });
  }

  async loadSite() {
    let site = this.site = new Site(this.path);
    await site.ready;
    if (!site.isExist) {
      return true;
    }

    const json = path.resolve(this.output, 'build.json');
    if (exists(json)) {
      global.publish = this.publish = await readJSON(json);
    }
    return site;
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