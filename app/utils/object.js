/**
 * Created by meathill on 2017/4/4.
 */

const _ = require('underscore');

function assignRecursive(from) {
  if (!_.isArray(from) && !_.isObject(from)) {
    return from;
  }
  let to = _.isArray(from) ? from.slice() : Object.assign({}, from);
  for (let prop in from) {
    if (!from.hasOwnProperty(prop)
      || (!_.isArray(from[prop]) && !_.isObject(from[prop]))
      || _.isFunction(from[prop])) {
      continue;
    }
    to[prop] = assignRecursive(from[prop]);
  }
  return to;
}

module.exports = {
  assignRecursive: assignRecursive
};