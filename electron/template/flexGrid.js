/**
 * Created by meathill on 2017/1/5.
 *
 * @see https://medium.com/@jtreitz/the-algorithm-for-a-perfectly-balanced-photo-gallery-914c94a5d8af#.w1ix50am1
 */

const linearPartition = require('../lib/linearPartition');

function output (photos, options) {
  photos = photos.map(photo => {
    return options.fn(photo);
  });
  return options.debug ? photos : photos.join('');
}
/**
 *
 * @param {Array} photos
 * @param {Object} options
 *
 * @returns {String|Array}
 */
module.exports = (photos, options) => {
  // 假定分辨率都是 1200 以上
  let viewportWidth = 1200;
  let height = 400;
  let summedWidth = photos.reduce( (memo, photo) => {
    /** @param {Number} photo.aspectRatio */
    return memo + photo.aspectRatio * height;
  }, 0);
  let rows = Math.round(summedWidth / viewportWidth);

  if (rows < 1) {
    photos = photos.map( photo => {
      photo.size = {
        width: photo.width,
        height: photo.height
      };
      return output(photos, options);
    });
  }

  let weights = photos.map( photo => {
    return photo.aspectRatio * 100 >> 0;
  });
  let partitions = linearPartition(weights, rows);

  let index = 0;
  partitions.forEach( row => {
    let rowPhotos = photos.slice(index, index + row.length);
    let summedRatios = rowPhotos.reduce( (sum, photo) => {
      return sum + photo.aspectRatio;
    }, 0);
    rowPhotos.forEach( photo => {
      photo.size = {
        flex: photo.aspectRatio * 100 >> 0,
        height: viewportWidth / summedRatios >> 0
      };
    });
    rowPhotos[row.length - 1].isLast = true;
    index += row.length;
  });

  return output(photos, options);
};