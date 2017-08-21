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
    <div class="loading" v-show="loading">
      <span class="loading-text">{{loadingText}}</span>
      <f-fade-spinner size="middle"></f-fade-spinner>
    </div>
  </div>
</template>
<script>
  import MovieRatingItem from 'src/components/MovieRatingItem';
  import FadeSpinner from 'components/FadeSpinner';
  import { movieComment } from 'src/api';

  export default {
    async created() {
      try {
        const res = await movieComment(this.$route.params.movieId, this.$store.state.token);
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
    mounted() {
      document.addEventListener('scroll', this.judgeBottom);
    },
    beforeDestroy() {
      document.removeEventListener('scroll', this.judgeBottom);
    },
    data() {
      return {
        commentItems: [],
        title: '电影',
        page: 0,
        loading: false,
        loadingText: '加载中',
        disabled: false
      };
    },
    methods: {
      judgeBottom() {
        // 滚动高度
        const sHeight = document.documentElement.scrollTop || document.body.scrollTop;
        // window
        const wHeight = document.documentElement.clientHeight;
        // 整个文档高度
        const dHeight = document.documentElement.offsetHeight;
        if (sHeight + wHeight === dHeight) {
          this.loadMore();
        }
      },
      async loadMore() {
        if (this.disabled) {
          return;
        }
        if (this.loading) {
          return;
        }
        this.loadingText = '加载中';
        this.loading = true;

        try {
          const res = await movieComment(this.$route.params.movieId, this.$store.state.token, this.page + 1);
          if (res.data.code === 200) {
            if (res.data.commentList.length !== 0) {
              this.commentItems = this.commentItems.concat(res.data.commentList);
              this.page += 1;
              this.loading = false;
            } else {
              this.loadingText = '没数据了喔';
              this.disabled = true;
              setTimeout(() => {
                this.loading = false;
              }, 2000);
            }
          } else {
            this.loading = false;
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
          this.loading = false;
          this.$store.dispatch('show', {
            msg: '服务器错误啦，请稍后再试'
          });
          setTimeout(() => {
            this.$store.dispatch('close');
          }, 2000);
        }
      },
      back(){
        this.$router.back();
      },
      toIndex(){
        this.$router.push('/?component=f-movie')
      }
    },
    components: {
      'f-movie-rating-item': MovieRatingItem,
      'f-fade-spinner': FadeSpinner
    }
  };
</script>
<style lang="scss" scoped>
  .container {
    padding-top: 45px;
    .loading {
      background-color: #f2f2f2;
      padding: 10px 0 20px 0;
      text-align: center;
      .loading-text {
        color: #666;
        font-size: 14px;
        position: relative;
        top: -5px;
        right: 10px;
      }
    }
  }
</style>

