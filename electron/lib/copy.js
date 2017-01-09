/**
 * Created by meathill on 2017/1/9.
 */
let fs = require('fs');

/**
 * 复制一个文件
 *
 * @param {String} source 源文件地址
 * @param {String} to 目标文件地址
 * @returns {Promise}
 */
module.exports = function (source, to) {
  let read = fs.createReadStream(source);
  let write = fs.createReadStream(to);

  return new Promise( (resolve, reject) => {
    read.on('error', err => {
      reject(err);
    });

    write.on('finish', () => {
      resolve();
    });
    write.on('error', err => {
      reject(err);
    });

    read.pipe(write);
  });
};