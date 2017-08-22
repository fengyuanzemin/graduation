<template>
  <div class="movie">
    <f-movie-item v-for="(item, index) in items" :key="index" :item="item"></f-movie-item>
    <div class="loading" v-show="loading">
      <span class="loading-text">{{loadingText}}</span>
      <f-fade-spinner size="middle"></f-fade-spinner>
    </div>
  </div>
</template>
<script>
  import { movieList } from 'src/api';
  import MovieItem from 'components/MovieItem';
  import FadeSpinner from 'components/FadeSpinner';

  export default {
    async created() {
      try {
        const res = await movieList(this.token);
        if (res.data.code === 200) {
          this.items = res.data.cardList;
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
        items: [],
        token: localStorage.getItem('f-token'),
        page: 0,
        loading: false,
        loadingText: '加载中',
        disabled: false
      };
    },
    activated() {
      document.addEventListener('scroll', this.judgeBottom);
    },
    deactivated() {
      document.removeEventListener('scroll', this.judgeBottom);
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
          const res = await movieList(this.token, this.page + 1);
          if (res.data.code === 200) {
            if (res.data.cardList.length !== 0) {
              this.items = this.items.concat(res.data.cardList);
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
          console.log(error);
          this.loading = false;
          this.$store.dispatch('show', {
            msg: '服务器错误啦，请稍后再试'
          });
          setTimeout(() => {
            this.$store.dispatch('close');
          }, 2000);
        }
      }
    },
    components: {
      'f-movie-item': MovieItem,
      'f-fade-spinner': FadeSpinner
    }
  };
</script>
<style lang="scss" scoped>
  .movie {
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

