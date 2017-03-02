<template>
  <div class="container">
    <div class="follow-container" v-for="item in items" @click="toUser(item.follower)">
      <span class="follow-name">{{item.follower.name}}</span><!--
      --><span class="follow-brief" v-if="item.follower.brief">{{item.follower.brief}}</span><!--
      --><span class="follow-brief" v-else>暂无简介</span><!--
      --><span class="follow-icon iconfont icon-qianjin"/>
    </div>
  </div>
</template>
<script>
import {getFollowList} from 'src/api';
import {getCookie} from 'src/utils';
export default {
  created() {
    getFollowList(0, this.token).then((res) => {
      if(res.data.code === 200) {
        this.items = res.data.followList;
      }
    }).catch((err)=>{
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
      top: 22px;
      right: 15px;
    }
  }
}
</style>

