/**
 * Created by meathill on 2016/12/29.
 */
const { shell } = require('electron');
const marked = require('marked');
const fs = require('fs');
const {version} = require('../../package.json');

let timeout;
let count = 0;

module.exports = {
  template: '#help-template',
  created() {
    this.readMD('about');
    this.readMD('author');
    this.readMD('tutorial');
  },
  data() {
    return {
      about: '',
      author: '',
      tutorial: '',
      avatar: 'http://qiniu.meathill.com/gravatar.jpg',
      version: version
    }
  },
  methods: {
    easter() {
      count++;
      clearTimeout(timeout);
      timeout = setTimeout( () => {
        count = 0;
      }, 1000);
      console.log(count);
      if (count > 10) {
        alert('变身！！');
        this.avatar = 'http://qiniu.meathill.com/wp-content/uploads/2011/08/MG_9178.jpg';
      }
    },
    openExternal(event) {
      shell.openExternal(event.target.href);
    },
    readMD(md, key = '') {
      key = key || md;
      $.get(`docs/${md}.md`)
        .then( content => {
          this[key] = marked(content);
        });
    }
  }
};