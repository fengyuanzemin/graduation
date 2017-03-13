<template>
  <div class="container">
    <header>
      <span class="header-left iconfont icon-houtui"/>
      <span class="clickBoard clickBoard-left" @click="back"/>
      <div class="header-title">正文</div>
      <span class="header-right">回首页</span>
      <span class="clickBoard clickBoard-right clickBoard-right-big" @click="toIndex"/>
    </header>
    <div class="card" v-if="item">
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
        <div class="card-footer-container" @click.stop.prevent="checkout('repost')">
          <span class="card-footer-text">转发 {{item.reposts_count}}</span>
        </div>
        <div class="card-footer-container" @click.stop.prevent="checkout('comment')">
          <span class="card-footer-text">评论 {{item.comments_count}}</span>
        </div>
        <div class="card-footer-container" @click.stop.prevent="checkout('attitude')">
          <span class="card-footer-text">点赞 {{item.attitudes_count}}</span>
        </div>
      </div>
    </div>
    <component :is="currentView" :items="actionItem"/>
    <footer>
      <div class="footer-container" @click.stop.prevent="repost">
        <span class="iconfont icon-zhuanfa1"/><span class="footer-text">转发</span>
      </div>
      <div class="footer-container" @click.stop.prevent="comment">
        <span class="iconfont icon-pinglun"/><span class="footer-text">评论</span>
      </div>
      <div class="footer-container" @click.stop.prevent="attitude">
        <span class="iconfont icon-unie60e" :class="{active: attituded}"/><span class="footer-text">点赞</span>
      </div>
    </footer>
  </div>
</template>
<script>
import AttitudeItem from 'src/components/AttitudeItem';
import CommentItem from 'src/components/CommentItem';
import RepostItem from 'src/components/RepostItem';
import {getPostItem, attitude, getActionInfo, checkAttitude, clickIn} from 'src/api';
import {dateFormat, getCookie} from 'src/utils';
export default {
  created() {
    // 拉取主要信息
    getPostItem(this.$route.params.postId).then((res) => {
      if(res.data.code === 200) {
          this.item = res.data.detail;
      }
    }).catch((err) => {
      console.log(err);
    });
    // 拉取评论点赞
    getActionInfo(this.$route.params.postId, 'comment', this.token).then((res) => {
      if(res.data.code === 200) {
        this.actionItem = res.data.items;
      }
    }).catch((err) => {
        console.log(err);
    });
    // 如果用户已登录，还要查看是否点过赞
    if (this.token) {
      checkAttitude(this.$route.params.postId, this.token).then((res) => {
        if(res.data.code === 200) {
          this.attituded = res.data.check;
        }
      }).catch((err) => {
        console.log(err);
      });
    }
  },
  data() {
    return {
      item: null,
      attituded: false,
      currentView: 'f-comment-item',
      actionItem: [],
      token: getCookie('f-token')
    };
  },
  filters: {
    timeFormat(val, option) {
      return dateFormat(val, option);
    }
  },
  watch: {
    '$route'(route) {
      // 拉取主要信息
      getPostItem(this.$route.params.postId).then((res) => {
        if(res.data.code === 200) {
          this.item = res.data.detail;
        }
      }).catch((err) => {
        console.log(err);
      });
      // 拉取评论点赞
      getActionInfo(this.$route.params.postId, 'comment', this.token).then((res) => {
        if(res.data.code === 200) {
          this.actionItem = res.data.items;
        }
      }).catch((err) => {
          console.log(err);
      });
      // 如果用户已登录，还要查看是否点过赞
      if (this.token) {
        checkAttitude(this.$route.params.postId, this.token).then((res) => {
          if(res.data.code === 200) {
            this.attituded = res.data.check;
          }
        }).catch((err) => {
          console.log(err);
        });
      }
    }
  },
  methods: {
    back() {
      this.$router.back();
    },
    toIndex() {
      this.$router.push('/');
    },
    repost() {
      this.$router.push({name: 'repost', params:{ postId: this.$route.params.postId }});
    },
    comment() {
      this.$router.push({name: 'comment', params: { postId: this.$route.params.postId }});
    },
    attitude() {
      if(!this.token) {
        this.$router.push('/login');
        return;
      }
      attitude(this.$route.params.postId, this.token).then((res) => {
        if (res.data.code === 200) {
          this.attituded = true;
          this.item.attitudes_count += 1;
        } else if (res.data.code === 5007){
          this.attituded = false;
          this.item.attitudes_count -= 1;
        }
      }).catch((err) => {
        console.log(res)
      });
    },
    toUser(data) {
      this.$router.push({name: 'user', params: {userId: data.user._id}});
    },
    // 切换组件
    checkout(component) {
      this.currentView = `f-${component}-item`;
      getActionInfo(this.$route.params.postId, component, this.token).then((res) => {
        if(res.data.code === 200) {
          this.actionItem = res.data.items;
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    detail(data) {
      clickIn(data._id, this.token);
      this.$router.push({name: 'status', params: { postId: data._id }});
    },
  },
  components: {
    'f-attitude-item': AttitudeItem,
    'f-comment-item': CommentItem,
    'f-repost-item': RepostItem
  }
};

</script>
<style lang="scss" scoped>
  .container {
    padding-top: 45px;
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
          color: #777;
          .card-footer-text {
            font-size: 14px;
          }
          .iconfont {
            margin-right: 5px;
          }
        }
      }
    }
    footer {
      border-top: 1px solid #dcdcdc;
      display: flex;
      text-align: center;
      position: fixed;
      bottom: 0;
      width: 100%;
      .footer-container {
        flex: 1;
        padding: 10px;
        border-right: 1px solid #dcdcdc;
        color: #777;
        &:nth-last-child(1) {
          border-right: none;
        }
        .footer-text {
          font-size: 14px;
        }
        .iconfont {
          margin-right: 5px;
          &.icon-unie60e.active {
            color: #e22c2c;
          }
        }
      }
    }
  }
</style>

