/**
 * Created by meathill on 2016/12/26.
 */
module.exports = {
  filters: {
    toMoment(value) {
      return value ? moment(value).calendar() : '（无）';
    },
    toDate(value) {
      return value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : '（无）';
    }
  }
};