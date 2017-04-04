/**
 * Created by realm on 2016/12/19.
 */
const _ = require('underscore');
const Editor = require('../component/Editor');
const moment = require('../mixin/moment');
const MutationTypes = require('../store/mutation-types');
const ActionTypes = require('../store/action-types');
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
      id: null
    }
  },
  computed : {
    host() {
      return this.$store.state.server.host || 'http://您的网站/';
    },
    publishedClass() {
      return this.article.status === 0 ? ['bg-success', 'text-white'] : '';
    }
  },
  beforeDestroy() {
    this.$store.commit(MutationTypes.SAVE_ARTICLE, {
      id: this.id,
      article: this.article
    });
    this.$store.dispatch(ActionTypes.SAVE);
  },
  created() {
    let id = this.$route.params.id;
    if (id !== 'new') {
      this.isNew = false;
      this.id = id = Number(id);
    }
    this.article = _.extend({}, this.isNew ? defaults : this.$store.state.site.articles[this.id]);
  },
  filters: {
    defaultValue(value, key) {
      return value || defaults[key];
    }
  },
  methods: {
    checkNew: function () {
      if (this.isNew) {
        this.id = this.$store.getters.newID;
        this.$store.commit(MutationTypes.ADD_ARTICLE, {
          id: this.id
        });
        this.isNew = false;
      }
    },
    remove(index) {
      this.article.album.splice(index, 1);
    },
    onEditorChange(key, value) {
      this.checkNew();
      this.article[key] = value;
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
      this.checkNew();
      let addon = map.call(event.target.files, file => {
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
    onSelectThumbnail(event) {
      this.checkNew();
      this.article.thumbnail = event.target.files[0].path;
    }
  },
  mixins: [moment]
};