const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

class Meart {
  constructor() {
    this.path = app.getPath('userData');
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
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }));

    this.win.on('close',() => {
      this.win = null;
    });
  }

  delegateEvent() {
    app.on('ready', this.onAppReady);
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
    this.startUp();
  }

  loadConfig() {
    fs.readFile(this.path + 'config.json', 'utf8', (error, content) => {
      if (error) {
        console.log(error);
      }
      global.sharedObject.config = this.config = JSON.parse(content);
      this.startUp();
    });
  }

  onAppReady() {
    this.isAppReady = true;
  }
}

export default Meart;