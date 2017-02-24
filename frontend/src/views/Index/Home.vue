<template>
  <div class="home">
    <div class="name">{{name}}</div>
    <div class="info">
      <div class="info-container" @click="toList">
        <div class="info-number">{{posts_count}}</div>
        <div class="info-text">微博</div>
      </div>
      <div class="info-container" @click="toFollowing">
        <div class="info-number">{{following_count}}</div>
        <div class="info-text">关注</div>
      </div>
      <div class="info-container" @click="toFollower">
        <div class="info-number">{{followers_count}}</div>
        <div class="info-text">粉丝</div>
      </div>
    </div>
    <button class="logout" @click="logout">退出登录</button>
  </div>
</template>
<script>
import {getUserInfo} from 'src/api';
import {getCookie, clearCookie} from 'src/utils';
export default {
  created() {
    getUserInfo(this.token).then((res) => {
      console.log(res)
      const userInfo = res.data.userInfo;
      this.name = userInfo.name;
      this.posts_count = userInfo.posts_count;
      this.following_count = userInfo.following_count;
      this.followers_count = userInfo.followers_count;
    }).catch((err) => {
      console.log(err)
    })
  },
  computed:{
    token() {
      return getCookie('f-token');
    }
  },
  data() {
    return {
      name: '',
      posts_count: 0,
      following_count: 0,
      followers_count: 0
    };
  },
  methods: {
    logout() {
      clearCookie('f-token', () => {
        this.$router.push('/login');
      });
    },
    toList() {

    },
    toFollowing() {

    },
    toFollower() {

    }
  }
};
</script>
<style lang="scss" scoped>
.home {
	margin-top: 45px;
  overflow: auto;
  .name {
    text-align: center;
    font-size: 30px;
    margin: 15px 0 40px 0;
    color: #333;
  }
  .info {
    display: flex;
    .info-container {
      text-align: center;
      flex: 1;
      font-size: 18px;
      color: #666;
      font-weight: 300;
      .info-number {
        margin: 5px;
      }
    }
  }
  .logout {
    background-color: #E8251E;
    -webkit-appearance: none;
    border: 1px solid #C7161C;
    height: 35px;
    width: 300px;
    color: #fff;
    display: block;
    margin: 100px auto 0 auto;
    font-size: 17px;
    font-weight: 300;
  }
}
</style>

