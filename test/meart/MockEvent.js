/**
 * Created by meathill on 2017/1/6.
 */

module.exports = {
  sender: {
    send: function (event, label, progress) {
      console.log(event, label, progress);
    }
  }
};