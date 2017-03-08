<template>
  <div class="container">
    <header>
      <span class="iconfont icon-houtui header-left" />
      <span class="clickBoard clickBoard-left" @click="back"/>
      <div class="header-title">个人中心</div>
      <span class="header-right">回首页</span>
      <span class="clickBoard clickBoard-right" @click="toIndex"/>
    </header>
    <div class="user-header">
      <div class="name">{{userInfo.name}}</div>
      <div class="brief" v-if="userInfo.brief">简介：{{userInfo.brief}}</div>
      <div class="brief" v-else>暂无简介</div>
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
    <f-post-item v-for="item in items" :item="item"/>
  </div>
</template>
<script>
import PostItem from 'src/components/PostItem';
import {getUserPostList} from 'src/api';
import {getCookie} from 'src/utils';

export default {
  created() {
    getUserPostList(this.$route.params.userId, this.token).then((res) => {
      if(res.data.code === 200) {
        this.items = res.data.items;
        this.userInfo = res.data.userInfo;
      }
    }).catch((err) => {
      console.log(err);
    });
  },
  data() {
    return {
      userInfo: {
        name: '',
        posts_count: 0,
        following_count: 0,
        followers_count: 0,
        brief: ''
      },
      items: [],
      token: getCookie('f-token')
    };
  },
  watch: {
    // route 只有后面的变化的时候需要用watch
    '$route'(route) {
      getUserPostList(route.params.userId, this.token).then((res) => {
      if(res.data.code === 200) {
        this.items = res.data.items;
        this.userInfo = res.data.userInfo;
      }
      }).catch((err) => {
        console.log(err);
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
  },
  components: {
    'f-post-item': PostItem
  }
};
</script>
<style lang="scss" scoped>
.container {
  margin-top: 45px;
  .user-header {
    padding: 25px 0;
    /*background-color: #888;*/
    background-image: linear-gradient(0deg, #2DB0F9 0%, #1979f0 100%);
    position: relative;
    text-align: center;
    .name {
      font-size: 28px;
      color: #fff;
      margin-bottom: 20px;
      font-weight: 300;
      padding: 0 25px 0 25px;
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
}
</style>

