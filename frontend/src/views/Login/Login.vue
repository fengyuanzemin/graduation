<template>
  <div class="login">
    <div class="input">
      <div class="input-group">
        <span class="iconfont icon-yonghu left-icon"></span><input type="text" placeholder="请输入用户名" maxlength="20"
                                                             v-model="name" v-focus-parent autofocus="on">
        <!-- <span class="warning">{{phoneMsg}}</span> -->
      </div>
      <div class="input-group bottom">
        <span class="iconfont icon-mima left-icon"></span><input type="password" placeholder="请输入密码" v-model="password"
                                                           v-focus-parent>
        <!-- <span class="warning">{{verifyErrorMsg}}</span> -->
      </div>
    </div>
    <div class="button-group">
      <button :disabled="buttonDisabled" :class="{active: !buttonDisabled}" @click="login"><span
        v-show="!submitLoading">登录</span>
        <f-fade-spinner v-show="submitLoading"></f-fade-spinner>
      </button>
    </div>
    <div class="button-group">
      <button @click="toSignUp" class="button-white">去注册</button>
    </div>
  </div>
</template>
<script>
  import FadeSpinner from 'components/FadeSpinner';
  import {login} from 'src/api/index';

  export default {
    data() {
      return {
        name: '',
        password: '',
        buttonDisabled: true,
        submitLoading: false
      };
    },
    methods: {
      login() {
        this.$store.dispatch('show', {
          msg: '登录中，请等待'
        });
        login(this.name, this.password).then((res) => {
          if (res.data.code === 200) {
            localStorage.setItem('f-token', res.data.token);
            this.$store.dispatch('checkoutMsg', {
              msg: '登录成功'
            });
            setTimeout(() => {
              this.$store.dispatch('close');
              this.$router.push('/');
            }, 1200);
          } else {
            this.$store.dispatch('checkoutMsg', {
              msg: res.data.message
            });
            setTimeout(() => {
              this.$store.dispatch('close');
            }, 2000);
          }
        }).catch((err) => {
          console.log(err)
          this.$store.dispatch('show', {
            msg: '服务器错误啦，请稍后再试'
          });
          setTimeout(() => {
            this.$store.dispatch('close');
          }, 2000);
        })
      },
      toSignUp() {
        this.$emit('checkout', 'f-sign-up');
      },
      checkNameAndPassword(name, password) {
        return (name && password && password.length >= 6 && password.length <= 14);
      }
    },
    watch: {
      name() {
        this.buttonDisabled = !this.checkNameAndPassword(this.name, this.password);
      },
      password() {
        this.buttonDisabled = !this.checkNameAndPassword(this.name, this.password);
      }
    },
    components: {
      'f-fade-spinner': FadeSpinner
    }
  };
</script>
<style lang="scss" scoped>
  .login {
    position: absolute;
    top: 65px;
    width: 100%;
    .input {
      background-color: #ffffff;
      .input-group {
        border-bottom: 1px solid #dcdcdc;
        transition: border-bottom .3s;
        padding: 0 3.5px 8px 3.5px;
        margin: 0 25px 35px 25px;
        position: relative;
        &.bottom {
          margin-bottom: 40px;
          padding-left: 5.5px;
        }
        .left-icon {
          margin-right: 7.5px;
          color: #666666;
        }
        .icon-yonghu {
          font-size: 19px;
        }
        .icon-mima {
          font-size: 19px;
        }
        // .icon-shanchu {
        //   color: #cdcdcd;
        //   position: absolute;
        //   right: 7.5px;
        //   top: 2px;
        //   &.verify-clear {
        //     right: 105px;
        //   }
        // }
        // &.error {
        //   border-bottom: 1px solid #fc5400;
        //   transition: border-bottom .3s;
        // }
        &.focus {
          border-bottom: 1px solid #1478f0;
          transition: border-bottom .3s;
        }
        // .warning {
        //   font-size: 12px;
        //   color: #fc5400;
        //   line-height: 12px;
        //   position: absolute;
        //   top: 31px;
        //   left: 4.5px;
        // }
        input {
          border: none;
          color: #333333;
          font-size: 16px;
          line-height: 16px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Microsoft Yahei, Arial, sans-serif;
          width: 250px;
          &::-webkit-input-placeholder {
            color: #b1b1b1;
            font-weight: 300;
          }
          &::-moz-placeholder { /* Mozilla Firefox 19+ */
            color: #b1b1b1;
            font-weight: 300;
          }
          &:disabled {
            background-color: #ffffff;
          }
        }
        // .line {
        //   display: inline-block;
        //   width:1px;
        //   height:14px;
        //   background-color: #e6e6e6;
        //   position: absolute;
        //   top:4px;
        //   right: 97.5px;
        // }
        // .verify {
        //   display: inline-block;
        //   vertical-align: top;
        //   font-size: 15px;
        //   line-height: 22px;
        //   text-align: right;
        //   position: absolute;
        //   top: 0;
        //   right: 7.5px;
        //   color: #999;
        //   font-weight: 300;
        //   &.active {
        //     color: #1478f0;
        //   }
        // }
      }
      @media screen and (max-width: 340px) and (min-width: 319px) {
        .input-group {
          margin-right: 15px;
          margin-left: 15px;
          input {
            font-size: 15px;
            line-height: 15px;
            width: 230px;
          }
        }
      }
    }
    .button-group {
      width: 100%;
      margin-bottom: 14px;
      button {
        margin: 0 auto;
        text-decoration: none;
        color: #ffffff;
        font-size: 16px;
        line-height: 16px;
        background-color: #cdcdcd;
        width: 325px;
        height: 35px;
        border: none;
        border-radius: 10px;
        display: block;
        &.active {
          background-image: linear-gradient(90deg, #2db0f9 0%, #1478f0 100%);
        }
        &.button-white {
          background-color: #fff;
          color: #666666;
          border: 1px solid #dcdcdc;
        }
        @media screen and (max-width: 340px) and (min-width: 319px) {
          & {
            width: 300px;
          }
        }
      }
    }
  }
</style>

