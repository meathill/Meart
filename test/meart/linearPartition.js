/**
 * Created by meathill on 2017/1/4.
 */

const should = require('should');
const linearPartition = require('../../src/electron/lib/linearPartition');

describe('split', () => {
  let source = [9,2,6,3,8,5,8,1,7,3,4];
  it('should split into 3', () => {
    let result = linearPartition(source, 3);
    should(result).be.an.Array();
    should(result.length).be.exactly(3);
    should(result[0]).deepEqual([9, 2, 6, 3]);
    should(result[1]).deepEqual([8, 5, 8]);
    should(result[2]).deepEqual([1, 7, 3, 4]);
    console.log(result);
  });
});

