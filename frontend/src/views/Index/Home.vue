<template>
  <div class="home">
    <div class="home-header">
      <div class="name">{{userInfo.name}}</div>
      <div class="brief" v-if="userInfo.brief">简介：{{userInfo.brief}}</div>
      <div class="brief" v-else>暂无简介</div>
    </div>
    <span class="change-btn">更改</span>
    <span class="clickBoard clickBoard-right" @click="update"></span>
    <div class="info">
      <div class="info-container" @click="toList">
        <div class="info-number">{{userInfo.posts_count}}</div>
        <div class="info-text">微博</div>
      </div>
      <div class="info-container" @click="toFollow">
        <div class="info-number">{{userInfo.following_count}}</div>
        <div class="info-text">关注</div>
      </div>
      <div class="info-container" @click="toFollow">
        <div class="info-number">{{userInfo.followers_count}}</div>
        <div class="info-text">粉丝</div>
      </div>
    </div>
    <button class="logout" @click="logout">退出登录</button>
  </div>
</template>
<script>
  import {getUserInfo} from 'src/api';

  export default {
    created() {
      getUserInfo(this.token).then((res) => {
        if (res.data.code === 200) {
          this.userInfo = res.data.userInfo;
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
      }).catch((err) => {
        console.log(err);
        this.$store.dispatch('show', {
          msg: '服务器错误啦，请稍后再试'
        });
        setTimeout(() => {
          this.$store.dispatch('close');
        }, 2000);
      })
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
        token: localStorage.getItem('f-token')
      };
    },
    methods: {
      logout() {
        localStorage.removeItem('f-token');
        this.$router.push('/login');
      },
      toList() {
        this.$router.push({name: 'user', params: {userId: this.userInfo._id}});
      },
      toFollow() {
        this.$router.push({name: 'follow', params: {userId: this.userInfo._id}});
      },
      update() {
        this.$router.push('/userUpdate');
      }
    }
  };
</script>
<style lang="scss" scoped>
  .home {
    overflow: auto;
    .home-header {
      margin-bottom: 40px;
      padding: 15px 30px;
      background-color: #f2f2f2;
      position: relative;
      .name {
        font-size: 28px;
        color: #333;
        margin-bottom: 10px;
        font-weight: 300;
      }
      .brief {
        overflow: hidden;
        font-size: 14px;
        color: #666;
        font-weight: 300;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .change-btn {
      color: #666;
      font-weight: 300;
      font-size: 15px;
      position: absolute;
      top: 13px;
      right: 15px;
      z-index: 11;
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

