<template>
  <div id="home">
    <aside>
      <router-link to="/articles" class="btn btn-secondary" title="相册">
        作品集
      </router-link>
      <router-link to="/preview" class="btn btn-secondary" title="查看网站">
        查看网站
      </router-link>
      <router-link to="/config" class="btn btn-secondary" title="设置">
        设置
      </router-link>
      <router-link to="/help" class="btn btn-outline-secondary btn-block secondary" title="帮助"><i class="fa fa-question-circle-o fa-2x"></i></router-link>
    </aside>
    <router-view class="container-fluid">

    </router-view>
  </div>
</template>

<script>
  export default {
    name: 'home',
  };
</script>
