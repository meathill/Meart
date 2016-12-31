const { ipcRenderer } = require('electron');
const MutationTypes = require('../store/mutation-types');

module.exports = {
  created() {
    ipcRenderer.on('/publish/progress/', this.onProgress.bind(this));
    ipcRenderer.on('/publish/finish/', this.onFinish.bind(this));
  },
  data() {
    return {
      isProgress: false,
      isSuccess: false,
      label: '开始发布网站',
      progress: 0
    };
  },
  methods: {
    start() {
      this.isProgress = true;
      ipcRenderer.send('/publish/');
    },
    onFinish(event, time) {
      this.label = '生成完毕';
      this.progress = 100;
      this.$store.commit(MutationTypes.SET_PUBLISH_TIME, {
        time: time
      });
      this.isSuccess = true;
      $('#publish-modal').one('hidden.bs.modal', () => {
        this.isProgress = this.isSuccess = false;
      });
      setTimeout( () => {
        $('#publish-modal').modal('hide');
      }, 3000);
    },
    onProgress(event, label, progress) {
      this.label = label;
      this.progress = progress;
    }
  }
};