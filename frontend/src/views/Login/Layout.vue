<template>
  <div class="container">
  	<header>
      <span class="header-left iconfont icon-houtui1"></span>
      <span class="clickBoard clickBoard-left" @click="back"></span>
  		<div class="header-title">{{title}}</div>
  	</header>
    <transition name="rotate-left-right">
      <keep-alive>
        <component :is="currentView" @checkout="checkout"></component>
      </keep-alive>
    </transition>
  </div>
</template>
<script>
import Login from './Login';
import SignUp from './SignUp';

export default {
  data() {
    return {
    	title: '登录',
      currentView: 'f-login'
    };
  },
  methods: {
    back() {
      this.$router.back();
    },
    checkout(component) {
      this.currentView = component;
      if(component === 'f-login') {
        this.title = '登录';
      } else {
        this.title = '注册';
      }
    }
  },
  components: {
    'f-login': Login,
    'f-sign-up': SignUp
  }
};
</script>
<style lang="scss" scoped>
.container {
  margin-top: 45px;
}
</style>

