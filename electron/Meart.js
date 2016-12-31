const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const _ = require('underscore');
const Handlebars = require('handlebars');
const moment = require('moment');
const defaultConfig = require('../config/default.json');
const dev = require('../config/dev.json');
const EXIST = 'EEXIST';

class Meart {
  constructor() {
    this.path = app.getAppPath();
    this.sitePath = this.path + '/site/site.json'; // 站点信息;
    this.settingsPath = this.path + '/settings.json'; // 用户设置
    this.output = this.path + '/output/';
    this.delegateEvent();
    this.loadConfig();
  }

  startUp() {
    if (this.isAppReady && this.site && !this.isStarted) {
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
      fs.writeFile(this.sitePath, JSON.stringify(site), 'utf8');
      event.returnValue = true;
    });

    ipcMain.on('/article/new', (event) => {
      event.returnValue = this.site.articles.length + 1;
    });

    ipcMain.on('/article/edit', (event, id, article) => {
      this.site.lastModifiedTime = Date.now();
      this.site.articles[id] = article;
      fs.writeFileSync(this.sitePath, JSON.stringify(this.site), 'utf8');
      event.returnValue = true;
    });

    ipcMain.on('/site/save', (event, content) => {
      let now = Date.now();
      this.site.lastModifiedTime = now;
      fs.writeFile(this.sitePath, content, 'utf8', (err) => {
        if (err) {
          throw err;
        }
        event.sender.send('saved', now);
      });
    });

    ipcMain.on('/publish/', (event) => {
      event.sender.send('/publish/progress/', '读取模板文件', 0);
      let theme = this.site.siteTheme;
      let path = this.path + '/theme/' + theme + '/';
      let index = new Promise( resolve => {
        fs.readFile(path + 'index.hbs', 'utf8', (err, content) => {
          if (err) {
            throw err;
          }
          resolve(Handlebars.compile(content));
        })
      });
      let page = new Promise( resolve => {
        fs.readFile(path + 'page.hbs', 'utf8', (err, content) => {
          if (err) {
            throw err;
          }
          resolve(Handlebars.compile(content))
        })
      });
      Promise.all([index, page]).then( ([index, page]) => {
        event.sender.send('/publish/progress/', '生成导出目录', 15);
        return new Promise( resolve => {
          fs.mkdir(this.output, (err) => {
            if (err && err.code === EXIST) {
              return resolve([index, page]);
            }
            throw err;
          })
        });
      }).then( ([index, page]) => {
        event.sender.send('/publish/progress/', '生成首页', 20);
        let html = index(this.site);
        return new Promise((resolve) => {
          fs.writeFile(this.output + 'index.html', html, 'utf8', err => {
            if (err) {
              throw err;
            }
            resolve(page);
          });
        });
      }).then( (page) => {
        let articles = this.site.articles.filter( article => {
          return article && article.status === 0;
        });
        let pageNumber = Math.ceil(articles.length / 5);
        let progress = 75 / pageNumber;
        let count = 0;
        event.sender.send('/publish/progress/', '准备生成单个相册', 25);
        return Promise.all(articles.map( article => {
          let html = page(article);
          return new Promise( resolve => {
            fs.writeFile(this.output + (article.url || article.id) + '.html', html, 'utf8', err => {
              if (err) {
                throw err;
              }
              event.sender.send('/publish/progress/', '生成相册', 25 + progress * (count + 1));
              count++;
              resolve();
            });
          })
        }));
      }).then(() => { // 生成版本信息
        let build = {
          publishTime: Date.now()
        };
        return new Promise( resolve => {
          fs.writeFile(this.output + 'build.json', JSON.stringify(build), 'utf8', err => {
            if (err) {
              throw err;
            }
            resolve();
          })
        });
      }).then( () => {
        event.sender.send('/publish/finish/');
      })
        .catch(console.log.bind(console));
    });
  }

  loadConfig() {
    global.settings = this.settings = defaultConfig;
    if (!fs.existsSync(this.sitePath)) {
      global.settings = this.settings = defaultConfig;
      global.isNew = true;
      fs.mkdir(this.path + '/site', (err) => {
        if (err.code === EXIST) {
          return this.startUp();
        }
        console.log(err);
      });
      return;
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
    BrowserWindow.addDevToolsExtension(dev.vueDevTool);
    this.isAppReady = true;
    this.startUp();
  }
}

module.exports = Meart;