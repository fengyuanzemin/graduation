<template>
  <div class="container">
    <header>
      <span class="iconfont icon-houtui header-left"/>
      <span class="clickBoard clickBoard-left" @click="back"/>
      <div class="header-title">{{name}}</div>
    </header>
    <div class="select">
      <div class="select-container" :class="{active: item.active}" v-for="item in selectItem" @click="checkout(item)">
        <span class="select-text">{{item.text}}</span>
      </div>
    </div>
    <component :is="currentView"/>
  </div>
</template>
<script>
import {judgeUser} from 'src/api';
import Follower from './Follower';
import Following from './Following';
import Recommend from './Recommend';

export default {
  created() {
    if(this.$route.query.component) {
      this.selectItem = this.selectItem.map((item) => {
        item.active = !!(item.component === this.$route.query.component);
        return item;
      });
      this.currentView = this.$route.query.component;
    }
    // 判断是否为自己的主页
    judgeUser(this.$route.params.userId, this.token).then((res) => {
      if (res.data.code === 200) {
        this.name = res.data.self ? '我的好友' : '他的好友';
      } else {
        this.$store.dispatch('show', {
          msg: res.data.message
  	    });
  	    setTimeout(() => {
          this.$store.dispatch('close');
          if(res.data.code === 5002) {
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
  },
  data() {
    return {
      currentView: 'f-recommend',
      name: '我的好友',
      selectItem: [
        {
          id: 0,
          text: '猜你认识',
          component: 'f-recommend',
          active: true
        },
        {
          id: 1,
          text: '关注',
          component: 'f-following',
          active: false,
        },
        {
          id: 2,
          text: '粉丝',
          component: 'f-follower',
          active: false
        }
      ],
      token: localStorage.getItem('f-token')
    };
  },
  methods: {
    checkout(data) {
      this.selectItem = this.selectItem.map((item) => {
        if(data.id === item.id) {
          this.currentView = data.component;
        }
        item.active = !!(item.id === data.id);
        return item;
      });
    },
    back() {
      this.$router.back();
    }
  },
  components: {
    'f-follower': Follower,
    'f-following': Following,
    'f-recommend': Recommend
  }
};
</script>
<style lang="scss" scoped>
  .container {
    margin-top: 81px;
    .select {
      display: flex;
      position: absolute;
      top: 45px;
      width: 100%;
      .select-container {
        box-sizing: border-box;
        flex: 1;
        padding: 10px;
        text-align: center;
        .select-text {
          color: #333;
        }
        &.active {
          background-color: #f2f2f2;
        }
      }
    }
  }
</style>

