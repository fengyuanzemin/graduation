<template>
  <div class="container">
    <header>
      <span class="header-left iconfont icon-houtui"></span>
      <span class="clickBoard clickBoard-left" @click="back"></span>
      <div class="header-title">设置用户信息</div>
      <span class="iconfont icon-baocun" :class="{active: text || name}"></span>
      <span class="clickBoard clickBoard-right" @click="post"></span>
    </header>
    <label class="post-container">
      <span class="post-input-title">用户名：</span><input class="post-input" placeholder="请输入新名称" v-model.trim="name"
                                                       autofocus="on"/>
    </label>
    <label>
      <span class="post-title">用户签名:</span>
      <textarea placeholder="请输入新签名" class="post-textarea" v-model.trim="text"></textarea>
    </label>
  </div>
</template>
<script>
  import {updateUserInfo, getUserInfo} from 'src/api/';

  export default {
    created() {
      getUserInfo(this.token).then((res) => {
        if (res.data.code === 200) {
          this.name = res.data.userInfo.name;
          this.text = res.data.userInfo.brief;
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
      });
    },
    data() {
      return {
        name: '',
        text: '',
        token: localStorage.getItem('f-token')
      };
    },
    methods: {
      back() {
        this.$router.back();
      },
      post() {
        if (!(this.text || this.name)) {
          return;
        }
        updateUserInfo(this.name, this.text, this.token).then((res) => {
          if (res.data.code === 200) {
            this.$router.push('/');
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
      }
    }
  };
</script>
<style lang="scss" scoped>
  .container {
    margin-top: 45px;
    .icon-baocun {
      position: absolute;
      top: 13px;
      right: 15px;;
      font-size: 23px;
      color: #666;
      &.active {
        color: #1478f0;
      }
    }
    .post-container {
      padding: 15px;
      width: 100%;
      display: block;
      box-sizing: border-box;
      .post-input-title {
        font-weight: 300;
        color: #666;
      }
      .post-input {
        font-size: 20px;
        color: #333;
        height: 50px;
        width: 280px;
      }
    }
    .post-title {
      padding: 15px;
      display: block;
      font-weight: 300;
      color: #666;
    }
    .post-textarea {
      width: 100%;
      outline: none;
      border: none;
      resize: none;
      padding: 15px;
      box-sizing: border-box;
      font-size: 20px;
      color: #333;
      height: 30vh;
    }
  }
</style>

