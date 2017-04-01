<template>
  <div class="container">
    <header>
      <span class="header-left iconfont icon-houtui"></span>
      <span class="clickBoard clickBoard-left" @click="back"></span>
      <div class="header-title">转发</div>
      <span class="iconfont icon-fasong1 active"></span>
      <span class="clickBoard clickBoard-right" @click="post"></span>
    </header>
    <textarea placeholder="请输入您的内容" class="post-textarea" v-model.trim="text" autofocus="on"></textarea>
  </div>
</template>
<script>
  import {repost} from 'src/api/';

  export default {
    data() {
      return {
        text: '',
        token: localStorage.getItem('f-token')
      };
    },
    methods: {
      back() {
        this.$router.back();
      },
      post() {
        repost(this.$route.params.postId, this.text, this.token).then((res) => {
          if (res.data.code === 200) {
            this.$router.push('/');
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
    .icon-fasong1 {
      position: absolute;
      top: 13px;
      right: 15px;;
      font-size: 23px;
      color: #666;
      &.active {
        color: #1478f0;
      }
    }
    .post-textarea {
      margin-top: 45px;
      width: 100%;
      outline: none;
      border: none;
      resize: none;
      padding: 15px;
      box-sizing: border-box;
      font-size: 20px;
      color: #333;
      height: 40vh;
    }
  }
</style>

