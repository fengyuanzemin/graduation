<template>
  <div class="container">
    <header>
      <div class="header-title">{{title}}</div>
      <span class="header-right">登录</span>
      <span class="clickBoard clickBoard-right" @click="toLogin" />
    </header>
    <keep-alive>
      <component :is="currentView" />
    </keep-alive>
    <footer>
      <div class="footer-item" v-for="item in footerItem" @click="checkout(item)">
        <span class="iconfont" :class="item.icon" v-if="item.hasText" />
        <span class="iconfont footer-plus" :class="item.icon" v-else />
        <span class="footer-text">{{item.text}}</span>
      </div>
    </footer>
  </div>
</template>
<script>
  import Index from './Index';
  import Movie from './Movie';
  export default {
    data() {
      return {
        currentView: 'f-index',
        title: '首页',
        footerItem: [
          {
            icon: 'icon-homepage-red',
            hasText: true,
            text: '首页',
            showItem: 'f-index',
            id: 0,
            isActive: true
          },
          {
            icon: 'icon-dianying',
            hasText: true,
            text: '电影',
            showItem: 'f-movie',
            id: 1,
            isActive: false
          }
        ]
      };
    },
    methods: {
      checkout(item) {
        this.currentView = item.showItem;
        this.footerItem = this.footerItem.map((v) => {
          if (item.id === v.id) {
            v.isActive = true;
          } else {
            v.isActive = false;
          }
          return v;
        });
      },
      toLogin() {
      	this.$router.push('/login');
      }
    },
    components: {
      'f-index': Index,
      'f-movie': Movie
    }
  };
</script>
<style lang="scss" scoped>
  .container {
    margin-top: 45px;
    padding-bottom: 45px;
    overflow: auto;
    footer {
      display: flex;
      text-align: center;
      position: fixed;
      bottom: 0;
      width: 100%;
      background-color: #f0f0f0;
      .footer-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        .footer-text {
          color: #333;
          font-size: 14px;
          margin: 5px 0;
        }
        .iconfont {
          color: #555;
          font-size: 20px;
          margin-top: 5px;
          &.footer-plus {
            font-size: 30px;
          }
        }
      }
    }
  }
</style>

