/**
 * Created by realm on 2016/12/19.
 */
const {ipcRenderer} = require('electron');
const Editor = require('../component/Editor');
const moment = require('../mixin/moment');

module.exports = {
  name: 'Article',
  template: '#article-template',
  components: {
    'editor': Editor
  },
  data () {
    return {
      loading: true,
      isNew: true,
      id: null,
      article: {
        title: '相册标题',
        description: '相册简介',
        url: '路径名称',
        tags: '标签',
        create_time: '',
        last_modified_time: '',
        thumbnail: '',
        status: 0,
        album: []
      }
    }
  },
  created () {
    this.fetchData();
    this.$watch('article', function () {
      this.article.last_modified_time = Date.now();
      if (this.isNew) {
        this.article.create_time = Date.now();
        this.id = this.article.id = ipcRenderer.sendSync('/article/new');
        this.isNew = false;
      }
      ipcRenderer.sendSync('/article/edit', this.id, this.article);
    }, {deep: true});
  },
  computed: {
    isPublished() {
      return this.article.status === 0 ? ['bg-success', 'text-white'] : '';
    }
  },
  filters: {
    defaultThumbnail(value) {
      return value || 'img/thumbnail.svg';
    }
  },
  methods: {
    fetchData () {
      let id = this.$route.params.id;
      if (id === 'new') {
        this.loading = false;
      } else {
        this.isNew = false;
        this.id = id = Number(id);
        this.article = ipcRenderer.sendSync('/article/', id);
        this.loading = false;
      }
    },
    remove(index) {
      this.article.albums.splice(index, 1);
    },
    onClick(index) {
      this.article.albums[index].isActive = !this.article.albums[index].isActive;
    },
    onEditorChange(key, value) {
      this.article[key] = value;
    },
    onPhotoChange(key, index, value) {
      this.article.albums[index][key] = value;
    },
    onSelectFile(event) {
      let addon = Array.prototype.map.call(event.target.files, function (file) {
        return {
          src: file.path,
          title: file.name,
          description: ''
        }
      });
      this.article.albums = this.article.albums.concat(addon);
    },
    onSelectThumbnail(event) {
      this.article.thumbnail = event.target.files[0].path;
    }
  },
  mixins: [moment]
};