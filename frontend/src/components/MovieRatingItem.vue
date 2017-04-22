<template>
  <div class="rating">
    <div class="rating-container" v-for="item in items">
      <div class="rating-header">
        <span class="rating-name">{{item.user.name}}</span><!--
        --><span class="rating-time">{{item.createdAt | timeFormat('{m}-{d} {h}:{m}')}} 评价</span>
      </div>
      <div class="rating-content" v-if="item.content">{{item.content}}</div>
      <div class="rating-content rating-content-not-exist" v-else>该用户没有评价</div>
      <div class="rating-point-container">
        <f-star :rating="item.rating"></f-star>
        <span class="rating-point">{{item.rating}}分</span>
      </div>
    </div>
    <div v-if="items.length === 0">
      <div class="rating-empty">暂无影评</div>
    </div>
  </div>
</template>
<script>
  import Star from 'src/components/Star';

  export default {
    props: {
      items: {
        type: Array,
        default: null
      }
    },
    components: {
      'f-star': Star
    }

  };
</script>
<style lang="scss" scoped>
  .rating-container {
    background-color: #ffffff;
    padding: 15px 0;
    margin: 0 15px;
    border-bottom: 1px solid #dcdcdc;
    position: relative;
    .rating-header {
      margin: 0 0 10px 0;
      .rating-name {
        color: #333;
        margin-right: 10px;
        font-size: 17px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        width: 102px;
        display: inline-block;
      }
      .rating-time {
        color: #666;
        font-size: 12px;
        font-weight: 300;
      }
    }
    .rating-content {
      color: #333;
      margin-right: 75px;
      &.rating-content-not-exist {
        color: #999;
      }
    }
    .rating-point-container {
      position: absolute;
      right: 9px;
      top: 17px;
      text-align: center;
      .star {
        margin-bottom: 8px;
      }
      .rating-point {
        font-size: 14px;
        color: #333;
      }
    }

  }

  .rating-empty {
    color: #999;
    font-size: 16px;
    text-align: center;
    margin-top: 30px;
  }
</style>

