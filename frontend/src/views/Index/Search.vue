<template>
  <div class="search">
    <div class="search-input-container">
      <span class="search-btn" :class="{active: text}" @click="search">搜索</span>
      <input class="search-input" v-model.trim="text" autofocus="on" placeholder="请输入搜索词或者用户">
      <span class="iconfont icon-sousuo-sousuo search-icon"/>
    </div>
    <div class="search-user" v-if="users.length > 0">
      <div class="search-title">相关用户</div>
      <div class="search-user-container" v-for="user in users" @click.prevent.stop="toUser(user)">
        <span class="search-user-name">{{user.name}}</span><!--
      --><span class="search-user-brief" v-if="user.brief">{{user.brief}}</span><!--
      --><span class="search-user-brief" v-else>暂无简介</span><!--
      --><span class="iconfont search-user-follow" :class="{'icon-guanzhu': !user.follow, 'icon-icon-yiguanzhu': user.follow}" @click.prevent.stop="follow(user)"/>
      </div>
    </div>
    <div class="search-title" v-if="items.length > 0">相关搜索</div>
    <f-post-item v-for="item in items" :item="item"/>
  </div>
</template>
<script>
import {search, follow} from 'src/api';
import PostItem from 'src/components/PostItem';
import {getCookie} from 'src/utils';

export default {
  data() {
    return {
      text: '',
      items: [],
      users: []
    };
  },
  computed: {
    token() {
      return getCookie('f-token');
    }
  },
  methods: {
    search() {
      if(!this.text) {
        this.items.length = [];
        return;
      }
      search(this.text, this.token).then((res) => {
        console.log(res)
        if(res.data.code === 200) {
          this.items = res.data.post;
          this.users = res.data.user;
        }
      }).catch((err) => {
        console.log(err)
      });
    },
    toUser(data) {
      this.$router.push({name: 'user', params: {userId: data._id}});
    },
    follow(data) {
      console.log(data)
      follow(data._id, this.token, true).then((res) => {
        console.log(res);

      }).catch((err) => {
        console.log(err);
      });
    }
  },
  components: {
    'f-post-item': PostItem
  }
};
</script>
<style lang="scss" scoped>
  .search {
    .search-input-container {
      position: relative;
      .search-btn {
        color: #666;
        font-weight: 300;
        font-size: 15px;
        position: absolute;
        top: -3px;
        right: 5px;
        display: inline-block;
        padding: 10px;
        &.active {
          color: #1478f0;
        }
      }
      .search-icon {
        position: absolute;
        top: 9px;
        left: 15px;
        color: #999;
      }
      .search-input {
        width: 100%;
        font-size: 15px;
        height: 30px;
        background: #f2f2f2;
        color: #666;
        font-weight: 300;
        box-sizing: border-box;
        border: 1px solid #dcdcdc;
        border-radius: 5px;
        text-indent: 41px;
        margin-bottom: 10px;
      }
    }
    .search-title {
      padding: 15px;
      color: #666;
      font-size: 14px;
      border-bottom: 1px solid #dcdcdc;
      font-weight: 600;
    }
    .search-user {
      border-bottom: 5px solid #dcdcdc;
      .search-user-container {
        padding: 20px 15px;
        border-bottom: 1px solid #dcdcdc;
        position: relative;
        &:nth-last-child(1) {
          border-bottom: none;
        }
        .search-user-name {
          font-size: 17px;
          color: #333;
          margin-right: 20px;
        }
        .search-user-brief {
          color: #666;
          font-size: 13px;
          font-weight: 300;
        }
        .search-user-follow {
          position: absolute;
          right: 5px;
          top: 4px;
          font-size: 23px;
          color: #1478f0;
          padding:15px;
        }
      }
    }
  }
</style>

