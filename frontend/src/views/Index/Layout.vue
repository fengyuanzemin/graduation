<template>
  <div class="container">
    <header>
      <div class="header-title">{{title}}</div>
    </header>
    <keep-alive>
      <component :is="currentView"></component>
    </keep-alive>
    <footer>
      <div class="footer-item" v-for="item in footerItem" @click="checkout(item)">
        <span class="iconfont" :class="item.icon" v-if="item.hasText"></span>
        <span class="iconfont footer-plus" :class="item.icon" v-else></span>
        <span class="footer-text">{{item.text}}</span>
      </div>
    </footer>
  </div>
</template>
<script>
  import Index from './Index';
  import Home from './Home';
  import Movie from './Movie';
  import Search from './Search';

  export default {
    created() {
      if (this.$route.query.component) {
        let i = 0;
        this.footerItem.forEach(item => {
          if (item.showItem === this.$route.query.component) {
            this.currentView = this.$route.query.component;
          } else {
            i += 1;
          }
        });
        // 防止乱输入
        if (i === this.footerItem.length) {
          this.$router.push('/404');
        }
      }
    },
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
            id: 0
          },
          {
            icon: 'icon-dianying',
            hasText: true,
            text: '电影',
            showItem: 'f-movie',
            id: 1
          },
          {
            icon: 'icon-jia',
            hasText: false,
            id: 2
          },
          {
            icon: 'icon-sousuo-sousuo',
            hasText: true,
            text: '搜索',
            showItem: 'f-search',
            id: 3
          },
          {
            icon: 'icon-yonghu',
            hasText: true,
            text: '我',
            showItem: 'f-home',
            id: 4
          }
        ]
      };
    },
    watch: {
      '$route'() {
        this.currentView = this.$route.query.component;
      }
    },
    methods: {
      checkout(item) {
        if (item.id === 2) {
          this.toPost();
          return;
        }
        this.$router.push({path: '/', query: {component: item.showItem}});
      },
      toPost() {
        this.$router.push('/post');
      }
    },
    components: {
      'f-index': Index,
      'f-home': Home,
      'f-movie': Movie,
      'f-search': Search
    }
  };
</script>
<style lang="scss" scoped>
  .container {
    padding-top: 45px;
    padding-bottom: 49px;
    footer {
      display: flex;
      text-align: center;
      position: fixed;
      bottom: 0;
      width: 100%;
      background-color: #fff;
      border-top: 1px solid #dcdcdc;
      .footer-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        .footer-text {
          color: #333;
          font-size: 14px;
          margin: 5px 0;
          font-weight: 300;
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

