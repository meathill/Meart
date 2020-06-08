/**
 * Created by meathill on 2017/1/5.
 */

const should = require('should');
const flexGrid = require('../../../src/electron/template/flexGrid');

const testCase = [
  {
    "aspectRatio": 1.8
  }, {
    "aspectRatio": .4
  }, {
    "aspectRatio": 1.2
  }, {
    "aspectRatio": .6
  }, {
    "aspectRatio": 1.6
  }, {
    "aspectRatio": 1
  }, {
    "aspectRatio": 1.6
  }, {
    "aspectRatio": .2
  }, {
    "aspectRatio": 1.4
  }, {
    "aspectRatio": .6
  }, {
    "aspectRatio": .8
  }
];
const expect = [
  {
    width: 1200 * 9 / 11,
  },
  {
    width: 1200 * 2 / 11,
  },
  {
    width: 1200 * 6 / 17,
  },
  {
    width: 1200 * 3 / 17,
  },
  {
    width: 1200 * 8 / 17,
  },
  {
    width: 1200 * 5 / 13,
  },
  {
    width: 1200 * 8 / 13,
  },
  {
    width: 1200 / 15,
  },
  {
    width: 1200 * 7 / 15,
  },
  {
    width: 1200 * 3 / 15,
  },
  {
    width: 1200 * 4 /15,
  }
];
const options = {
  debug: true,
  fn(item) {
    return item.size;
  }
};

describe('create flex grid', () => {
  it('should be correct', () => {
    let result = flexGrid(testCase, options);
    result.forEach( (item, index) => {
      should(item.width >> 0).be.exactly(expect[index].width >> 0);
    });
  });
});

describe('height may not be 0', () => {
  it('should be correct', () => {
    let site = require('../../../site/site.json');
    let article = site.articles[1];
    let result = flexGrid(article.album, options);
    result.forEach( (item, index) => {
      should(item.height).be.greaterThan(0);
    })
  });
});
