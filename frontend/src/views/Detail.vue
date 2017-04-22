<template>
  <div class="container">
    <header>
      <span class="header-left iconfont icon-houtui"></span>
      <span class="clickBoard clickBoard-left" @click="back"></span>
      <div class="header-title">正文</div>
      <span class="header-right">回首页</span>
      <span class="clickBoard clickBoard-right clickBoard-right-big" @click="toIndex"></span>
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
          <span class="card-retweeted-name"
                @click.stop.prevent="toUser(item.retweeted_post)">@{{item.retweeted_post.user.name}}</span>
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
    <component :is="currentView" :items="actionItem"></component>
    <div class="loading" v-show="loading">
      <span class="loading-text">{{loadingText}}</span>
      <f-fade-spinner size="middle"></f-fade-spinner>
    </div>
    <footer>
      <div class="footer-container" @click.stop.prevent="repost">
        <span class="iconfont icon-zhuanfa1"></span><span class="footer-text">转发</span>
      </div>
      <div class="footer-container" @click.stop.prevent="comment">
        <span class="iconfont icon-pinglun"></span><span class="footer-text">评论</span>
      </div>
      <div class="footer-container" @click.stop.prevent="attitude">
        <span class="iconfont icon-unie60e" :class="{active: item && item.attituded}"></span><span
        class="footer-text">点赞</span>
      </div>
    </footer>
  </div>
