/**
 * Created by realm on 2016/12/19.
 */
const {ipcRenderer} = require('electron');
const Editor = require('../component/Editor');

module.exports = {
  name: 'Article',
  template: '#article',
  components: {
    'editor': Editor
  },
  data () {
    return {
      loading: true,
      article: {
        id: null,
        title: '相册标题',
        description: '相册简介',
        url: '路径名称',
        create_time: '',
        last_modified_time: '',
        albums: []
      }
    }
  },
  created () {
    this.fetchData();
  },
  methods: {
    fetchData () {
      let id = this.$route.params.id;
      if (id === 'new') {
        this.loading = false;
      } else {
        this.article = ipcRenderer.sendSync('fetch-article', {
          id: id
        });
        this.loading = false;
      }
    },
    onEditorChange(key, value) {
      this.article[key] = value;
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
    }
  }
};