<template>
  <div class="not-found">
    <p class="not-found-text">404 Not Found</p>
    <span class="not-found-button" @touchend.stop.prevent="reload">刷新</span>
  </div>
</template>
<script>
export default {
  methods:{
    reload() {
      window.location.reload();
    }
  }
};
</script>
<style lang="scss" scoped>
  .not-found {
    background-color: #ffffff;
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    .clickBoard {
      top: 0;
      left: 0;
      width: 60px;
      height: 60px;
    }
    .not-found-back {
      color: #666666;
      position: absolute;
      top: 15px;
      left: 15px;
    }
    .not-found-img {
      width: 300px;
      position: relative;
      top: -24px;
    }
    .not-found-text {
      font-size: 12px;
      color: #999999;
      position: relative;
      top: -12.5px;
    }
    .not-found-button {
      padding: 12px 59px;
      border: 1px solid #dcdcdc;
      border-radius: 50px;
      font-size: 16px;
      color: #666666;
      line-height: 16px;
      position: relative;
      top: 15px;
    }
  }
</style>
