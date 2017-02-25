<template>
  <div class="comment">
    <div class="comment-container" v-for="item in items">
      <div class="comment-header">
        <span class="comment-name">{{item.user.name}}</span><!--
        --><span class="comment-time">{{item.createdAt | timeFormat('{m}-{d} {h}:{m}')}} 评论</span>
      </div>
      <div class="comment-content">{{item.content}}</div>
    </div>
    <div v-if="items.length==0">
      <div class="comment-empty">暂无评论</div>
    </div>
  </div>
</template>
<script>
import {dateFormat} from 'src/utils';
export default {
  props: ['items'],
  filters: {
    timeFormat(val, option) {
      return dateFormat(val, option);
    }
  }
};

</script>
<style lang="scss" scoped>
  .comment-container {
    background-color: #ffffff;
    padding: 15px 0;
    margin: 0 15px;
    border-bottom: 1px solid #dcdcdc;
    .comment-header {
      margin: 0 0 10px 0;
      .comment-name {
        color: #333;
        margin-right: 10px;
        font-size: 17px;
      }
      .comment-time {
        color: #666;
        font-size: 12px;
        font-weight: 300;
      }
    }
    .comment-content {
      color: #333;
    }
  }

  .comment-empty {
    color: #999;
    font-size: 20px;
    text-align: center;
    margin-top: 100px;
  }
</style>

