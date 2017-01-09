const { ipcRenderer } = require('electron');
const MutationTypes = require('../store/mutation-types');
const AWAIT = 0;
const IN_PROGRESS = 1;
const OVER = 2;

module.exports = {
  created() {
    ipcRenderer.on('/publish/progress/', this.onProgress.bind(this));
    ipcRenderer.on('/publish/finish/', this.onFinish.bind(this));
    ipcRenderer.on('/publish/error/', this.onError.bind(this));
  },
  data() {
    return {
      status: AWAIT,
      isSuccess: false,
      label: '开始发布网站',
      progress: 0
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
      ipcRenderer.send('/publish/');
    },
    onError(event, msg) {
      this.status = OVER;
      this.isSuccess = false;
      this.label = msg;
    },
    onFinish(event, time) {
      this.label = '生成完毕';
      this.progress = 100;
      this.$store.commit(MutationTypes.SET_PUBLISH_TIME, {
        time: time
      });
      this.isSuccess = true;
      this.status = OVER;
      $('#publish-modal').on('hidden.bs.modal', () => {
        this.isSuccess = false;
        this.status = AWAIT;
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