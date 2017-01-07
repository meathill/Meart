/**
 * Created by meathill on 2017/1/5.
 */
const fs = require('fs');
const qiniu = require('qiniu');
const sharp = require('sharp');
const md5 = require('md5-file/promise');
const _ = require('underscore');
let record;
try {
  record = require('./upload-record.json');
} catch (err) {
  record = {};
}

const IMG_REG = /(href|style|src)="(?!https?:\/\/)([^"]+\.(?:jpg|jpeg|png|webp))[")]/ig;

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
    this.tmp = path + 'tmp/';
  }

  start() {
    this.findFiles()
      .then(this.uploadHTML.bind(this))
      .then(this.uploadAssets.bind(this))
      .then(this.finish)
      .catch(Uploader.catchAll);
  }

  findAllImages(html) {
    let images = [];
    html.replace(IMG_REG, (match, attr, src) => {
      images.push(src);
      return match;
    });
    return _.uniq(images);
  }

  findFiles() {
    return new Promise( resolve => {
      fs.readdir(this.path, 'utf8', (err, files) => {
        if (err) {
          throw err;
        }
        resolve(_.without(files, 'tmp')); // tmp 目录用来存放缩略图
      });
    });
  }

  generateThumbnail(images) {
    let resized = [];
    return Promise.all(images.filter( image => {
      return image;
    }).map( ({src, hash, key}) => {
      let ext = key.substr(key.lastIndexOf('.'));
      let filename = hash + '@h400' + ext;
      resized.push(filename);
      return sharp(src)
        .resize(null, 400)
        .toFile(this.tmp + filename)
        .then( () => {
          return {
            src: src,
            key: key,
            thumbnail: filename
          };
        });
    }));
  }

  getToken(filename) {
    let putPolicy = new qiniu.rs.PutPolicy(this.bucket + ':' + filename);
    return putPolicy.token();
  }

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
    let map = _.object(_.pick(images, 'src'), _.pick(images, 'key'));
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

  uploadFile(source, to = '') {
    let token = this.getToken(filename);
    let extra = new qiniu.io.PutExtra();
    to = to || source;
    return new Promise(resolve => {
      qiniu.io.putFile(token, to, source, extra, (err, result) => {
        if (err) {
          throw err;
        }
        resolve([result, source]);
      });
    })
      .then(Uploader.logResult);
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

  uploadSingleHTML(html) {
    return this.readHTML(html, this.path)
      .then(this.findAllImages)
      .then(this.uploadSourceImages.bind(this))
      .then(this.generateThumbnail.bind(this))
      .then(this.uploadThumbnailImages.bind(this))
      .then(this.replaceImageSrc)
      .then( () => {
        return this.uploadFile(html);
      })
      .catch(Uploader.catchAll);
  };

  uploadSourceImages(images) {
    return Promise.all(images.map( image => {
      return new Promise( resolve => {
        fs.stat(image, (err, stat) => {
          if (err) {
            throw err;
          }
          if (stat.mtime <= record[image]) { // 上传过的不处理
            resolve(false);
          }
          resolve(image);
        })
      })
        .then( image => {
          return image ? md5(image) : false;
        })
        .then( hash => {
          if (!hash) {
            return false;
          }

          let ext = image.substr(image.lastIndexOf('.'));
          return this.uploadFile(image, 'images/' + hash + ext);
        });
    }));
  }

  uploadThumbnailImages(images) {
    return Promise.all(images.map( image => {
      let {thumbnail} = image;
      return this.uploadFile(this.tmp + thumbnail, 'images/' + thumbnail)
        .then( () => {
          return image;
        });
    }));
  }

  static catchAll(err) {
    console.log(err);
  }

  static logResult([result, source]) { // 记录下最后上传状态，避免重复上传同样的文件，节省时间
    record[source] = Date.now();
    fs.writeFile('./upload-record.json', JSON.stringify(record), 'utf8', err => {
      if (err) {
        throw err;
      }
    });
    result.src = source;
    return result;
  };
}

module.exports = Uploader;