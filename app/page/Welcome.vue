<template>
  <form class="carousel slide welcome-panel" data-ride="carousel" data-interval="0" data-keyboard="false" id="welcome-wizard" @submit.prevent="onSubmit">
    <div class="carousel-inner" role="listbox">
      <div class="carousel-item active">
        <section>
          <h1>欢迎使用 Meart</h1>
          <p>Meart 是一个免费工具，试图帮助设计师、摄影师快捷方便的创建个人作品网站。Meart 尽量将技术细节隐藏起来，所有过程均通过图形界面操作来实现。最终网站托管在免费 CDN 上。</p>
          <p>接下来，请跟随向导指引，完成网初始化。</p>
        </section>
        <footer>
          <a href="#welcome-wizard" data-slide="next" role="button" class="btn btn-primary btn-lg carousel-control" tabindex="0">开始创建网站</a>
        </footer>
      </div>
      <div class="carousel-item info">
        <fieldset>
          <legend>基本信息</legend>
          <div class="form-group">
            <input class="form-control" name="site-title" id="site-title" placeholder="网站名称，比如“我的作品”" v-model="siteTitle" tabindex="1">
          </div>
          <div class="form-group">
            <textarea class="form-control" name="site-desc" id="site-desc" rows="3" placeholder="网站描述，在某些主题中会显示，主要用作被搜索时展示" v-model="siteDesc" tabindex="2">
            </textarea>
          </div>
          <div class="form-group">
            <p class="help-block" v-if="siteIcon">
              <img class="rounded img-thumbnail" :src="siteIcon" width="80" height="80">
            </p>
            <input type="file" class="hide" id="site-icon" @change="onSelectFile">
            <label class="btn btn-secondary" for="site-icon" tabindex="3">
              网站图标
            </label>
            <span class="text-muted"><small>（png，ico 格式，可选）</small></span>
          </div>
        </fieldset>
        <footer>
          <a href="#welcome-wizard" data-slide="next" role="button" class="btn btn-primary btn-lg carousel-control" tabindex="4">下一步</a>
        </footer>
      </div>
      <div class="carousel-item">
        <fieldset>
          <legend>选择模板</legend>
          <div class="form-group row theme-list">
            <div class="col-sm-4">
              <input type="radio" name="site-theme" value="default" id="theme-default" class="hide" v-model="siteTheme">
              <label class="card" for="theme-default">
                <img class="card-img" src="theme/default/img/thumbnail.svg" alt="默认主题">
                <div class="card-img-overlay">
                  <h4>默认主题</h4>
                  <p class="card-text">仅供测试使用。</p>
                </div>
              </label>
            </div>
            <div class="col-sm-4">
              <input type="radio" name="site-theme" value="dark" id="theme-dark" class="hide" v-model="siteTheme">
              <label class="card" for="theme-dark">
                <img class="card-img" src="theme/dark/img/thumbnail.svg" alt="黑色主题">
                <div class="card-img-overlay">
                  <h4>黑色主题</h4>
                  <p class="card-text">内容较完整，建议选择。</p>
                </div>
              </label>
            </div>
          </div>
        </fieldset>
        <footer>
          <button class="btn btn-primary btn-lg">开始</button>
        </footer>
      </div>
    </div>
  </form>
</template>

<script>
const fs = require('fs');
const _ = require('underscore');
const { ipcRenderer } = require('electron');
const MutationTypes = require('../store/mutation-types');

export default {
  name: 'welcome',
  data: () => {
    return {
      siteTitle: '',
      siteDesc: '',
      siteIcon: '',
      siteTheme: 'dark',
      articles: [
        {
          id: 0,
          title: '你好，世界',
          description: '这是一个范例，你可以通过它简单了解一下 Meart',
          status: 1,
          thumbnail: 'http://blog.meathill.com/wp-content/uploads/2017/01/IMG_2629.jpg',
          url: 'sample',
          tags: '',
          album: [
            {
              src: 'http://blog.meathill.com/wp-content/uploads/2017/01/IMG_2629.jpg',
              title: '台北省城隍庙',
              description: '你也来了，好，欢迎'
            }
          ]
        }
      ]
    }
  },
  methods: {
    onSubmit() {
      let data = _.pick(this.$data, [
        'siteTitle',
        'siteDesc',
        'siteIcon',
        'siteTheme',
        'articles'
      ]);
      data.articles[0].createTime = data.articles[0].lastModifiedTime = Date.now();
      ipcRenderer.sendSync('/site/init', data);
      _.each(data, (value, key) => {
        this.$store.commit(MutationTypes.SET_SITE_PROP, {
          key: key,
          value: value
        });
      });
      this.$router.app.$emit('site-init');
      this.$router.push({
        name: 'articleList'
      });
    },
    onSlide(event) {
      console.log(event);
    },
    onSelectFile(event) {
      let file = event.target.files[0];
      this.siteIcon = file.path;
    }
  },
  mounted() {
    $(this.$el).on('slid.bs.carousel', (event) => {
      let target = $(event.relatedTarget);
      if (target.hasClass('info')) {
        target.find('input').focus();
      }
    });
  }
};
</script>