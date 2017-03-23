<template>
  <div class="container">
    <div class="follow-empty" v-if="items.length == 0">暂无粉丝</div>
    <div class="follow-container" v-for="item in items" @click="toUser(item.follower)">
      <span class="follow-name">{{item.follower.name}}</span><!--
      --><span class="follow-brief" v-if="item.follower.brief">{{item.follower.brief}}</span><!--
      --><span class="follow-brief" v-else>暂无简介</span><!--
      --><span class="iconfont follow-icon icon-guanzhu" v-if="item.follower.follow === 'none'"
               @click.prevent.stop="follow(item.follower)"/><!--
      --><span class="iconfont follow-icon icon-icon-yiguanzhu" v-else-if="item.follower.follow === 'following'"
               @click.prevent.stop="follow(item.follower)"/><!--
      --><span class="iconfont follow-icon icon-huxiangguanzhu" v-else-if="item.follower.follow === 'eachOther'"
               @click.prevent.stop="follow(item.follower)"/>
    </div>
  </div>
</template>
<script>
import {getFollowList, follow} from 'src/api';

export default {
  created() {
    getFollowList(0, this.$route.params.userId, this.token).then((res) => {
      if(res.data.code === 200) {
        this.items = res.data.followList;
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
    });
  },
  data() {
    return {
      items: [],
      token: localStorage.getItem('f-token')
    };
  },
  methods: {
    toUser(data) {
      this.$router.push({name: 'user', params: {userId: data._id}});
    },
    follow(data) {
      if(data.follow === 'none') {
        // 关注
        follow(data._id, this.token, true).then((res) => {
          if(res.data.code === 200) {
            data.follow = res.data.eachOtherFollow ? 'eachOther' : 'following';
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
        });
      } else {
        // 取关
        follow(data._id, this.token, false).then((res) => {
          if(res.data.code === 200) {
            data.follow = 'none';
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
        });
      }
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

