<template>
  <div class="container">
    <header>
      <span class="header-left iconfont icon-houtui"/>
      <span class="clickBoard clickBoard-left" @click="back"/>
      <div class="header-title">评论</div>
      <span class="iconfont icon-fasong1" :class="{active: text}"/>
      <span class="clickBoard clickBoard-right" @click="post"/>
    </header>
    <textarea placeholder="请输入您的内容" class="post-textarea" v-model.trim="text" autofocus="on"/>
  </div>
</template>
<script>
import {getCookie} from 'src/utils/';
import {comment} from 'src/api/';

export default {
  data() {
    return {
      text: '',
      token: getCookie('f-token')
    };
  },
  methods: {
    back() {
      this.$router.back();
    },
    post() {
      if(!this.text) {
        return;
      }
      comment(this.$route.params.postId, this.text, this.token).then((res) => {
        switch (res.data.code) {
          case 200:
          // 发送成功
            this.$router.push({name: 'status', params: { postId: this.$route.params.postId }});
          break;
          case 5002:
          // token过期
            this.$router.push('/login');
          break;
        }
      }).catch((err) => {
        console.log(err);
        // 发送失败
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

