<template>
  <div id="preview">
    <header class="row">
      <h2>预览网站</h2>
      <p class="text-muted">上次生成时间：<time :datetime="publishTime | toDate" v-if="publishTime">{{publishTime | toMoment}}</time>
        <span class="badge badge-success" v-if="publishTime > lastModifiedTime"><i class="fa fa-check"></i> 最新</span><br>
        最近修改时间：<time :datetime="lastModifiedTime | toDate" v-if="lastModifiedTime">{{lastModifiedTime | toMoment}}</time>
      </p>
      <div class="button-group" role="group" aria-label="发布操作">
        <a href="#publish-modal" class="btn btn-outline-primary" data-toggle="modal">发布网站</a>
        <a href="#upload-modal" class="btn btn-outline-success" :data-toggle="hasUpload ? 'modal' : ''" :class="{disabled: !hasUpload}">上传到服务器</a>
      </div>
    </header>
    <nav class="navbar navbar-light bg-faded row" v-if="publishTime">
      <form class="form-inline float-left">
        <button type="button" class="btn btn-secondary" @click="goBack"><i class="fa fa-chevron-left"></i></button>
        <button type="button" class="btn btn-secondary" @click="refresh"><i class="fa fa-refresh"></i></button>
      </form>
    </nav>
    <div class="row" v-if="publishTime">
      <iframe src="output/index.html" :height="height"></iframe>
    </div>
    <div class="alert alert-warning" v-else>
      <p>您还没有生成过网站页面，无法提供预览效果。</p>
      <a href="#publish-modal" class="btn btn-primary btn-lg" data-toggle="modal"><i class="fa fa-archive"></i> 立刻发布网站</a>
    </div>
  </div>
</template>

<script>
const _ = require('lodash');
const moment = require('../mixin/moment');

export default {
  name: 'Preview',
  data() {
    return {
      height: 200
    }
  },
  computed: _.extend({
    hasSever() {
      let server = this.$store.state.server;
      return server.ACCESS_KEY && server.SECRET_KEY && server.bucket;
    },
    hasUpload() {
      return this.hasSever && this.publishTime;
    }
  }, Vuex.mapState([
    'lastModifiedTime',
    'publishTime'
  ])),
  watch: {
    publishTime() {
      this.refresh();
    }
  },
  mounted() {
    this.history = history.length;
    this.height = window.innerHeight - this.$el.querySelector('header').offsetHeight - 105;
  },
  methods: {
    goBack() {
      this.$el.querySelector('iframe').contentWindow.history.go(-1);
    },
    refresh() {
      let iframe = this.$el.querySelector('iframe');
      if (iframe) {
        iframe.contentWindow.location.reload();
      }
    }
  },
  mixins: [moment]
};
</script>