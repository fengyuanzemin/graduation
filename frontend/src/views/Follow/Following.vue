<template>
  <div class="container">
    <div class="follow-empty" v-if="items.length == 0">暂无关注</div>
    <div class="follow-container" v-for="item in items" @click.prevent.stop="toUser(item.following)">
      <span class="follow-name">{{item.following.name}}</span><!--
      --><span class="follow-brief" v-if="item.following.brief">{{item.following.brief}}</span><!--
      --><span class="follow-brief" v-else>暂无简介</span><!--
      --><span class="follow-icon iconfont" :class="{'icon-guanzhu': !item.following.follow, 'icon-icon-yiguanzhu': item.following.follow}" @click.prevent.stop="follow(item.following)"/>
    </div>
  </div>
</template>
<script>
import {getFollowList, follow} from 'src/api';
import {getCookie} from 'src/utils';
export default {
  created() {
    getFollowList(1, this.$route.params.userId).then((res) => {
      console.log(res)
      if(res.data.code === 200) {
        this.items = res.data.followList;
      }
    }).catch((err) => {
      console.log(err);
    });
  },
  computed: {
    token() {
      return getCookie('f-token');
    }
  },
  data() {
    return {
      items: []
    };
  },
  methods: {
    toUser(data) {
      this.$router.push({name: 'user', params: {userId: data._id}});
    },
    follow(data) {
      follow(data._id, this.token, !data.follow).then((res)=>{
        if(res.data.code === 200) {
          data.follow = !data.follow;
        }
      }).catch((err)=>{
        console.log(err);
      });
    }
  }
};
</script>
<style lang="scss" scoped>
  .container {
    .follow-container {
      position: relative;
      padding: 20px;
      border-top:1px solid #dcdcdc;
      background-color: #fff;
      &:nth-last-child(1) {
        border-bottom: 1px solid #dcdcdc;
      }
      .follow-name {
        color: #333;
        margin-right:10px;
        display: inline-block;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        width: 100px;
      }
      .follow-brief {
        color: #666;
        font-size: 12px;
        display: inline-block;
        width: 200px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
      @media screen and (min-width: 320px) and (max-width: 355px){
        .follow-name {
          width: 80px;
        }
        .follow-brief {
          width: 160px;
        }
      }
      .follow-icon {
        position: absolute;
        top: 7px;
        right: 12px;
        color: #1478f0;
        font-size: 24px;
        padding: 10px;
      }
    }
  }
</style>

