<template>
  <article class="single article">
    <template>
      <header class="row">
        <div class="col-sm-4 thumbnail">
          <input type="file" class="hide" id="article-thumbnail" @change="onSelectThumbnail">
          <label for="article-thumbnail">
            <img :src="article.thumbnail | defaultValue('thumbnail')" class="img-thumbnail"  :class="thumbnail" @dragend.prevent="thumbnail_onDragEnd" @dragenter="thumbnail_onDragEnter" @dragexit="thumbnail_onDragExit">
          </label>
        </div>
        <div class="col-sm-5">
          <editor :origin-value="article.title" @change="onEditorChange('title', $event)">
            <h1>{{article.title | defaultValue('title')}}</h1>
          </editor>
          <editor :origin-value="article.description" @change="onEditorChange('description', $event)">
            <p>{{article.description | defaultValue('description')}}</p>
          </editor>
          <editor :origin-value="article.url" @change="onEditorChange('url', $event)">
            <p>
              <u><small class="text-muted">{{host}}</small>{{article.url | defaultValue('url')}}<small class="text-muted">.html</small></u>
            </p>
          </editor>
          <editor :origin-value="article.tags" @change="onEditorChange('tags', $event)">
            <p>{{article.tags | defaultValue('tags')}}</p>
          </editor>
          <p class="text-muted">
            <small>创建时间：<time :datetime="article.createTime | toDate">{{article.createTime | toMoment}}</time></small> |
            <small>修改时间：<time :datetime="article.lastModifiedTime | toDate">{{article.lastModifiedTime | toMoment}}</time></small>
          </p>
        </div>
        <div class="col-sm-2 offset-sm-1">
          <div class="form-group row form-inline">
            <label for="draft" class="col-sm-4">状态：</label>
            <select v-model.number="article.status" id="draft" class="form-control fa col-sm-8" :class="publishedClass" :disabled="isNew">
              <option value="0" class="fa-check">&#xf00c 发布</option>
              <option value="1">草稿</option>
            </select>
          </div>
        </div>
      </header>
      <ul class="row list album">
        <li v-for="(photo, index) in article.album" class="col-sm-4 photo" :class="{ active: photo.isActive }">
          <div class="card">
            <button type="button" class="btn btn-sm btn-secondary delete-button" @click="removePhoto(index)">
              <i class="fa fa-trash"></i>
            </button>
            <img class="card-img-top img-fluid" :src="photo.src" :alt="photo.title" @load="onPhotoLoad($event, index)">
            <div class="card-block">
              <editor :origin-value="photo.title" @change="onPhotoChange('title', index, $event)">
                <h4 class="card-title">{{photo.title}}</h4>
              </editor>
              <editor :origin-value="photo.title" @change="onPhotoChange('description', index, $event)">
                <p class="card-text">{{photo.description}}</p>
              </editor>
            </div>
          </div>
        </li>
        <li class="col-sm-4 add" :class="addButton" @dragenter="addButton_onDragEnter" @dragexit="addButton_onDragExit" @dragend.prevent="addButton_onDragEnd">
          <label class="btn btn-secondary btn-block">
            <i class="fa fa-plus fa-4x"></i>
            <br>
            <span class="caption">添加新作品</span>
            <input type="file" accept="image/*" @change="onSelectFile" multiple>
          </label>
        </li>
      </ul>
    </template>
  </article>
</template>

<script>
const _ = require('underscore');
const Editor = require('../component/Editor');
const moment = require('../mixin/moment');
const MutationTypes = require('../store/mutation-types');
const ActionTypes = require('../store/action-types');
const { assignRecursive } = require('../utils/object');
const defaults = require('./../store/articleDefault.json');
const map = Array.prototype.map;

module.exports = {
  name: 'Article',
  template: '#article-template',
  components: {
    'editor': Editor
  },
  data () {
    return {
      article: null,
      isNew: true,
      id: null,
      thumbnail: '',
      addButton: ''
    };
  },
  computed : {
    host() {
      return this.$store.state.server.host || 'http://您的网站/';
    },
    publishedClass() {
      return this.article.status === 0 ? ['bg-success', 'text-white'] : '';
    }
  },
  beforeRouteLeave(from, to, next) {
    this.$store.commit(MutationTypes.SAVE_ARTICLE, {
      id: this.id,
      article: this.article
    });
    this.$store.dispatch(ActionTypes.SAVE);
    next();
  },
  created() {
    let id = this.$route.params.id;
    if (id !== 'new') {
      this.isNew = false;
      this.id = id = Number(id);
    }
    this.article = this.isNew ? _.extend({}, defaults) : assignRecursive(this.$store.state.site.articles[this.id]);
  },
  filters: {
    defaultValue(value, key) {
      return value || defaults[key];
    }
  },
  methods: {
    addPhotos: function (files) {
      this.checkNew();
      let addon = map.call(files, file => {
        return {
          src: file.path,
          title: file.name,
          description: ''
        }
      });
      if (!this.article.thumbnail && addon.length) {
        this.article.thumbnail = addon[0].src;
      }
      this.article.album = this.article.album.concat(addon);
    },
    checkNew: function () {
      if (this.isNew) {
        this.id = this.$store.getters.newID;
        this.$store.commit(MutationTypes.ADD_ARTICLE, {
          id: this.id
        });
        this.isNew = false;
      }
    },
    removePhoto(index) {
      this.article.album.splice(index, 1);
    },
    set: function (key, value) {
      this.checkNew();
      this.article[key] = value;
    },
    addButton_onDragEnd(event) {
      if (event.dataTransfer.files) {
        this.addPhotos(event.dataTransfer.files);
      }
    },
    addButton_onDragEnter() {
      this.addButton = 'active';
    },
    addButton_onDragExit() {
      this.addButton = '';
    },
    thumbnail_onDragEnd(event) {
      if (event.dataTransfer.files) {
        this.set('thumbnail', event.dataTransfer.files[0].path);
      }
    },
    thumbnail_onDragEnter() {
      this.thumbnail = 'active';
    },
    thumbnail_onDragExit() {
      this.thumbnail = '';
    },
    onEditorChange(key, value) {
      this.set(key, value);
    },
    onPhotoLoad(event, index) {
      if (this.article.album[index].aspectRatio) {
        return;
      }
      this.article.album[index].width = event.target.width;
      this.article.album[index].height = event.target.height;
    },
    onPhotoChange(key, index, value) {
      this.checkNew();
      this.article.album[index][key] = value;
    },
    onSelectFile(event) {
      this.addPhotos(event.target.files);
    },
    onSelectThumbnail(event) {
      this.set('thumbnail', event.target.files[0].path);
    }
  },
  mixins: [moment]
};
</script>