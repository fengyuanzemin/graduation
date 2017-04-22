<template>
  <div class="container">
    <div class="follow-empty" v-if="items.length === 0">暂无推荐</div>
    <div class="follow-container" v-for="item in items" @click.stop.prevent="toUser(item)" :key="item._id">
      <span class="follow-name">{{item.name}}</span><!--
      --><span class="follow-brief" v-if="item.brief">{{item.brief}}</span><!--
      --><span class="follow-brief" v-else>暂无简介</span><!--
      --><span class="follow-why-button" @click.stop.prevent="why(item)">为什么 <span
      class="iconfont icon-yiwen"></span></span><!--
      --><span class="iconfont follow-icon icon-guanzhu" v-if="item.follow === 'none'"
               @click.prevent.stop="follow(item)"></span><!--
      --><span class="iconfont follow-icon icon-icon-yiguanzhu" v-else-if="item.follow === 'following'"
               @click.prevent.stop="follow(item)"></span><!--
      --><span class="iconfont follow-icon icon-huxiangguanzhu" v-else-if="item.follow === 'eachOther'"
               @click.prevent.stop="follow(item)"></span>
    </div>
  </div>
</template>
<script>
  import {recommend, follow, why} from 'src/api';

  export default {
    async created() {
      try {
        const res = await recommend(this.$store.state.token);
        if (res.data.code === 200) {
          this.items = res.data.recommend;
        } else {
          this.$store.dispatch('show', {
            msg: res.data.message
          });
          setTimeout(() => {
            this.$store.dispatch('close');
            if (res.data.code === 5002) {
              this.$router.push('/login');
            }
          }, 2000);
        }
      } catch (err) {
        console.log(err);
        this.$store.dispatch('show', {
          msg: '服务器错误啦，请稍后再试'
        });
        setTimeout(() => {
          this.$store.dispatch('close');
        }, 2000);
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
      why(data) {
        this.$router.push({name: 'why', params: {userId: data._id}});
      },
      async follow(data) {
        const doFollow = data.follow === 'none';
        try {
          const res = await follow(data._id, this.$store.state.token, doFollow);
          if (res.data.code === 200) {
            if (doFollow) {
              // 关注
              data.follow = res.data.eachOtherFollow ? 'eachOther' : 'following';
            } else {
              //  取关
              data.follow = 'none';
            }
          } else {
            this.$store.dispatch('show', {
              msg: res.data.message
            });
            setTimeout(() => {
              this.$store.dispatch('close');
              if (res.data.code === 5002) {
                this.$router.push('/login');
              }
            }, 2000);
          }
        } catch (err) {
          console.log(err);
          this.$store.dispatch('show', {
            msg: '服务器错误啦，请稍后再试'
          });
          setTimeout(() => {
            this.$store.dispatch('close');
          }, 2000);
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
      border-top: 1px solid #dcdcdc;
      background-color: #fff;
      &:nth-last-child(1) {
        border-bottom: 1px solid #dcdcdc;
      }
      .follow-name {
        color: #333;
        margin-right: 10px;
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
        width: 140px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
      .follow-why-button {
        font-size: 12px;
        color: #999;
        transform: scale(.7);
        display: inline-block;
        padding: 5px;
        position: absolute;
        top: 17px;
        right: 44px;
      }
      @media screen and (min-width: 320px) and (max-width: 355px) {
        .follow-name {
          width: 80px;
        }
        .follow-brief {
          width: 100px;
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

