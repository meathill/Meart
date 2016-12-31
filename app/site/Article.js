/**
 * Created by realm on 2016/12/19.
 */
const Editor = require('../component/Editor');
const moment = require('../mixin/moment');
const MutationTypes = require('../store/mutation-types');
const ActionTypes = require('../store/action-types');

module.exports = {
  name: 'Article',
  template: '#article-template',
  components: {
    'editor': Editor
  },
  data () {
    return {
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
    let id = this.$route.params.id;
    if (id != 'new') {
      this.isNew = false;
      this.id = id = Number(id);
    }
  },
  filters: {
    defaultThumbnail(value) {
      return value || 'img/thumbnail.svg';
    }
  },
  methods: {
    remove(index) {
      this.$store.commit(MutationTypes.REMOVE_PHOTO, {
        id: this.id,
        index: index
      });
      this.$store.dispatch(ActionTypes.SAVE);
    },
    onClick(index) {
      this.$store.commit(MutationTypes.SELECT_PHOTO, {
        id: this.id,
        index: index
      });
      this.$store.dispatch(ActionTypes.SAVE);
    },
    onEditorChange(key, value) {
      this.$store.commit(MutationTypes.EDIT_ARTICLE, {
        id: this.id,
        key: key,
        value: value
      });
      this.$store.dispatch(ActionTypes.SAVE);
    },
    onPhotoChange(key, index, value) {
      this.$store.commit(MutationTypes.EDIT_PHOTO, {
        id: this.id,
        key: key,
        index: index,
        value: value
      });
      this.$store.dispatch(ActionTypes.SAVE);
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
      this.$store.dispatch(ActionTypes.SAVE);
    },
    onSelectThumbnail(event) {
      this.$store.commit(MutationTypes.EDIT_ARTICLE, {
        id: this.id,
        key: 'thumbnail',
        value: event.target.files[0].path
      });
      this.$store.dispatch(ActionTypes.SAVE);
    }
  },
  mixins: [moment]
};