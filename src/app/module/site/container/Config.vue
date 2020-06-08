<template>
  <div id="config">
    <header class="row">
      <h2>设置</h2>
    </header>
    <ul class="nav nav-tabs row" role="tablist">
      <li class="nav-item">
        <a href="#site-config" class="nav-link active" data-toggle="tab" role="tab">
          网站信息
        </a>
      </li>
      <li class="nav-item">
        <a href="#site-server" class="nav-link" data-toggle="tab" role="tab">
          服务器信息
        </a>
      </li>
    </ul>
    <div class="row">
      <div class="tab-content">
        <div id="site-config" class="tab-pane active"role="tabpanel">
          <div class="settings">
            <form>
              <div class="form-group row">
                <label class="col-sm-2 col-form-label" for="site-title">网点名称</label>
                <div class="col-sm-10">
                  <input class="form-control" id="site-title" v-model="config.siteTitle">
                </div>
              </div>
              <div class="form-group row">
                <label class="col-sm-2 col-form-label" for="site-desc">网站简介</label>
                <div class="col-sm-10">
                  <textarea class="form-control" id="site-desc" v-model="config.siteDesc" rows="2"></textarea>
                </div>
              </div>
              <div class="form-group row">
                <label class="col-sm-2 col-form-label" for="site-icon">网站图标</label>
                <div class="col-sm-4">
                  <img v-if="config.siteIcon" :src="config.siteIcon" class="img-thumbnail site-icon">
                  <label class="btn btn-secondary">
                    <input type="file" @change="onSelectFile" class="hide">
                    重新上传
                  </label>
                </div>
              </div>
              <div class="form-group row">
                <label class="col-sm-2 col-form-label">网站模板</label>
                <div class="col-sm-10">
                  <div class="row theme-list">
                    <div class="col-sm-3" v-for="theme in themes">
                      <input type="radio" name="site-theme" class="hide" v-model="config.siteTheme" :value="theme.dir" :id="'theme-' + theme.dir">
                      <label class="card" :for="'theme-' + theme.dir">
                        <img class="card-img img-fluid" :src="'theme/' + theme.dir + '/' + theme.thumbnail" alt="默认模板" v-if="theme.thumbnail">
                        <div class="card-img-overlay">
                          <h4 class="card-title">{{theme.name}}</h4>
                          <p class="card-text">{{theme.description}}</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div id="site-server" class="tab-pane" role="tabpanel">
          <form @submit.prevent="saveServerSettings" >
            <div class="form-group row">
              <label class="col-sm-2 col-form-label" for="server-name">服务器名称</label>
              <div class="col-sm-10">
                <select class="form-control" id="server-name" v-model="server.name">
                  <option value="qiniu">七牛</option>
                </select>
              </div>
            </div>
            <div class="form-group row">
              <label class="col-sm-2 col-form-label" for="ACCESS_KEY">Access Key</label>
              <div class="col-sm-10">
                <input type="password" class="form-control" id="access_key" v-model="server.ACCESS_KEY">
              </div>
            </div>
            <div class="form-group row">
              <label class="col-sm-2 col-form-label" for="SECRET_KEY">Secret Key</label>
              <div class="col-sm-10">
                <input type="password" class="form-control" id="secret_key" v-model="server.SECRET_KEY">
              </div>
            </div>
            <div class="form-group row">
              <label class="col-sm-2 col-form-label" for="bucket">存放空间</label>
              <div class="col-sm-10">
                <input class="form-control" id="bucket" v-model="server.bucket">
              </div>
            </div>
            <div class="form-group row">
              <label class="col-sm-2 col-form-label" for="host">域名</label>
              <div class="col-sm-10">
                <input class="form-control" id="host" v-model="server.host">
                <p class="form-text text-muted">用于刷新 CDN 缓存，请包含 <code>http://</code> 或者 <code>https://</code>，以 <code>/</code> 结束。</p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = require('electron');
const _ = require('lodash');
const MutationTypes = require('@/store/mutation-types');
const ActionTypes = require('@/store/action-types');

export default {
  name: 'config',
  data() {
    return {
      config: _.pick(this.$store.state.site, 'siteTitle', 'siteDesc', 'siteTheme', 'siteIcon'),
      server: _.extend({}, this.$store.state.server),
      themes: null
    };
  },
  created() {
    this.findLocalThemes();
  },
  methods: {
    findLocalThemes() {
      ipcRenderer.once('list-theme', (event, themes) => {
        this.themes = themes;
      });

      ipcRenderer.send('/theme/');
    },
    onSelectFile(event) {
      this.config.siteIcon = event.target.files[0].path;
    }
  },
  beforeRouteLeave(to, from, next) {
    this.$store.commit(MutationTypes.EDIT_CONFIG, this.config);
    this.$store.commit(MutationTypes.EDIT_SERVER, this.server);
    this.$store.dispatch(ActionTypes.SAVE_SERVER);
    this.$store.dispatch(ActionTypes.SAVE);
    next();
  }
};
</script>
