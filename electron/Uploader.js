/**
 * Created by meathill on 2017/1/5.
 */
const http = require('http');
const { nativeImage } = require('electron');
const qiniu = require('qiniu');
const { generateAccessToken } = qiniu.util;
const md5 = require('md5-file/promise');
const _ = require('lodash');
const cheerio = require('cheerio');
const {appendFile, exists, mkdir, readDir, readFile, stat, writeFile} = require('./util/fs');
const LOG_FILE = '../site/upload-record.json';

const IMG_REG = /(href|style|src)="(?!https?:\/\/)([^"]+\.(?:jpg|jpeg|png|webp))[")]/ig;
const URL_REG = /url\((?!https?:\/\/)([^)]+\.(?:jpg|jpeg|png|webp))\)/ig;

const uploading = new Set();
let refreshFiles;
let record;
let config;

class Uploader {
  /**
   *
   * @param {Object} sender
   * @param {String} path
   * @param {Object} config
   */
  constructor(sender, path, config) {
    const {ACCESS_KEY, SECRET_KEY} = config;
    if (!Uploader.isServerConfigured(config)) {
      throw new Error('服务器配置信息不全');
    }
    this.mac = new qiniu.auth.digest.Mac(ACCESS_KEY, SECRET_KEY);
    this.sender = sender;
    this.path = path;
    this.tmpFolder = path + 'tmp/';
    refreshFiles = [];
    try {
      record = require(LOG_FILE);
    } catch (err) {
      record = {};
    }
  }

  async start() {
    await this.createTempFolder();
    const files = await this.findFiles();
    await this.uploadHTML(files);
    await this.uploadAssets();
    await this.refreshCDN();
    await this.finish();
  }

  async createTempFolder() {
    const isTempFolderExists = await exists(this.tmpFolder);
    if (isTempFolderExists) {
      return;
    }

    return mkdir(this.tmpFolder);
  }

