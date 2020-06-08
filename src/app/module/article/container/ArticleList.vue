<template>
  <div id="article-list" class="article-list article">
    <h2 class="row">我的作品集</h2>
    <ul class="list row">
      <li v-for="article in isVisible(articles)" class="col-sm-4 single-article">
        <a :href="getHref(article.id)" class="card">
          <img class="card-img-top img-fluid" :src="article.thumbnail" :alt="article.title" v-if="article.thumbnail">
          <div class="card-block">
            <h4 class="card-title">{{article.title}}</h4>
            <p class="card-text">{{article.description}}</p>
            <small class="text-muted">创建时间：<time :datetime="article.createTime | toDate">{{article.createTime | toMoment}}</time></small><br>
            <small class="text-muted">最后修改：<time :datetime="article.lastModifiedTime | toDate">{{article.lastModifiedTime | toMoment}}</time></small>
            <span class="status badge" :class="article.status ? 'badge-default' : 'badge-success'">{{article.status ? '草稿' : '已发布'}}</span>
          </div>
        </a>
      </li>
      <li class="article add col-sm-4">
        <button type="button" class="btn btn-secondary btn-block" v-on:click="add">
          <i class="fa fa-plus fa-4x"></i>
          <br>
          <span class="caption">新建作品集</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
import {mapState} from 'vuex';
const moment = require('@/mixin/moment');

export default {
  computed: {
    ...mapState('site', ['articles']),
  },
  data() {
    return {

    }
  },
  methods: {
    add() {
      this.$router.push({
        name: 'article',
        params: {
          id: 'new'
        }
      });
    },
    isVisible(articles) {
      return articles.filter((article) => {
        return !!article;
      });
    },
    getHref(value) {
      return '#/article/' + value;
    }
  },
  beforeMount() {
    debugger;
  },
  mixins: [moment]
};
</script>
