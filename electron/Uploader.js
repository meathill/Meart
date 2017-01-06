/**
 * Created by meathill on 2017/1/5.
 */
const fs = require('fs');
const qiniu = require('qiniu');
const sharp = require('sharp');
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

  generateThumbnail(images) {
    return Promise.all(images.map( image => {
      return sharp(image)
        .resize(400)
        .toBuffer();
    }))
      .then( () => {
        return images;
      });
  }

  getAllImages(html) {
    let images = [];
    html.replace(/.jpg$/g, match => {
      images.push(match);
    });
    return images;
  }

  getToken(filename) {
    let putPolicy = new qiniu.rs.PutPolicy(this.bucket + ':' + filename);
    return putPolicy.token();
  }

  imageMin(images) {
    return images;
  }

  logResult(filename) { // 记录下最后上传状态，避免重复上传同样的文件，节省时间
    record[filename] = Date.now();
    fs.writeFile('./upload-record.json', JSON.stringify(record), 'utf8', err => {
      if (err) {
        throw err;
      }
    });
  };

  readHTML(html, path) {
    return new Promise( resolve => {
      fs.readFile(path + html, 'utf8', (err, content) => {
        if (err) {
          throw err;
        }

        resolve(content);
      })
    })
  }

  replaceImageSrc(images) {

  }

  uploadAssets(files, dir = '') {
    return Promise.all(files.map( file => {
      file = dir ? dir + '/' + file : file;
      return new Promise( resolve => {
        fs.stat(this.path + file, (err, stat) => {
          if (err) {
            throw err;
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
    return new Promise(resolve => {
      qiniu.io.putFile(token, filename, this.path + filename, extra, (err, result) => {
        if (err) {
          throw err;
        }
        resolve(filename);
      });
    })
      .then(this.logResult);
  }

  uploadHTML(files) {
    let htmls = files.filter( file => {
      return /\.html$/.test(file);
    });
    return Promise.all(htmls.map(this.uploadSingleHTML.bind(this)))
      .then( () => {
        return files.filter( file => {
          return !/\.html$/.test(file);
        });
      });
  }

  uploadAllImages(images) {
    return Promise.all(images.map( image => {
      return this.uploadFile(image);
    }));
  }

  uploadSingleHTML(html) {
    return this.readHTML(html)
      .then(this.getAllImages)
      .then(this.generateThumbnail)
      .then(this.replaceImageSrc)
      .then(this.imageMin)
      .then(this.uploadAllImages)
      .then( () => {
        return this.uploadFile(html);
      })
      .catch(Uploader.catchAll);
  };

  static catchAll(err) {
    console.log(err);
  }
}

module.exports = Uploader;