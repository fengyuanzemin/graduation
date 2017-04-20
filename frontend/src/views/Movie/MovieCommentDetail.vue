<template>
  <div class="container">
    <header>
      <span class="header-left iconfont icon-houtui"></span>
      <span class="clickBoard clickBoard-left" @click="back"></span>
      <div class="header-title">{{title}}</div>
      <span class="header-right">回首页</span>
      <span class="clickBoard clickBoard-right clickBoard-right-big" @click="toIndex"></span>
    </header>
    <f-movie-rating-item :items="commentItems"></f-movie-rating-item>
  </div>
</template>
<script>
  import MovieRatingItem from 'src/components/MovieRatingItem';
  import {movieComment} from 'src/api';

  export default {
    created(){
      movieComment(this.$route.params.movieId, this.token).then((res) => {
        if (res.data.code === 200) {
          if (res.data.movieInfo && res.data.movieInfo.title) {
            this.title = res.data.movieInfo.title.split(' ').shift();
          }
          this.commentItems = res.data.commentList;
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
        commentItems: [],
        token: localStorage.getItem('f-token'),
        title: '电影'
      };
    },
    methods: {
      back(){
        this.$router.back();
      },
      toIndex(){
        this.$router.push('/?component=f-movie')
      }
    },
    components: {
      'f-movie-rating-item': MovieRatingItem
    }
  };
</script>
<style lang="scss" scoped>
  .container {
    padding-top: 45px;
  }
</style>

