<template>
<div class="modal fade" id="upload-modal" tabindex="-1" role="dialog" aria-labelledby="#upload-modal-label" aria-hidden="true" data-backdrop="static" data-keyboard="false">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">上传到网站</h4>
        <button type="button" class="close" data-dismiss="modal" aria-label="关闭">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <template>
          <p>将已生成的网页上传到服务器。这个操作会需要很长时间，请不要打断程序执行，以免发生错误。</p>
          <p><small class="text-muted">注：七牛 CDN 刷新时间为 10 分钟，即上传 10 分钟后，网站内容才会变化。</small></p>
          <p v-if="result" v-html="result" class="alert" :class="isSuccess ? 'alert-success' : 'alert-danger'"></p>
          <div class="text-xs-center" id="publish-progress-label" v-if="isProgress">当前进度：{{label}}</div>
          <progress class="progress" :value="progress" max="100" aria-describedby="#publish-progress-label" v-if="isProgress"></progress>
          <p class="well" v-if="isProgress">
            <template v-for="message in messages">
              {{message}}<br>
            </template>
          </p>
          <p>
            <button type="button" class="btn btn-lg btn-block" @click="start" :disabled="isProgress || isSuccess" :class="isSuccess ? 'btn-success' : 'btn-primary'">
              <template v-if="isAwait">
                <i class="fa fa-cloud-upload"></i> 开始上传
              </template>
              <template v-else-if="isProgress">
                <i class="fa fa-spinner fa-spin"></i> 上传中
              </template>
              <template v-else>
                <template v-if="isSuccess">
                  <i class="fa fa-check"></i> 上传完成
                </template>
                <template v-else>
                  <i class="fa fa-times"></i> 上传失败
                </template>
              </template>
            </button>
          </p>
        </template>
      </div>
    </div>
  </div>
</div>
</template>

<script>
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
</script>