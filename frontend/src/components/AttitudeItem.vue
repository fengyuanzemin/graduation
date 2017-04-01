<template>
  <div class="attitude">
    <div class="attitude-container" v-for="item in items">
      <span class="attitude-name">{{item.user.name}}</span>
      <span class="attitude-time">{{item.createdAt | timeFormat('{m}-{d} {h}:{m}')}} 点赞</span>
    </div>
    <div v-if="items.length===0">
      <div class="attitude-empty">暂无点赞</div>
    </div>
  </div>
</template>
<script>
  export default {
    props: ['items']
  };
</script>
<style lang="scss" scoped>
  .attitude {
    .attitude-container {
      border-bottom: 1px solid #dcdcdc;
      padding: 15px 0;
      margin: 0 15px;
      .attitude-name {
        color: #333;
        font-size: 17px;
      }
      .attitude-time {
        color: #666;
        font-size: 12px;
        font-weight: 300;
      }
    }
    .attitude-empty {
      color: #999;
      font-size: 20px;
      text-align: center;
      margin-top: 100px;
    }
  }
</style>

