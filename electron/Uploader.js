/**
 * Created by meathill on 2017/1/5.
 */
const fs = require('fs');
const qiniu = require('qiniu');
let record;
try {
  record = require('./upload-record.json');
} catch (err) {
  record = {};
}

class Uploader {
  /**
   *
   * @param {Object} config
   * @param {EventEmitter} event
   * @param {String} path
   */
  constructor(config, event, path) {
    qiniu.conf.ACCESS_KEY = config.ACCESS_KEY;
    qiniu.conf.SECRET_KEY = config.SECRET_KEY;
    this.bucket = config.bucket;
    this.event = event;
    this.path = path;
  }

  start() {
    this.findFiles()
      .then(this.uploadHTML.bind(this))
      .then(this.uploadAssets.bind(this))
      .then(this.finish)
      .catch(Uploader.catchAll);
  }

  findFiles() {
    return new Promise( resolve => {
      fs.readdir(this.path, 'utf8', (err, files) => {
        if (err) {
          throw err;
        }
        resolve(files);
      });
    });
  }

  getToken(filename) {
    let putPolicy = new qiniu.rs.PutPolicy(this.bucket + ':' + filename);
    return putPolicy.token();
  }

  uploadAssets(files, dir = '') {
    return Promise.all(files.map( file => {
      file = dir ? dir + '/' + file : file;
      return new Promise( resolve => {
        fs.stat(this.path + file, (err, stat) => {
          if (err) {
            throw  err;
          }
          resolve(stat);
        })
          .then( stat => {
            if (stat.isDirectory()) { // 是目录，递归之
              return new Promise( resolve => {
                fs.readdir(this.path + file, 'utf8', (err, files) => {
                  if (err) {
                    throw err;
                  }
                  resolve(files);
                });
              })
                .then( files => {
                  return this.uploadAssets(files, file);
                });
            }

            if (!(file in record) || stat.mtime > record[file]) {
              return this.uploadFile(file);
            } else {
              return true;
            }
          });
      })
    }));
  }

  uploadFile(filename) {
    let token = this.getToken(filename);
    let extra = new qiniu.io.PutExtra();
    return new Promise( resolve => {
      qiniu.io.putFile(token, filename, this.path + filename, extra, (err, result) => {
        if (err) {
          throw err;
        }
        resolve(result);
      });
    })
      .then( result => { // 记录下最后上传状态，避免重复上传同样的文件，节省时间
        record[filename] = Date.now();
        fs.writeFile('./upload-record.json', JSON.stringify(record), 'utf8', err => {
          if (err) {
            throw err;
          }
        });
      });
  }

  uploadHTML(files) {
    let htmls = files.filter( file => {
      return /\.html$/.test(file);
    });

    return Promise.all(htmls.map( html => {
      return this.uploadFile(html);
    }))
      .then( () => {
        return files.filter( file => {
          return !/\.html$/.test(file);
        });
      });
  }

  static catchAll(err) {
    console.log(err);
  }
}

module.exports = Uploader;