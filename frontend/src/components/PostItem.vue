<template>
  <div class="card" v-if="item" @click.stop.prevent="detail(item)">
    <div class="card-header">
      <span class="card-name">{{item.user.name}}</span>
      <span class="card-time">{{item.createdAt | timeFormat('{m}-{d} {h}:{m}')}}</span>
    </div>
    <div class="card-content">{{item.content}}</div>
    <div class="card-footer">
      <div class="card-footer-container" @click.stop.prevent="repost(item)">
        <span class="iconfont icon-zhuanfa1"/><span v-if="item.reposts_count" class="card-footer-text">{{item.reposts_count}}</span><span
        class="card-footer-text" v-else>转发</span>
      </div>
      <div class="card-footer-container" @click.stop.prevent="comment(item)">
        <span class="iconfont icon-pinglun"/><span v-if="item.comments_count" class="card-footer-text">{{item.comments_count}}</span><span
        class="card-footer-text" v-else>评论</span>
      </div>
      <div class="card-footer-container" @click.stop.prevent="attitude(item)">
        <span class="iconfont icon-unie60e"/><span v-if="item.attitudes_count" class="card-footer-text">{{item.attitudes_count}}</span><span
        class="card-footer-text" v-else>点赞</span>
      </div>
    </div>
  </div>
</template>
<script>
import {dateFormat, getCookie} from 'src/utils';
import {attitude} from 'src/api';
export default {
  props: ['item'],
  methods: {
    detail(data) {
      if(/^\/status/.test(this.$route.path)) {
        return;
      }
      this.$router.push({name: 'status', params: { postId: data._id }});
    },
    repost(data) {
      this.$router.push({name: 'repost', params: { postId: data._id }});
    },
    comment(data) {
      if (data.comments_count) {
        this.$router.push({name: 'status', params: { postId: data._id }});
      } else {
        this.$router.push({name: 'comment', params: { postId: data._id }});
      }
    },
    attitude(data) {
      attitude(data._id, this.token).then((res) => {
        if (res.data.code === 200) {
          data.attitudes_count += 1;
        } else if (res.data.code === 5007) {
          data.attitudes_count -= 1;
        }
      }).catch((err) => {
        console.log(res)
      });
    }
  },
  computed: {
    token(){
      return getCookie('f-token');
    }
  },
  filters: {
    timeFormat(val, option) {
      return dateFormat(val, option);
    }
  }
};
</script>
<style lang="scss" scoped>
  .card {
    overflow: auto;
    box-sizing: border-box;
    background-color: #ffffff;
    border-bottom: 10px solid #f2f2f2;
    .card-header {
      margin: 10px 0;
      padding: 0 15px;
      .card-name {
        font-size: 17px;
        color: #333;
        margin-right: 5px;
      }
      .card-time {
        font-size: 14px;
        color: #666;
        font-weight: 300;
      }
    }
    .card-content {
      overflow: hidden;
      font-size: 15px;
      color: #333;
      margin: 0 15px 10px 15px;
      line-height: 24px;
    }
    .card-footer {
      border-top: 1px solid #dcdcdc;
      display: flex;
      text-align: center;
      .card-footer-container {
        flex: 1;
        padding: 10px;
        border-right: 1px solid #dcdcdc;
        color: #777;
        &:nth-last-child(1) {
          border-right: none;
        }
        .card-footer-text {
          font-size: 14px;
        }
        .iconfont {
          margin-right: 5px;
        }
      }
    }
  }
</style>

