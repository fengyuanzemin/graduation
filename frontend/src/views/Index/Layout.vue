<template>
  <div class="container">
    <header>
      <div class="header-title">{{title}}</div>
    </header>
    <keep-alive>
      <component :is="currentView"/>
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
  import Home from './Home';
  import Movie from './Movie';
  import Search from './Search';
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
            id: 3,
            isActive: false
          },
          {
            icon: 'icon-yonghu',
            hasText: true,
            text: '我',
            showItem: 'f-home',
            id: 4,
            isActive: false
          }
        ]
      };
    },
    methods: {
      checkout(item) {
        if (item.id === 2) {
          this.toPost();
          return;
        }
        this.currentView = item.showItem;
        this.footerItem = this.footerItem.map((v) => {
          if (item.id === v.id) {
            v.isActive = true;
            this.title = v.text;
          } else {
            v.isActive = false;
          }
          return v;
        })

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
    /*background-color: #f2f2f2;*/
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

