/**
 * Created by meathill on 2017/4/4.
 */

const fs = require('fs');
const { ipcMain } = require('electron');

class Site {
  constructor(path) {
    this.path = path + 'site/';
    this.dataPath = this.path + 'site.json';
    this.serverPath = this.path + 'server.json';

    this.isExist = fs.existsSync(this.dataPath);
    if (this.isExist) {
      this.data = require(this.dataPath);
    }
    if (fs.existsSync(this.serverPath)) {
      this.server = require(this.serverPath);
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
    fs.writeFile(this.dataPath, JSON.stringify(site), 'utf8', err => {
      if (err) {
        throw err;
      }
    });
    event.returnValue = true;
  }

  saveServer(event, server) {
    global.server = this.server = server;
    fs.writeFile(this.serverPath, JSON.stringify(server), 'utf8', err => {
      if (err) {
        throw err;
      }
      event.sender.send('saved');
    });
  }

  saveSite(event, site) {
    let now = Date.now();
    site.lastModifiedTime = now;
    this.site = global.site = site;
    fs.writeFile(this.dataPath, JSON.stringify(site), 'utf8', err => {
      if (err) {
        throw err;
      }
      event.sender.send('saved', now);
    });
  }
}

module.exports = Site;