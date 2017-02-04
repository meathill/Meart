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
      result: '',
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
    /**
     * 生成上传结束的提示语句
     *
     * @param {Object} refresh
     *    @param {Number} refresh.code
     *    @param {Number} refresh.urlSurplusDay
     *    @param {Number} refresh.urlQuotaDay
     *    @param {String} refresh.error
     *    @param {Array|null} refresh.invalidUrls
     * @return {string}
     */
    generateSuccessMessage(refresh) {
      let message = '生成完毕。<br>';
      if (refresh.code === 200) {
        message += 'CDN 缓存已更新，请稍后查看。';
        message += `您今天还能刷新 ${refresh.urlSurplusDay}/${refresh.urlQuotaDay} 个文件`;
      } else {
        message += `<br>CDN 缓存未更新，原因：${refresh.error}`;
        message += '<br>您可以手动更新';
        if (refresh.invalidUrls) {
          message += '未更新文件：' + refresh.invalidUrls.join('，');
        }
      }
      return message;
    },
    start() {
      this.status = IN_PROGRESS;
      ipcRenderer.send('/upload/');
    },
    onFinish(event, refresh) {
      this.result = this.generateSuccessMessage(refresh);
      this.progress = 100;
      this.isSuccess = true;
      this.status = OVER;
      $('#upload-modal').on('hidden.bs.modal', () => {
        this.status = AWAIT;
        this.isSuccess = false;
        this.result = '';
      });
      setTimeout( () => {
        $('#upload-modal').modal('hide');
      }, 5000);
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