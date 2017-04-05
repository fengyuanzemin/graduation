<template>
  <div class="container">
    <header>
      <span class="iconfont icon-houtui header-left"></span>
      <span class="clickBoard clickBoard-left" @click="back"></span>
      <div class="header-title">个人中心</div>
      <span class="header-right">回首页</span>
      <span class="clickBoard clickBoard-right" @click="toIndex"></span>
    </header>
    <div class="user-header">
      <div class="name">{{userInfo.name}}</div>
      <div class="brief" v-if="userInfo.brief">简介：{{userInfo.brief}}</div>
      <div class="brief" v-else>暂无简介</div>
      <div class="follow-btn" v-if="userInfo.follow === 'none'" @click="followIt(userInfo)"><span
        class="iconfont icon-jia"></span>关注
      </div>
      <div class="follow-btn" v-else-if="userInfo.follow === 'following'" @click="followIt(userInfo)"><span
        class="iconfont icon-chenggong"></span>已关注
      </div>
      <div class="follow-btn" v-else-if="userInfo.follow === 'eachOther'" @click="followIt(userInfo)"><span
        class="iconfont icon-huxiangguanzhu"></span>相互关注
      </div>
      <div class="info">
        <div class="info-container">
          <div class="info-number">{{userInfo.posts_count}}</div>
          <div class="info-text">微博</div>
        </div>
        <div class="info-container" @click="toFollowing">
          <div class="info-number">{{userInfo.following_count}}</div>
          <div class="info-text">关注</div>
        </div>
        <div class="info-container" @click="toFollower">
          <div class="info-number">{{userInfo.followers_count}}</div>
          <div class="info-text">粉丝</div>
        </div>
      </div>
    </div>
    <div class="user-recommend" v-if="userRecommend && userRecommend.length > 0">
      <div class="user-recommend-title">可能感兴趣的人</div>
      <div class="user-recommend-container" v-for="item in userRecommend" @click.prevent.stop="toUser(item)">
        <span class="user-recommend-name">{{item.name}}</span><!--
      --><span class="user-recommend-brief" v-if="item.brief">{{item.brief}}</span><!--
      --><span class="user-recommend-brief" v-else>暂无简介</span><!--
      --><span class="iconfont user-recommend-icon icon-guanzhu" v-if="item.follow === 'none'"
               @click.prevent.stop="followIt(item)"></span><!--
      --><span class="iconfont user-recommend-icon icon-icon-yiguanzhu" v-else-if="item.follow === 'following'"
               @click.prevent.stop="followIt(item)"></span><!--
      --><span class="iconfont user-recommend-icon icon-huxiangguanzhu" v-else-if="item.follow === 'eachOther'"
               @click.prevent.stop="followIt(item)"></span>
      </div>
    </div>
    <f-post-item v-for="item in items" :item="item"></f-post-item>
    <p v-if="items.length === 0" class="follow-empty">暂无数据</p>
    <div class="loading" v-show="loading">
      <span class="loading-text">{{loadingText}}</span>
      <f-fade-spinner size="middle"></f-fade-spinner>
    </div>
  </div>
</template>
<script>
import PostItem from 'src/components/PostItem';
import FadeSpinner from 'components/FadeSpinner';
import {getUserPostList, follow} from 'src/api';

