<template>
  <div class="repost">
    <div class="repost-container" v-for="item in items">
      <div class="repost-header">
        <span class="repost-name">{{item.user.name}}</span>
        <span class="repost-time">{{item.createdAt | timeFormat('{m}-{d} {h}:{m}')}} 转发</span>
      </div>
      <div class="repost-content">{{item.content}}</div>
    </div>
    <div v-if="items.length===0">
      <div class="repost-empty">暂无转发</div>
    </div>
  </div>
</template>
<script>
  export default {
    props: ['items']
  };
</script>
<style lang="scss" scoped>
  .repost {
    .repost-container {
      background-color: #ffffff;
      padding: 15px 0;
      margin: 0 15px;
      border-bottom: 1px solid #dcdcdc;
      .repost-header {
        margin: 0 0 10px 0;
        .repost-name {
          color: #333;
          margin-right: 10px;
          font-size: 17px;
        }
        .repost-time {
          color: #666;
          font-size: 12px;
          font-weight: 300;
        }
      }
      .repost-content {
        color: #333;
      }
    }
    .repost-empty {
      color: #999;
      font-size: 20px;
      text-align: center;
      margin-top: 100px;
    }
  }
</style>

