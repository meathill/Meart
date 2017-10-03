<template>
  <div id="app" :class="classes">
    <router-view></router-view>
  </div>
</template>

<script>
  const {remote, shell} = require('electron');
  const Publisher = require('./popup/Publish');
  const Uploader = require('./popup/Upload');
  require('./system/contextMenu');
  require('../electron/template/helpers');

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
    }
  }
</script>