export default {
  created() {
    getUserPostList(this.$route.params.userId, this.token).then((res) => {
      if(res.data.code === 200) {
        this.items = res.data.items;
        this.userInfo = res.data.userInfo;
        this.userRecommend = res.data.userRecommend;
      } else {
        this.$store.dispatch('show', {
          msg: res.data.message
  	    });
  	    setTimeout(() => {
          this.$store.dispatch('close');
  	    }, 2000);
      }
    }).catch((err) => {
      console.log(err);
      this.$store.dispatch('show', {
        msg: '服务器错误啦，请稍后再试'
      });
      setTimeout(() => {
        this.$store.dispatch('close');
      }, 2000);
    });
  },
  mounted() {
    document.addEventListener('scroll', this.judgeBottom);
  },
  beforeDestroy() {
    document.removeEventListener('scroll', this.judgeBottom);
  },
  data() {
    return {
      userInfo: {
        name: '',
        posts_count: 0,
        following_count: 0,
        followers_count: 0,
        brief: '',
        follow: 'none'
      },
      userRecommend: [],
      items: [],
      token: localStorage.getItem('f-token'),
      page: 0,
      loading: false,
      loadingText: '加载中',
      disabled: false
    };
  },
  watch: {
    // route 只有后面的变化的时候需要用watch
    '$route'(route) {
      getUserPostList(route.params.userId, this.token).then((res) => {
        if(res.data.code === 200) {
          this.items = res.data.items;
          this.userInfo = res.data.userInfo;
          this.userRecommend = res.data.userRecommend;
        } else {
          this.$store.dispatch('show', {
            msg: res.data.message
          });
          setTimeout(() => {
            this.$store.dispatch('close');
            if(res.data.code === 5002) {
              this.$route.push('/login');
            }
          }, 2000);
        }
      }).catch((err) => {
        console.log(err);
        this.$store.dispatch('show', {
          msg: '服务器错误啦，请稍后再试'
        });
        setTimeout(() => {
          this.$store.dispatch('close');
        }, 2000);
      });
    }
  },
  methods: {
    back() {
      this.$router.back();
    },
    toIndex() {
      this.$router.push('/');
    },
    toFollowing() {
      this.$router.push({name: 'follow', params: {userId: this.userInfo._id}});
    },
    toFollower() {
      this.$router.push({
        name: 'follow',
        params: {userId: this.userInfo._id},
        query: {component: 'f-follower'}
      })
    },
    toUser(data) {
      this.$router.push({name: 'user', params: {userId: data._id}});
    },
    followIt(data) {
      if(data.follow === 'none') {
        // 关注
        follow(data._id, this.token, true).then((res) => {
          if(res.data.code === 200) {
            data.follow = res.data.eachOtherFollow ? 'eachOther' : 'following';
          } else {
            this.$store.dispatch('show', {
              msg: res.data.message
  	        });
  	        setTimeout(() => {
              this.$store.dispatch('close');
              if(res.data.code === 5002) {
                this.$route.push('/login');
              }
            }, 2000);
          }
        }).catch((err) => {
          console.log(err);
          this.$store.dispatch('show', {
            msg: '服务器错误啦，请稍后再试'
          });
          setTimeout(() => {
            this.$store.dispatch('close');
          }, 2000);
        });
      } else {
        // 取关
        follow(data._id, this.token, false).then((res) => {
          if(res.data.code === 200) {
            data.follow = 'none';
          } else {
            this.$store.dispatch('show', {
              msg: res.data.message
  	        });
  	        setTimeout(() => {
              this.$store.dispatch('close');
              if(res.data.code === 5002) {
                this.$route.push('/login');
              }
            }, 2000);
          }
        }).catch((err) => {
          console.log(err);
          this.$store.dispatch('show', {
            msg: '服务器错误啦，请稍后再试'
          });
          setTimeout(() => {
            this.$store.dispatch('close');
          }, 2000);
        });
      }
    },
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
    loadMore() {
      if (this.disabled) {
        return;
      }
      if (this.loading) {
        return;
      }
      this.loadingText = '加载中';
      this.loading = true;
      getUserPostList(this.$route.params.userId, this.token, this.page + 1).then((res) => {
        if(res.data.code === 200) {
          if (res.data.items.length !== 0) {
            this.items = this.items.concat(res.data.items);
            this.page += 1;
            this.loading = false;
          } else {
            this.loadingText = '没数据了喔';
            this.disabled = true;
            setTimeout(() => {
              this.loading = false;
            }, 1500);
          }
        } else {
          this.loading = false;
          this.$store.dispatch('show', {
            msg: res.data.message
          });
          setTimeout(() => {
            this.$store.dispatch('close');
          }, 2000);
        }
      }).catch((error) => {
        console.log(error);
        this.loading = false;
        this.$store.dispatch('show', {
          msg: '服务器错误啦，请稍后再试'
        });
        setTimeout(() => {
          this.$store.dispatch('close');
        }, 2000);
      });
    }
  },
  components: {
    'f-post-item': PostItem,
    'f-fade-spinner': FadeSpinner
  }
};
</script>
<style lang="scss" scoped>
  .container {
    margin-top: 45px;
    .user-header {
      padding: 25px 0;
      background-image: linear-gradient(0deg, #2DB0F9 0%, #1979f0 100%);
      position: relative;
      text-align: center;
      .name {
        font-size: 28px;
        color: #fff;
        margin-bottom: 20px;
        font-weight: 300;
        padding: 0 25px 0 25px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .brief {
        overflow: hidden;
        font-size: 14px;
        color: #fff;
        font-weight: 300;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 0 25px 15px 25px;
      }
      .follow-btn {
        padding: 4px 8px;
        display: inline-block;
        position: absolute;
        color: #fff;
        top: 65px;
        right: 15px;
        border: 1px solid #fff;
        border-radius: 5px;
        font-weight: 300;
        font-size: 13px;
      }
      .info {
        display: flex;
        .info-container {
          flex: 1;
          font-size: 18px;
          color: #fff;
          font-weight: 300;
          .info-number {
            margin: 5px;
          }
        }
      }
    }
    .user-recommend {
      border-bottom: 10px solid #f2f2f2;
      .user-recommend-title {
        padding: 8px 15px;
        color: #1478f0;
        font-weight: 300;
        font-size: 13px;
        border-bottom: 1px solid #dcdcdc;
      }
      .user-recommend-container {
        position: relative;
        padding: 20px;
        border-bottom: 1px solid #dcdcdc;
        background-color: #fff;
        &:nth-last-child(1) {
          border-bottom: none;
        }
        .user-recommend-name {
          color: #333;
          margin-right: 10px;
          display: inline-block;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          width: 100px;
        }
        .user-recommend-brief {
          color: #666;
          font-size: 12px;
          display: inline-block;
          width: 200px;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }
        @media screen and (min-width: 320px) and (max-width: 355px) {
          .follow-name {
            width: 80px;
          }
          .follow-brief {
            width: 160px;
          }
        }
        .user-recommend-icon {
          position: absolute;
          top: 7px;
          right: 12px;
          color: #1478f0;
          font-size: 24px;
          padding: 10px;
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
  }
</style>

