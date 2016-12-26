/**
 * Created by meathill on 2016/12/26.
 */
module.exports = {
  filters: {
    toMoment(value) {
      return moment(value).calendar();
    },
    toDate(value) {
      return moment(value).format('YYYY-MM-DD HH:mm:ss');
    }
  }
};