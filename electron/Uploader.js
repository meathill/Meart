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
      if (src.indexOf('url(') != -1) {
        src = src.substr(src.indexOf('url(') + 4);
      }
      images.push(src);
      return match;
    });
    return [_.uniq(images), html];
  }

  findFiles() {
    this.event.sender.send('/upload/progress/', '计算所有需要上传的内容', 0);
    return new Promise( resolve => {
      fs.readdir(this.path, 'utf8', (err, files) => {
        if (err) {
          throw err;
        }
        resolve(_.without(files, 'tmp')); // tmp 目录用来存放缩略图
      });
    });
  }

  finish() {
    this.event.sender.send('/upload/finish/');
  }

  /**
   * 生成缩略图，存放在 ./output/tmp 目录里
   * 只生成没过期，之前上传的图片
   * 特征是由服务器返回，有 key
   *
   * @param images
   * @returns {Promise.<TResult>}
   */
  generateThumbnail(images) {
    this.event.sender.send('/upload/progress/', '开始生成缩略图');
    return Promise.all(images.filter( image => {
      return image.key;
    }).map( image => {
      let {src, hash, key} = image;
      let ext = key.substr(key.lastIndexOf('.'));
      let filename = hash + '@h400' + ext;
      return sharp(src)
        .resize(null, 400)
        .toFile(this.tmp + filename)
        .then( () => {
          image.thumbnail = filename;
          return image;
        });
    }))
      .then( images => {
        return images;
      });
  }

  getToken(filename) {
    let putPolicy = new qiniu.rs.PutPolicy(this.bucket + ':' + filename);
    return putPolicy.token();
  }

  readHTML(html, path) {
    this.event.sender.send('/upload/progress/', '正在分析：' + html);
    return new Promise( resolve => {
      fs.readFile(path + html, 'utf8', (err, content) => {
        if (err) {
          throw err;
        }
        resolve(content);
      })
    });
  }

  replaceImageSrc(html, images, origin) {
    this.event.sender.send('/upload/progress/', '生成新 HTML');
    let map = _.object(_.pick(images, 'src'), images);
    html = html.replace(IMG_REG, (match, attr, src) => {
      let image = map[src];
      let ext = image.src.substr(image.src.lastIndexOf('.'));
      let to;
      if (attr != 'href') {
        to = image.thumbnail || 'images/' + image.hash + '@h400' + ext;
      } else {
        to = image.key || 'images/' + image.hash + ext;
      }
      return match.replace(src, to);
    });
    return new Promise( resolve => {
      fs.writeFile(this.tmp + origin, html, 'utf8', err => {
        if (err) {
          throw err;
        }
        resolve(this.tmp + origin);
      });
    });
  }

  uploadAssets(files, dir = '') {
    this.event.sender.send('/upload/progress/', '开始上传其它资源', 70);
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

            let source = this.path + file;
            if (!(source in record) || stat.mtime > record[origin]) {
              return this.uploadFile(origin, file);
            } else {
              return true;
            }
          });
      })
    }));
  }

  uploadFile(source, to = '') {
    this.event.sender.send('progrss', '开始上传：' + source);
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
    this.event.sender.send('/upload/progress/', '开始上传网页', 2);
    let htmls = files.filter( file => {
      return /\.html$/.test(file);
    });
    let perpage = 68 / htmls.length;
    return Promise.all(htmls.map( (html, index) => {
      this.event.sender.send('/upload/progress/', '准备上传：' + html, 2 + index * perpage);
      this.uploadSingleHTML(html, perpage);
    }))
      .then( () => {
        return files.filter( file => {
          return !/\.html$/.test(file);
        });
      });
  }

  uploadSingleHTML(file, perpage) {
    let html;
    return this.readHTML(file, this.path)
      .then( content => {
        html = content;
        return this.findAllImages(html);
      })
      .then(this.uploadSourceImages.bind(this))
      .then(this.generateThumbnail.bind(this))
      .then(this.uploadThumbnailImages.bind(this))
      .then( images => {
        this.replaceImageSrc(html, images, file);
      })
      .then( newHTML => {
        return this.uploadFile(newHTML, file);
      })
      .catch(Uploader.catchAll);
  };

  uploadSourceImages(images) {
    /**
     * @param {String} image 图片路径
     */
    return Promise.all(images.map( image => {
      md5(image)
        .then( hash => {
          return new Promise( resolve => {
            fs.stat(image, (err, stat) => {
              if (err) {
                throw err;
              }
              let result = {
                hash: hash,
                src: image,
                size: stat.size
              };
              if (stat.mtime <= record[image]) { // 上传过的不处理
                return resolve(result);
              }
              result.isModified = true;
              resolve(result);
            })
          })
        })
        .then( result => {
          if (!result.isModified) {
            return result;
          }

          let ext = image.substr(image.lastIndexOf('.'));
          return this.uploadFile(image, 'images/' + result.hash + ext);
        });
    }));
  }

  uploadThumbnailImages(images) {
    this.event.sender.send('/upload/progress/', '开始上传缩略图');
    return Promise.all(images.filter( image => {
      return image.thumbnail;
    }).map( image => {
        let {thumbnail} = image;
        return this.uploadFile(this.tmp + thumbnail, 'images/' + thumbnail)
          .then( result => {
            return result;
          });
      }))
      .then( () => {
        return images;
      });
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