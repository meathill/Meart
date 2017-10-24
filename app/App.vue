<template>
  <div id="app" :class="classes" @click="onClick">
    <router-view></router-view>
  </div>
</template>

<script>
  const {remote, shell} = require('electron');
  const Publisher = require('./popup/Publish');
  const Uploader = require('./popup/Upload');
  import './system/contextMenu';
  import '../electron/template/helpers';

  export default {
    computed: {
      classes() {
        return this.isNew ? 'welcome' : '';
      },
    },

    data() {
      return {
        isNew: true,
      };
    },

    methods: {
      onClick(event) {
        if (event.target.tagName.toLowerCase() !== 'a') {
          return;
        }
        let href = event.target.href;
        if (/^https?:\/\//.test(href)) {
          shell.openExternal(href);
          event.preventDefault();
        }
      },
    },

    mounted() {
      if (remote.getGlobal('isNew')) {
        router.push({
          name: "welcome",
        });
        this.$once('site-init', () => {
          console.log('ok');
          this.isNew = false;
        });
      } else {
        this.isNew = false;
        router.push({
          name: 'articleList'
        });
      }
    }
  }
</script>