  findAllImages(html) {
    let images = [];
    $ = cheerio.load(html);
    $('img').src(src => {
      images.push(src);
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
    return readDir(this.path);
  }

  finish(refresh) {
    this.sender.send('/upload/finish/', refresh);
  }

  /**
   * 生成缩略图，存放在 ./output/tmp 目录里
   * 只生成没过期，之前上传的图片
   * 特征是由服务器返回，有 key
   *
   * @param {Array} images
   * @returns {Promise}
   */
  generateThumbnail(images) {
    this.sender.send('/upload/progress/', '开始生成缩略图');
    return Promise.all(images.filter(image => image.key).map(async image => {
      const {src, hash, key} = image;
      const ext = key.substr(key.lastIndexOf('.'));
      const filename = hash + '@h400' + ext;
      let img = nativeImage.createFromPath(src);
      img = img.resize( {
        height: 400
      });
      const data = /\.png$/i.test(ext) ? img.toPNG() : img.toJPEG(85);
      await writeFile(this.tmpFolder + filename, data);
      image.thumbnail = filename;
      return image;
    }));
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
    return readFile(path + html, 'utf8');
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
   * 刷新 CDN 缓存
   */
  refreshCDN() {
    let api = '/v2/tune/refresh';
    let access_token = generateAccessToken(api);
    let options = {
      host: 'fusion.qiniuapi.com',
      method: 'POST',
      path: api,
      headers: {
        'Content-Type': 'application/json',
        Authorization: access_token
      }
    };
    return new Promise( resolve => {
      let req = http.request(options, result => {
        let body = '';
        result.setEncoding('utf8');
        result.on('data', (chunk) => {
          body += chunk;
        });
        result.on('end', () => {
          body = JSON.parse(body);
          console.log('Refresh CDN: ', body);
          resolve(body);
        });
      });

      req.on('error', err => {
        console.log(`problem with request: ${err.message}`);
        throw err;
      });

      req.write(JSON.stringify({
        urls: _.unique(refreshFiles).map( url => {
          return config.host + url;
        })
      }));
      req.end();
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
      return Uploader.getImageURL(map, src);
    });
    $('link[rel="shortcut icon"]').attr('href', (i, href) => {
      return Uploader.getImageURL(map, href);
    });
    $('a').attr('href', (i, href) => {
      if (/^(https:)?\/\//i.test(href) || !/\.(jpg|jpeg|bmp|gif|png|webp)$/i.test(href)) {
        return href;
      }
      return Uploader.getImageURL(map, href);
    });
    $('[style]').attr('style', function (i, style) {
      let useSource = $(this).hasClass('carousel-item') || $(this).hasClass('use-source');
      return style.replace(URL_REG, (match, src) => {
        let to = Uploader.getImageURL(map, src, useSource);
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
          if (!(source in record) || stat.mtime > record[source]) {
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
   */
  async uploadFile(source, to = '', hash = '') {
    if (uploading.has(source)) {
      return;
    }
    this.sender.send('/upload/progress/', '开始上传：' + source);
    to = to || source;
    refreshFiles.push(to);
    const options = {
      key: to,
      scope: `${bucket}:${to}` ,
    };
    const policy = new qiniu.rs.PutPolicy(options);
    const token = policy.uploadToken(mac);
    uploading.add(source);
    try {
      const result = this.qiniu.uploadFile(source, options);
    } catch (err) {
      if (err.code === 614) {
        const result = {
          key: to,
          hash: hash,
          src: source,
        };
      }
      throw err;
    }
    this.logResult(result, source, result.hash);
    appendFile(this.path + 'upload.log', `Upload: ${source}\n`, 'utf8');
    uploading.delete(source);
  }

  /**
   * Upload all html files
   *
   * @param {Array} files 全部文件
   * @return {Promise}
   */
  async uploadHTML(files) {
    this.sender.send('/upload/progress/', '开始上传网页', 2);
    let htmls = files.filter(file => /\.html$/.test(file));
    let perPage = 68 / htmls.length;
    let count = 0;
    for (const html of htmls) {
      this.sender.send('/upload/progress/', '准备上传：' + html, 2 + count * perPage);
      await this.uploadSingleHTML(html, perPage);
    }
    return files.filter( file => {
      return !/\.html$/.test(file);
    });
  }

  /**
   * Upload a single html file
   *
   * @param {String} file 文件路径
   * @return {Promise}
   */
  async uploadSingleHTML(file, perPage) {
    const html = await this.readHTML(file, this.path);
    let allImages = await this.findAllImages(html);
    allImages = await this.uploadSourceImages(allImages);
    allImages = await this.generateThumbnail(allImages);
    await this.uploadThumbnailImages(allImages);
    const newHTML = this.replaceImageSrc(html, allImages, file);
    await this.uploadFile(newHTML, file);
  };

  /**
   * Upload the original images
   *
   * @param {Array} images 待上传的文件
   * @return {Promise}
   */
  uploadSourceImages(images) {
    return Promise.all(images.map(async image => {
      const hash = await md5(image);
      const {size, mtime} = await stat(image);
      const result = {
        hash,
        src: image,
        size,
      };
      if (mtime <= record[image]) { // 上传过的不处理
        return result;
      }
      let ext = image.substr(image.lastIndexOf('.'));
      return this.uploadFile(image, 'images/' + result.hash + ext, result.hash);
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
    return Promise.all(images.filter(image => image.thumbnail).map(image => {
      let {thumbnail} = image;
      return this.uploadFile(this.tmpFolder + thumbnail, 'images/' + thumbnail);
    }));
  }

  static catchAll(err) {
    console.log(err);
  }

  static getImageURL(map, src, useSource = true) {
    let image = map[src];
    let ext = src.substr(src.lastIndexOf('.'));
    if (useSource) {
      return image.key || 'images/' + image.hash + ext;
    }
    return 'images/' + (image.thumbnail || image.hash + '@h400' + ext);
  }

  static isServerConfigured(config) {
    return config.ACCESS_KEY && config.SECRET_KEY && config.bucket;
  }

  logResult(result, source, hash) {
    record[source] = Date.now();
    fs.writeFile(this.path + LOG_FILE, JSON.stringify(record), 'utf8', err => {
      if (err) {
        throw err;
      }
    });
    console.log('Uploaded: ', source, hash, result);
    fs.appendFile(this.path + 'upload.log', `Upload ok: ${source}`, 'utf8', err => {
      if (err) {
        throw err;
      }
    });
    result.hash = hash; // 为了避免本地计算的 md5 和服务器不一致
    result.src = source;
    return result;
  };
}

module.exports = Uploader;