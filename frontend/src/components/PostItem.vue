<template>
  <div class="card" v-if="item.action" @click.stop.prevent="detail(item.post)">
    <!--如果是用户点赞的，别人的微博-->
      <div class="card-attitude">他{{item.createdAt | timeFormat('{m}-{d}')}}赞过的微博</div>
      <div class="card-header">
        <span class="card-name" @click.stop.prevent="toUser(item.post)">{{item.post.user.name}}</span>
        <span class="card-time">{{item.post.createdAt | timeFormat('{m}-{d} {h}:{m}')}}</span>
      </div>
      <div class="card-content">{{item.post.content}}</div>
      <div class="card-retweeted" v-if="item.post.retweeted_post" @click.stop.prevent="detail(item.post.retweeted_post)">
        <div class="card-retweeted-header">
          <span class="card-retweeted-name" @click.stop.prevent="toUser(item.post.retweeted_post)">@{{item.post.retweeted_post.user.name}}</span>
          <span class="card-retweeted-time">{{item.post.retweeted_post.createdAt | timeFormat('{m}-{d} {h}:{m}')}}</span>
        </div>
        <div class="card-retweeted-content">{{item.post.retweeted_post.content}}</div>
      </div>
      <div class="card-footer">
        <div class="card-footer-container" @click.stop.prevent="repost(item.post)">
          <span class="iconfont icon-zhuanfa1"/><span v-if="item.post.reposts_count" class="card-footer-text">{{item.post.reposts_count}}</span><span
          class="card-footer-text" v-else>转发</span>
        </div>
        <div class="card-footer-container" @click.stop.prevent="comment(item.post)">
          <span class="iconfont icon-pinglun"/><span v-if="item.post.comments_count" class="card-footer-text">{{item.post.comments_count}}</span><span
          class="card-footer-text" v-else>评论</span>
        </div>
        <div class="card-footer-container" @click.stop.prevent="attitude(item.post)">
          <span class="iconfont icon-unie60e"/><span v-if="item.post.attitudes_count" class="card-footer-text">{{item.post.attitudes_count}}</span><span
          class="card-footer-text" v-else>点赞</span>
        </div>
      </div>
    </div>
  <div class="card" v-else-if="item.attitudes_count >= 0" @click.stop.prevent="detail(item)">
    <!--用户自己的微博-->
      <div class="card-header">
        <span class="card-name" @click.stop.prevent="toUser(item)">{{item.user.name}}</span>
        <span class="card-time">{{item.createdAt | timeFormat('{m}-{d} {h}:{m}')}}</span>
      </div>
      <div class="card-content">{{item.content}}</div>
      <!--若不是原创-->
      <div class="card-retweeted" v-if="item.retweeted_post" @click.stop.prevent="detail(item.retweeted_post)">
        <div class="card-retweeted-header">
          <span class="card-retweeted-name" @click.stop.prevent="toUser(item.retweeted_post)">@{{item.retweeted_post.user.name}}</span>
          <span class="card-retweeted-time">{{item.retweeted_post.createdAt | timeFormat('{m}-{d} {h}:{m}')}}</span>
        </div>
        <div class="card-retweeted-content">{{item.retweeted_post.content}}</div>
      </div>
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
import {attitude, clickIn} from 'src/api';
export default {
  props: ['item'],
  data() {
    return {
      token: getCookie('f-token')
    }
  },
  methods: {
    detail(data) {
      if(/^\/un-login/.test(this.$route.path)) {
        this.$router.push('/login')
        return;
      }
      clickIn(data._id, this.token);
      this.$router.push({name: 'status', params: { postId: data._id }});
    },
    repost(data) {
      if(/^\/un-login/.test(this.$route.path)) {
        this.$router.push('/login')
        return;
      }
      this.$router.push({name: 'repost', params: { postId: data._id }});
    },
    comment(data) {
      if(/^\/un-login/.test(this.$route.path)) {
        this.$router.push('/login')
        return;
      }
      if (data.comments_count) {
        this.$router.push({name: 'status', params: { postId: data._id }});
      } else {
        this.$router.push({name: 'comment', params: { postId: data._id }});
      }
    },
    attitude(data) {
      if(/^\/un-login/.test(this.$route.path)) {
        this.$router.push('/login')
        return;
      }
      attitude(data._id, this.token).then((res) => {
        if (res.data.code === 200) {
          data.attitudes_count += 1;
        } else if (res.data.code === 5007) {
          data.attitudes_count -= 1;
        }
      }).catch((err) => {
        console.log(res)
      });
    },
    toUser(data) {
      // 在user页面不用跳转
      if(/^\/user/.test(this.$route.path) && (data.user._id === this.$route.params.userId)) {
        return;
      }
      // 在未登录页面，要去登录
      if(/^\/un-login/.test(this.$route.path)) {
        this.$router.push('/login')
        return;
      }
      this.$router.push({name: 'user', params: {userId: data.user._id}});
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
    .card-attitude {
      padding:8px 15px;
      color: #1478f0;
      font-weight: 300;
      font-size: 13px;
      border-bottom: 1px solid #dcdcdc;
    }
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
    .card-retweeted {
      padding: 8px 15px;
      background-color: #f2f2f2;
      .card-retweeted-header {
        margin-bottom: 10px;
        .card-retweeted-name {
          font-size: 17px;
          color: #1478f0;
          margin-right: 5px;
        }
        .card-retweeted-time {
          font-size: 14px;
          color: #666;
          font-weight: 300;
        }
      }
      .card-retweeted-content {
        overflow: hidden;
        font-size: 15px;
        color: #333;
        line-height: 24px;
      }
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

