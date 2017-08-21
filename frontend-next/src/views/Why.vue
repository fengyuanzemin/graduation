<template>
  <div class="container">
    <header>
      <span class="header-left iconfont icon-houtui"></span>
      <span class="clickBoard clickBoard-left" @click="back"></span>
      <div class="header-title">推荐原因</div>
      <span class="header-right">回首页</span>
      <span class="clickBoard clickBoard-right clickBoard-right-big" @click="toIndex"></span>
    </header>
    <f-post-item v-for="item in postItems" :item="item"></f-post-item>
    <f-movie-item v-for="item in movieItems" :item="item"></f-movie-item>
  </div>
</template>
<script>
  import { why } from 'src/api';
  import PostItem from 'components/PostItem';
  import MovieItem from 'components/MovieItem';

  export default {
    async created(){
      try {
        const res = await why(this.$route.params.userId, this.$store.state.token);
        if (res.data.code === 200) {
          this.postItems = res.data.intersection;
          this.movieItems = res.data.movieIntersection;
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
        postItems: [],
        movieItems: []
      };
    },
    methods: {
      back() {
        this.$router.back();
      },
      toIndex() {
        this.$router.push('/');
      },
    },
    components: {
      'f-post-item': PostItem,
      'f-movie-item': MovieItem
    }
  };
</script>
<style lang="scss" scoped>
  .container {
    padding-top: 45px;
  }
</style>

