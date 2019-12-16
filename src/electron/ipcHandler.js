/**
 * Created by meathill on 2017/4/2.
 */

const {ipcMain} = require('electron');
const {readDir, readJSON, stat} = require('./util/fs');
import Publisher from './Publisher';
import Uploader from './Uploader';

export default class ipcHandler {

  constructor(appPath, sitePath, output) {
    this.appPath = appPath;
    this.sitePath = sitePath;
    this.output = output;

    ipcMain.on('/theme/', this.getThemesList.bind(this));
    ipcMain.on('/publish/', this.publish.bind(this));
    ipcMain.on('/upload/', this.upload.bind(this));
  }

  async getThemesList(event) {
    const basePath = this.appPath + '/theme/';
    const files = await readDir(basePath, 'utf8');
    const themesInfo = await Promise.all(files.map(async file => {
      const info = stat(basePath + file);
      if (info.isFile()) {
        return false;
      }
      const themeInfo = await readJSON(basePath + file + '/package.json');
      themeInfo.dir = file;
      return themeInfo;
    }));
    event.sender.send('list-theme', themesInfo.filter(themeInfo => themeInfo));
  }

  publish(event) {
    let publisher = new Publisher(event.sender, this.sitePath);
    publisher.start();
  }

  upload(event) {
    let uploader = new Uploader(event.sender, this.output);
    uploader.start();
  }
}