const { ipcRenderer } = require('electron');

module.exports = {
  created() {
    ipcRenderer.on('/publish/progress/', this.onProgress.bind(this));
    ipcRenderer.on('/publish/finish/', this.onFinish.bind(this));
  },
  data() {
    return {
      isProgress: false,
      label: '开始发布网站',
      progress: 0
    };
  },
  methods: {
    start() {
      this.isProgress = true;
      ipcRenderer.send('/publish/');
    },
    onFinish() {
      this.label = '生成完毕';
      this.progress = 100;
      setTimeout( () => {
        this.isProgress = false;
      }, 3000);
    },
    onProgress(event, label, progress) {
      this.label = label;
      this.progress = progress;
    }
  }
};