/**
 * Created by meathill on 2017/1/6.
 */

import Handlebars from 'handlebars';
import moment from 'moment';
import flexGrid from './flexGrid';

moment.locale('zh-cn');

Handlebars.registerHelper('toCalendar', (value) => {
  return moment(value).calendar();
});
Handlebars.registerHelper('toDate', (value) => {
  return moment(value).format('YYYY-MM-DD HH:mm:ss');
});
Handlebars.registerHelper('equal', function(expect, actual, options) {
  if (expect === actual) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});
Handlebars.registerHelper('top', (array, max, options) => {
  if (!array || array.length === 0) {
    return options.inverse(this);
  }

  return array.slice(0, max).map( (item, index) => {
    return options.fn(item, {data: {
      index: index,
      first: index === 0
    }});
  }).join('');
});
Handlebars.registerHelper('ifnull', (value, backup) => {
  return value || backup;
});
Handlebars.registerHelper('flexGrid', flexGrid);