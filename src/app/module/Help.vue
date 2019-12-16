<template>
  <div id="help">
    <header class="row">
      <h2>帮助</h2>
    </header>
    <ul class="nav nav-tabs row" role="tablist">
      <li class="nav-item">
        <a class="nav-link active" data-toggle="tab" role="tab" href="#help-detail">帮助</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" data-toggle="tab" role="tab" href="#help-about">关于</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" data-toggle="tab" role="tab" href="#help-author">作者</a>
      </li>
    </ul>
    <div class="row">
      <div class="tab-content">
        <div class="tab-pane active" id="help-detail" role="tabpanel">
          <article v-html="tutorial">

          </article>
        </div>
        <div class="tab-pane" id="help-about" role="tabpanel">
          <article v-html="about"></article>
          <h3>当前版本：</h3>
          <p>{{version}}</p>
        </div>
        <div class="tab-pane" id="help-author" role="tabpanel">
          <div class="row">
            <article class="col-sm-6">
              <h3>你好，我是 Meart 的开发者 Meathill</h3>
              <p>
                <img :src="avatar" @click="easter" class="img-thumbnail card-img-top">
              </p>
              <article v-html="author"></article>
            </article>
            <article class="col-sm-6">
              <h3>如果觉得 Meart 不错，<br>请我喝杯咖啡吧</h3>
              <div class="row">
                <div class="col-sm-6">
                  <img src="img/weixin-qrcode.jpg" class="card-img-top img-fluid img-thumbnail">
                  <p class="t-a-c">微信支付</p>
                </div>
                <div class="col-sm-6">
                  <img src="img/zhifubao-qrcode.jpg" class="card-img-top img-fluid img-thumbnail">
                  <p class="t-a-c">支付宝支付</p>
                </div>
              </div>
              <p class="lead">
                您的支持是我坚持下去的动力，<br>
                THANK YOU All！
              </p>
            </article>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const { shell } = require('electron');
const marked = require('marked');
const fs = require('fs');
const {version} = require('../../../package.json');

let timeout;
let count = 0;

export default {
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
    readMD(md, key = '') {
      key = key || md;
      $.get(`docs/${md}.md`)
        .then( content => {
          this[key] = marked(content);
        });
    }
  }
};
</script>
