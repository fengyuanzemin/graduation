<template>
  <div id="app">
    <router-view></router-view>
    <f-msg-with-loading></f-msg-with-loading>
  </div>
</template>

<script>
  import 'assets/css/reset.css';
  import 'assets/css/global.scss';
  import 'assets/fonts/iconfont.css';
  import MsgWithLoading from 'components/MsgWithLoading';

  export default {
    name: 'app',
    components: {
      'f-msg-with-loading': MsgWithLoading
    }
  };
</script>
