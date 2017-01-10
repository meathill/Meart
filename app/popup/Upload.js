/**
 * Created by meathill on 2017/1/8.
 */

const { ipcRenderer } = require('electron');
const AWAIT = 0;
const IN_PROGRESS = 1;
const OVER = 2;

module.exports = {
  created() {
    ipcRenderer.on('/upload/progress/', this.onProgress.bind(this));
    ipcRenderer.on('/upload/finish/', this.onFinish.bind(this));
  },
  data() {
    return {
      status: 0,
      isSuccess: false,
      label: '开始上传网站',
      progress: 0,
      messages: []
    };
  },
  computed: {
    isAwait() {
      return this.status === AWAIT;
    },
    isProgress() {
      return this.status === IN_PROGRESS;
    },
    isOver() {
      return this.status === OVER;
    }
  },
  methods: {
    start() {
      this.status = IN_PROGRESS;
      ipcRenderer.send('/upload/');
    },
    onFinish() {
      this.label = '生成完毕';
      this.progress = 100;
      this.isSuccess = true;
      this.status = OVER;
      $('#upload-modal').on('hidden.bs.modal', () => {
        this.status = AWAIT;
        this.isSuccess = false;
      });
      setTimeout( () => {
        $('#upload-modal').modal('hide');
      }, 3000);
    },
    onProgress(event, label, progress) {
      this.label = label;
      this.messages.push(label);
      if (progress === null) {
        this.progress = progress;
      }
    }
  }
};