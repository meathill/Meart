/**
 * Created by realm on 2017/1/3.
 */
module.exports = {
  newID: state => {
    return state.articles.length;
  }
};