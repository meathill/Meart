/**
 * Created by meathill on 2017/1/5.
 */
const fs = require('fs');
const { nativeImage } = require('electron');
const qn = require('qn');
const md5 = require('md5-file/promise');
const _ = require('underscore');
const cheerio = require('cheerio');
const LOG_FILE = '../site/upload-record.json';

const IMG_REG = /(href|style|src)="(?!https?:\/\/)([^"]+\.(?:jpg|jpeg|png|webp))[")]/ig;
const URL_REG = /url\((?!https?:\/\/)([^)]+\.(?:jpg|jpeg|png|webp))\)/ig;

class Uploader {
  /**
   *
   * @param {Object} sender
   * @param {String} path
   */
  constructor(sender, path) {
    let config = require('../site/server.json');
    if (!Uploader.isServerConfigured(config)) {
      throw new Error('服务器配置信息不全');
    }
    this.qiniu = qn.create({
      accessKey: config.ACCESS_KEY,
      secretKey: config.SECRET_KEY,
      bucket: config.bucket,
      origin: `http://${config.bucket}.u.qiniudn.com`,
      uploadURL: 'http://up-z2.qiniu.com'
    });
    this.sender = sender;
    this.path = path;
    this.tmp = path + 'tmp/';
    this.uploading = {};
    try {
      this.record = require(LOG_FILE);
    } catch (err) {
      this.record = {};
    }
  }

  start() {
    this.createTempFolder()
      .then(this.findFiles.bind(this))
      .then(this.uploadHTML.bind(this))
      .then(this.uploadAssets.bind(this))
      .then(this.finish.bind(this))
      .catch(Uploader.catchAll);
  }

  createTempFolder() {
    if (fs.existsSync(this.tmp)) {
      return Promise.resolve();
    }
    return new Promise( resolve => {
      fs.mkdir(this.tmp, err => {
        if (err) {
          throw err;
        }
        resolve();
      });
    });
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
    return _.uniq(images);
  }

  /**
   * Find all files need to be uploaded
   * exclude the `tmp` folder
   *
   * @return {Promise}
   */
  findFiles() {
    this.sender.send('/upload/progress/', '计算所有需要上传的内容', 0);
    return this.readDir(this.path);
  }

  finish() {
    this.sender.send('/upload/finish/');
  }

  /**
   * 生成缩略图，存放在 ./output/tmp 目录里
   * 只生成没过期，之前上传的图片
   * 特征是由服务器返回，有 key
   *
   * @param {String} images
   * @returns {Promise}
   */
  generateThumbnail(images) {
    this.sender.send('/upload/progress/', '开始生成缩略图');
    return Promise.all(images.filter( image => {
      return image.key;
    }).map( image => {
      let {src, hash, key} = image;
      let ext = key.substr(key.lastIndexOf('.'));
      let filename = hash + '@h400' + ext;
      let img = nativeImage.createFromPath(src);
      return new Promise( resolve => {
        let data = img.resize( {
          height: 400
        });
        data = /\.png$/i.test(ext) ? data.toPNG() : data.toJPEG(85);
        fs.writeFile(this.tmp + filename, data, err => {
          if (err) {
            throw err;
          }
          image.thumbnail = filename;
          resolve(image);
        });
      })
    }))
      .then( images => {
        return images;
      });
  }

  /**
   * Get the html content
   *
   * @param {String} html 文件名
   * @param {String} path 路径
   * @return {Promise}
   */
  readHTML(html, path) {
    this.sender.send('/upload/progress/', '正在分析：' + html);
    return new Promise( resolve => {
      fs.readFile(path + html, 'utf8', (err, content) => {
        if (err) {
          throw err;
        }
        resolve(content);
      })
    });
  }

  /**
   * Find all files under a folder
   *
   * @param {String} path 路径
   * @return {Promise}
   */
  readDir(path) {
    return new Promise(resolve => {
      fs.readdir(path, 'utf8', (err, files) => {
        if (err) {
          throw err;
        }
        resolve(_.without(files, 'tmp', '.DS_Store', 'upload.log')); // tmp 目录用来存放缩略图
      });
    });
  }

  /**
   * Replace the image file path in the html
   *
   * @param {String} html HTML内容
   * @param {Array} images 刚才上传的结果
   * @param {String} origin 原始文件名
   * @return {Promise}
   */
  replaceImageSrc(html, images, origin) {
    this.sender.send('/upload/progress/', '生成新 HTML');
    let map = _.object(_.pluck(images, 'src'), images);
    let $ = cheerio.load(html, {
      decodeEntities: false
    });
    $('img').attr('src', (i, src) => {
      let image = map[src];
      let ext = src.substr(src.lastIndexOf('.'));
      return image.key || 'images/' + image.hash + ext;
    });
    $('[style]').attr('style', function (i, style) {
      let useSource = $(this).hasClass('carousel-item') || $(this).hasClass('use-source');
      return style.replace(URL_REG, (match, src) => {
        let image = map[src];
        let ext = src.substr(src.lastIndexOf('.'));
        let to;
        if (useSource) {
          to = image.key || 'images/' + image.hash + ext;
        } else {
          to = 'images/' + (image.thumbnail || image.hash + '@h400' + ext);
        }
        return match.replace(src, to);
      });
    });
    html = $.html();
    return new Promise( resolve => {
      fs.writeFile(this.tmp + origin, html, 'utf8', err => {
        if (err) {
          throw err;
        }
        resolve(this.tmp + origin);
      });
    });
  }

