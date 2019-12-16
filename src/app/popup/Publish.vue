<template>
  <div class="modal fade" id="publish-modal" tabindex="-1" role="dialog" aria-labelledby="#publish-modal-label" aria-hidden="true" data-backdrop="static" data-keyboard="false">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title" id="publish-modal-label">发布网站</h4>
          <button type="button" class="close" data-dismiss="modal" aria-label="关闭" v-if="!isProgress || isSuccess">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <template>
            <p>将网站内容发布成静态网页，稍后您可以将其上传，更新网站。</p>
            <div class="text-xs-center" id="upload-progress-label" v-if="isProgress">当前进度：{{label}}</div>
            <progress class="progress" :value="progress" max="100" aria-describedby="#publish-progress-label" v-if="isProgress"></progress>
            <p>
              <button type="button" class="btn btn-lg btn-block" @click="start" :disabled="isProgress || isSuccess" :class="isSuccess ? 'btn-success' : 'btn-primary'">
                <template v-if="isAwait">
                  <i class="fa fa-play"></i> 开始发布
                </template>
                <template v-else-if="isProgress">
                  <i class="fa fa-spin fa-spinner"></i> 正在发布
                </template>
                <template v-else>
                  <template v-if="isSuccess">
                    <i class="fa fa-check"></i> 发布完成
                  </template>
                  <template v-else>
                    <i class="fa fa-times"></i> 发布失败
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
      $('#publish-modal').one('hidden.bs.modal', () => {
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
</script>