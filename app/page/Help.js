/**
 * Created by meathill on 2016/12/29.
 */
const { shell } = require('electron');
const marked = require('marked');
const fs = require('fs');

let timeout;
let count = 0;

module.exports = {
  template: '#help-template',
  created() {
    fs.readFile('docs/about.md', 'utf8', (err, content) => {
      if (err) {
        throw err;
      }
      this.about = marked(content);
    });
    fs.readFile('docs/author.md', 'utf8', (err, content) => {
      if (err) {
        throw  err;
      }
      this.author = marked(content);
    });
  },
  data() {
    return {
      about: '',
      author: '',
      avatar: 'http://qiniu.meathill.com/gravatar.jpg'
    }
  },
  methods: {
    easter(event) {
      count++;
      clearTimeout(timeout);
      timeout = setTimeout( () => {
        count = 0;
      }, 1000);
      console.log(count);
      if (count > 10) {
        this.avatar = 'http://qiniu.meathill.com/wp-content/uploads/2011/08/MG_9178.jpg';
      }
    },
    openExternal(event) {
      shell.openExternal(event.target.href);
    }
  }
};