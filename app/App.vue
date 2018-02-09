<template lang="pug">
  #app(:class="classes", @click="onClick")
    router-view
</template>

<script>
  import {remote, shell} from 'electron';
  import './system/contextMenu';
  import '../electron/template/helpers';
  import Welcome from './page/Welcome.vue';

  export default {
    components: {
      Welcome,
    },

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
        this.$router.push({
          name: "welcome",
        });
        this.$once('site-init', () => {
          console.log('ok');
          this.isNew = false;
        });
      } else {
        this.isNew = false;
        this.$router.push({
          name: 'article.list'
        });
      }
    }
  }
</script>