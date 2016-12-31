/**
 * Created by realm on 2016/12/19.
 */
const {ipcRenderer} = require('electron');
const Editor = require('../component/Editor');
const moment = require('../mixin/moment');
const MutationTypes = require('../store/mutation-types');

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
      id: null
    }
  },
  computed : {
    article() {
      return this.$store.state.articles[this.id];
    },
    isPublished() {
      return this.article.status === 0 ? ['bg-success', 'text-white'] : '';
    }
  },
  created () {
    this.fetchData();
    this.$watch('article', function () {
      this.article.lastModifiedTime = Date.now();
      if (this.isNew) {
        this.article.createTime = Date.now();
        this.id = this.article.id = ipcRenderer.sendSync('/article/new');
        this.isNew = false;
      }
      ipcRenderer.sendSync('/article/edit', this.id, this.article);
    }, {deep: true});
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
      this.$store.commit(MutationTypes.REMOVE_PHOTO, {
        id: this.id,
        index: index
      });
    },
    onClick(index) {
      this.$store.commit(MutationTypes.SELECT_PHOTO, {
        id: this.id,
        index: index
      });
    },
    onEditorChange(key, value) {
      this.$store.commit(MutationTypes.EDIT_ARTICLE, {
        id: this.id,
        key: key,
        value: value
      });
    },
    onPhotoChange(key, index, value) {
      this.$store.commit(MutationTypes.EDIT_PHOTO, {
        id: this.id,
        key: key,
        index: index,
        value: value
      });
    },
    onSelectFile(event) {
      let addon = Array.prototype.map.call(event.target.files, function (file) {
        return {
          src: file.path,
          title: file.name,
          description: ''
        }
      });
      this.$store.commit(MutationTypes.ADD_PHOTO, {
        id: this.id,
        photos: addon
      });
    },
    onSelectThumbnail(event) {
      this.$store.commit(MutationTypes.EDIT_ARTICLE, {
        id: this.id,
        key: 'thumbnail',
        value: event.target.files[0].path
      });
    }
  },
  mixins: [moment]
};