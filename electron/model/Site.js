/**
 * Created by meathill on 2017/4/4.
 */

const { ipcMain } = require('electron');
import {exists, readJSON, writeFile} from '../util/fs';

const path = process.cwd();

export default class Site {
  constructor() {
    this.path = path + 'site/';
    this.dataPath = this.path + 'site.json';
    this.serverPath = this.path + 'server.json';

    this.init();
  }

  async init() {
    this.isExist = await exists(this.dataPath);
    if (this.isExist) {
      this.data = await readJSON(this.dataPath);
    }
    if (await exists(this.serverPath)) {
      this.server = await readJSON(this.serverPath);
    } else {
      this.server = {
        name: 'qiniu',
        ACCESS_KEY: '',
        SECRET_KEY: '',
        bucket: 'meart'
      };
    }
    global.site = this.data;
    global.server = this.server;

    ipcMain.on('/site/init', this.initSite.bind(this));
    ipcMain.on('/site/save', this.saveSite.bind(this));
    ipcMain.on('/server/save', this.saveServer.bind(this));
  }

  initSite(event, site)  {
    global.site = this.site = site;
    writeFile(this.dataPath, JSON.stringify(site), 'utf8')
      .catch(err => {
        throw err;
      });
    event.returnValue = true;
  }

  saveServer(event, server) {
    global.server = this.server = server;
    writeFile(this.serverPath, JSON.stringify(server), 'utf8')
      .then(() => {
        event.sender.send('saved');
      })
      .catch(err => {
        throw err;
      });
  }

  saveSite(event, site) {
    let now = Date.now();
    site.lastModifiedTime = now;
    this.site = global.site = site;
    writeFile(this.dataPath, JSON.stringify(site), 'utf8')
      .then(() => {
        event.sender.send('saved', now);
      })
      .catch(err => {
        throw err;
      });
  }
}