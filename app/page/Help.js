/**
 * Created by meathill on 2016/12/29.
 */
const marked = require('marked');
const fs = require('fs');

module.exports = {
  template: '#help-template',
  created() {
    fs.readFile('docs/about.md', 'utf8', (err, content) => {
      if (err) {
        throw err;
      }
      this.about = marked(content);
    });
  },
  data() {
    return {
      about: ''
    }
  }
};