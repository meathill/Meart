/**
 * Created by meathill on 2017/1/8.
 */
const { ipcRenderer } = require('electron');
const MutationTypes = require('../store/mutation-types');

module.exports = {
  created() {
    ipcRenderer.on('/upload/progress/', this.onProgress.bind(this));
    ipcRenderer.on('/upload/finish/', this.onFinish.bind(this));
  },
  data() {
    return {
      isProgress: false,
      isSuccess: false,
      label: '开始上传网站',
      progress: 0
    };
  },
  methods: {
    start() {
      this.isProgress = true;
      ipcRenderer.send('/upload/');
    },
    onFinish(event, time) {
      this.label = '生成完毕';
      this.progress = 100;
      this.isSuccess = true;
      $('#upload-modal').one('hidden.bs.modal', () => {
        this.isProgress = this.isSuccess = false;
      });
      setTimeout( () => {
        $('#upload-modal').modal('hide');
      }, 3000);
    },
    onProgress(event, label, progress) {
      this.label = label;
      if (progress === null) {
        this.progress = progress;
      }
    }
  }
};