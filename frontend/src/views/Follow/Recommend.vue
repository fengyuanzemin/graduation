<template>
  <div class="container">
    <h2>敬请期待</h2>
  </div>
</template>
<script>
import {getCookie} from 'src/utils';

export default {
  data() {
    return {
       token: getCookie('f-token')
    };
  }
};
</script>
<style lang="scss" scoped>
  .container {
    h2 {
      text-align: center;
    }
  }
</style>

