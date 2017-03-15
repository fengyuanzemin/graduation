<template>
  <div class="container">
    <header>
      <span class="header-left iconfont icon-houtui"/>
      <span class="clickBoard clickBoard-left" @click="back"/>
      <div class="header-title">设置用户信息</div>
      <span class="iconfont icon-baocun" :class="{active: text || name}"/>
      <span class="clickBoard clickBoard-right" @click="post"/>
    </header>
    <label class="post-container">
      <span class="post-input-title">用户名：</span><input class="post-input" placeholder="请输入新名称" v-model.trim="name" autofocus="on"/>
    </label>
    <label>
      <span class="post-title">用户签名:</span>
    <textarea placeholder="请输入新签名" class="post-textarea" v-model.trim="text"/>
    </label>
  </div>
</template>
<script>
import {getCookie} from 'src/utils/';
import {updateUserInfo, getUserInfo} from 'src/api/';

export default {
  created() {
    getUserInfo(this.token).then((res)=>{
      this.name = res.data.userInfo.name;
      this.text = res.data.userInfo.brief;
    }).catch((err)=>{
      console.log(err);
    });
  },
  data() {
    return {
      name: '',
      text: '',
      token: getCookie('f-token')
    };
  },
  methods: {
    back() {
      this.$router.back();
    },
    post() {
      if(!(this.text || this.name)) {
        return;
      }
      updateUserInfo(this.name, this.text, this.token).then((res) => {
        console.log(res);
        switch (res.data.code) {
          case 200:
          // 发送成功
            this.$router.push('/');
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