  /**
   * Upload other assets
   *
   * @param {Array} files 待上传的文件
   * @param {String} dir 上一级目录名
   * @return {Promise.<*>}
   */
  uploadAssets(files, dir = '') {
    this.sender.send('/upload/progress/', '开始上传其它资源', 70);
    return Promise.all(files.map( file => {
      file = dir ? dir + '/' + file : file;
      return new Promise( resolve => {
        fs.stat(this.path + file, (err, stat) => {
          if (err) {
            throw err;
          }
          resolve(stat);
        })
      })
        .then( stat => {
          if (stat.isDirectory()) { // 是目录，递归之
            return this.readDir(this.path + file)
              .then( files => {
                return this.uploadAssets(files, file);
              });
          }

          let source = this.path + file;
          if (!(source in this.record) || stat.mtime > this.record[source]) {
            return this.uploadFile(source, file);
          } else {
            return true;
          }
        });
    }));
  }

  /**
   * Upload single file
   *
   * @param {String} source 待上传文件的路径
   * @param {String} to 上传后的路径
   * @param {String} hash 文件 MD5 值
   * @return {Promise}
   * @todo refresh CDN after uploaded
   */
  uploadFile(source, to = '', hash = '') {
    if (this.uploading[source]) {
      return this.uploading[source];
    }
    this.sender.send('/upload/progress/', '开始上传：' + source);
    to = to || source;
    this.uploading[source] = new Promise(resolve => {
      this.qiniu.uploadFile(source, {key: to}, (err, result) => {
        if (err) {
          if (err.code === 614) {
            return resolve({
              key: to,
              hash: hash,
              src: source
            });
          }
          throw err;
        }
        resolve(result);
      });
    })
      .then( result => {
        return this.logResult(result, source, hash);
      });
    fs.appendFile(this.path + 'upload.log', `Upload: ${source}\n`, 'utf8');
    return this.uploading[source];
  }

  /**
   * Upload all html files
   *
   * @param {Array} files 全部文件
   * @return {Promise}
   */
  uploadHTML(files) {
    this.sender.send('/upload/progress/', '开始上传网页', 2);
    let htmls = files.filter( file => {
      return /\.html$/.test(file);
    });
    let perpage = 68 / htmls.length;
    return Promise.all(htmls.map( (html, index) => {
      this.sender.send('/upload/progress/', '准备上传：' + html, 2 + index * perpage);
      return this.uploadSingleHTML(html, perpage);
    }))
      .then( () => {
        return files.filter( file => {
          return !/\.html$/.test(file);
        });
      });
  }

  /**
   * Upload a single html file
   *
   * @param {String} file 文件路径
   * @param {Number} perpage 进度
   * @return {Promise}
   */
  uploadSingleHTML(file, perpage) {
    let html, allImages;
    return this.readHTML(file, this.path)
      .then( content => {
        html = content;
        return this.findAllImages(html);
      })
      .then(this.uploadSourceImages.bind(this))
      .then( images => {
        allImages = images;
        return this.generateThumbnail(images)
      })
      .then(this.uploadThumbnailImages.bind(this))
      .then( () => {
        return this.replaceImageSrc(html, allImages, file);
      })
      .then( newHTML => {
        return this.uploadFile(newHTML, file);
      })
      .catch(Uploader.catchAll);
  };

  /**
   * Upload the original images
   *
   * @param {Array} images 待上传的文件
   * @return {Promise}
   */
  uploadSourceImages(images) {
    return Promise.all(images.map( image => {
      return md5(image)
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
              if (stat.mtime <= this.record[image]) { // 上传过的不处理
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
          return this.uploadFile(image, 'images/' + result.hash + ext, result.hash);
        })
        .catch( err => {
          console.log(err);
        });
    }));
  }

  /**
   * Upload the thumbnail images
   *
   * @param {Array} images 待上传图片
   * @return {Promise}
   */
  uploadThumbnailImages(images) {
    this.sender.send('/upload/progress/', '开始上传缩略图');
    return Promise.all(images.filter( image => {
      return image.thumbnail;
    }).map( image => {
        let {thumbnail} = image;
        return this.uploadFile(this.tmp + thumbnail, 'images/' + thumbnail)
          .then( result => {
            return result;
          });
      }));
  }

  static catchAll(err) {
    console.log(err);
  }

  static isServerConfigured(config) {
    return config.ACCESS_KEY && config.SECRET_KEY && config.bucket;
  }

  logResult(result, source, hash) {
    this.record[source] = Date.now();
    fs.writeFile(this.path + LOG_FILE, JSON.stringify(this.record), 'utf8', err => {
      if (err) {
        throw err;
      }
    });
    console.log('Uploaded: ', source, hash, result);
    fs.appendFile(this.path + 'upload.log', `Upload ok: ${source}`, 'utf8');
    result.hash = hash; // 为了避免本地计算的 md5 和服务器不一致
    result.src = source;
    return result;
  };
}

module.exports = Uploader;