</template>
<script>
  import AttitudeItem from 'src/components/AttitudeItem';
  import CommentItem from 'src/components/CommentItem';
  import RepostItem from 'src/components/RepostItem';
  import FadeSpinner from 'components/FadeSpinner';
  import {getPostItem, attitude, getActionInfo, clickIn} from 'src/api';

  export default {
    async created() {
      try {
        const res = await getPostItem(this.$route.params.postId, this.$store.state.token);
        if (res.data.code === 200) {
          this.item = res.data.detail;
        } else {
          this.$store.dispatch('show', {
            msg: res.data.message
          });
          setTimeout(() => {
            this.$store.dispatch('close');
            if (res.data.code === 5002) {
              this.$router.push('/login');
            }
          }, 2000);
        }
      } catch (err) {
        console.log(err);
        this.$store.dispatch('show', {
          msg: '服务器错误啦，请稍后再试'
        });
        setTimeout(() => {
          this.$store.dispatch('close');
        }, 2000);
      }
      try {
        // 拉取评论点赞
        const res = await getActionInfo(this.$route.params.postId, this.currComponent, this.$store.state.token);
        if (res.data.code === 200) {
          this.actionItem = res.data.items;
        } else {
          this.$store.dispatch('show', {
            msg: res.data.message
          });
          setTimeout(() => {
            this.$store.dispatch('close');
            if (res.data.code === 5002) {
              this.$router.push('/login');
            }
          }, 2000);
        }
      } catch (err) {
        console.log(err);
        this.$store.dispatch('show', {
          msg: '服务器错误啦，请稍后再试'
        });
        setTimeout(() => {
          this.$store.dispatch('close');
        }, 2000);
      }
    },
    mounted() {
      document.addEventListener('scroll', this.judgeBottom);
    },
    beforeDestroy() {
      document.removeEventListener('scroll', this.judgeBottom);
    },
    data() {
      return {
        item: null,
        currentView: 'f-comment-item',
        actionItem: [],
        currComponent: 'comment',
        page: 0,
        loading: false,
        loadingText: '加载中',
        disabled: false
      };
    },
    watch: {
      async '$route'() {
        // 拉取主要信息
        try {
          const res = await getPostItem(this.$route.params.postId, this.$store.state.token);
          if (res.data.code === 200) {
            this.item = res.data.detail;
          } else {
            this.$store.dispatch('show', {
              msg: res.data.message
            });
            setTimeout(() => {
              this.$store.dispatch('close');
              if (res.data.code === 5002) {
                this.$router.push('/login');
              }
            }, 2000);
          }
        } catch (err) {
          console.log(err);
          this.$store.dispatch('show', {
            msg: '服务器错误啦，请稍后再试'
          });
          setTimeout(() => {
            this.$store.dispatch('close');
          }, 2000);
        }
        try {
          // 拉取评论点赞
          const res = await getActionInfo(this.$route.params.postId, 'comment', this.$store.state.token);
          if (res.data.code === 200) {
            this.actionItem = res.data.items;
          } else {
            this.$store.dispatch('show', {
              msg: res.data.message
            });
            setTimeout(() => {
              this.$store.dispatch('close');
              if (res.data.code === 5002) {
                this.$router.push('/login');
              }
            }, 2000);
          }
        } catch (err) {
          console.log(err);
          this.$store.dispatch('show', {
            msg: '服务器错误啦，请稍后再试'
          });
          setTimeout(() => {
            this.$store.dispatch('close');
          }, 2000);
        }
      }
    },
    methods: {
      judgeBottom() {
        // 滚动高度
        const sHeight = document.documentElement.scrollTop || document.body.scrollTop;
        // window
        const wHeight = document.documentElement.clientHeight;
        // 整个文档高度
        const dHeight = document.documentElement.offsetHeight;
        if (sHeight + wHeight === dHeight) {
          this.loadMore();
        }
      },
      async loadMore() {
        if (this.disabled) {
          return;
        }
        if (this.loading) {
          return;
        }
        this.loadingText = '加载中';
        this.loading = true;

        try {
          const res = await getActionInfo(this.$route.params.postId, this.currComponent,
            this.$store.state.token, this.page + 1);
          if (res.data.code === 200) {
            if (res.data.items.length !== 0) {
              this.actionItem = this.actionItem.concat(res.data.items);
              this.page += 1;
              this.loading = false;
            } else {
              this.loadingText = '没数据了喔';
              this.disabled = true;
              setTimeout(() => {
                this.loading = false;
              }, 2000);
            }
          } else {
            this.loading = false;
            this.$store.dispatch('show', {
              msg: res.data.message
            });
            setTimeout(() => {
              this.$store.dispatch('close');
              if (res.data.code === 5002) {
                this.$router.push('/login');
              }
            }, 2000);
          }
        } catch (err) {
          console.log(err);
          this.loading = false;
          this.$store.dispatch('show', {
            msg: '服务器错误啦，请稍后再试'
          });
          setTimeout(() => {
            this.$store.dispatch('close');
          }, 2000);
        }
      },
      back() {
        this.$router.back();
      },
      toIndex() {
        this.$router.push('/');
      },
      repost() {
        this.$router.push({name: 'repost', params: {postId: this.$route.params.postId}});
      },
      comment() {
        this.$router.push({name: 'comment', params: {postId: this.$route.params.postId}});
      },
      async attitude() {
        try {
          const res = await attitude(this.$route.params.postId, this.$store.state.token);
          if (res.data.code === 200) {
            this.item.attituded = true;
            this.item.attitudes_count += 1;
          } else if (res.data.code === 5007) {
            this.item.attituded = false;
            this.item.attitudes_count -= 1;
          } else {
            this.$store.dispatch('show', {
              msg: res.data.message
            });
            setTimeout(() => {
              this.$store.dispatch('close');
              if (res.data.code === 5002) {
                this.$route.push('/login');
              }
            }, 2000);
          }
        } catch (err) {
          console.log(err);
          this.$store.dispatch('show', {
            msg: '服务器错误啦，请稍后再试'
          });
          setTimeout(() => {
            this.$store.dispatch('close');
          }, 2000);
        }
      },
      toUser(data) {
        this.$router.push({name: 'user', params: {userId: data.user._id}});
      },
      // 切换组件
      async checkout(component) {
        this.currentView = `f-${component}-item`;
        this.currComponent = component;
        this.disabled = false;
        this.page = 0;
        try {
          const res = await getActionInfo(this.$route.params.postId, component, this.$store.state.token);
          if (res.data.code === 200) {
            this.actionItem = res.data.items;
          } else {
            this.$store.dispatch('show', {
              msg: res.data.message
            });
            setTimeout(() => {
              this.$store.dispatch('close');
              if (res.data.code === 5002) {
                this.$route.push('/login');
              }
            }, 2000);
          }
        } catch (err) {
          console.log(err);
          this.$store.dispatch('show', {
            msg: '服务器错误啦，请稍后再试'
          });
          setTimeout(() => {
            this.$store.dispatch('close');
          }, 2000);
        }
      },
      detail(data) {
        clickIn(data._id, this.$store.state.token);
        this.$router.push({name: 'status', params: {postId: data._id}});
      },
    },
    components: {
      'f-attitude-item': AttitudeItem,
      'f-comment-item': CommentItem,
      'f-repost-item': RepostItem,
      'f-fade-spinner': FadeSpinner
    }
  };
</script>
<style lang="scss" scoped>
  .container {
    padding-top: 45px;
    padding-bottom: 37px;
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
    .loading {
      background-color: #f2f2f2;
      padding: 10px 0 20px 0;
      text-align: center;
      .loading-text {
        color: #666;
        font-size: 14px;
        position: relative;
        top: -5px;
        right: 10px;
      }
    }
    footer {
      border-top: 1px solid #dcdcdc;
      display: flex;
      text-align: center;
      position: fixed;
      bottom: 0;
      width: 100%;
      background-color: #fff;
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

