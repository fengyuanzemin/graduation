<template>
  <div class="container">
    <header>
      <span class="header-left iconfont icon-houtui"></span>
      <span class="clickBoard clickBoard-left" @click="back"></span>
      <div class="header-title">正文</div>
      <span class="header-right">回首页</span>
      <span class="clickBoard clickBoard-right clickBoard-right-big" @click="toIndex"></span>
    </header>
    <div class="card" v-if="item">
      <div class="card-title">{{item.title}}</div>
      <div class="card-container">
        <img class="card-img" :src="item.imgUrl | imgAttend" :alt="item.title">
        <div class="card-detail">
          <div class="card-directors">
            <span class="card-detail-title">导演：</span><span class="card-detail-item"
                                                            v-for="d in item.directors">{{d}}</span>
          </div>
          <div class="card-actors">
            <span class="card-detail-title">演员：</span><span class="card-detail-item"
                                                            v-for="a in item.actors">{{a}}</span>
          </div>
          <div class="card-tags">
            <span class="card-detail-title">标签：</span><span class="card-detail-item" v-for="t in item.tags">{{t}}</span>
          </div>
        </div>
      </div>
      <div class="card-rating">
        <f-star :rating="rating"></f-star>
        <span class="card-rating-point">{{rating | toFixed}}分</span>
        <div class="card-rating-count"><span class="card-rating-num">{{item.comments_count}}</span> 人评价</div>
      </div>
      <div class="card-brief-container">
        <div class="card-brief" :class="{'card-brief-long': briefMore}" v-html="item.brief">
        </div>
        <span class="card-brief-more" @click="more" ref="more">{{briefText}}</span>
      </div>
      <div class="card-footer">
        <div class="card-footer-container" @click.stop.prevent="update">
          <span class="card-footer-text">影评 {{item.comments_count}}</span>
        </div>
      </div>
    </div>
    <f-movie-rating-item :items="commentItems"></f-movie-rating-item>
    <footer>
      <div class="footer-container" @click.stop.prevent="comment">
        <span class="iconfont icon-xieyingping"></span><span class="footer-text">评价</span>
      </div>
    </footer>
  </div>
</template>
<script>
  import MovieRatingItem from 'src/components/MovieRatingItem';
  import Star from 'src/components/Star';
  import {movieDetail, movieComment} from 'src/api';

  export default {
    created() {
      // 拉取主要信息
      movieDetail(this.$route.params.movieId, this.token).then((res) => {
        if (res.data.code === 200) {
          this.item = res.data.movie;
          this.item.brief = this.item.brief.join('<br>');
          this.rating = this.item.rating;
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
      // 拉取影评
      movieComment(this.$route.params.movieId, this.token).then((res) => {
        if (res.data.code === 200) {
          this.commentItems = res.data.commentList;
        } else {
          this.$store.dispatch('show', {
            msg: res.data.message
          });
          setTimeout(() => {
            this.$store.dispatch('close');
            if (res.data.code === 5002) {
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
        item: null,
        commentItems: [],
        token: localStorage.getItem('f-token'),
        briefMore: false,
        briefText: '更多',
        rating: 0
      };
    },
    watch: {
      '$route'() {
        // 拉取主要信息
        movieDetail(this.$route.params.movieId, this.token).then((res) => {
          if (res.data.code === 200) {
            this.item = res.data.movie;
          } else {
            this.$store.dispatch('show', {
              msg: res.data.message
            });
            setTimeout(() => {
              this.$store.dispatch('close');
              if (res.data.code === 5002) {
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
        // 拉取影评
        movieComment(this.$route.params.movieId, this.token).then((res) => {
          if (res.data.code === 200) {
            this.commentItems = res.data.commentList;
          } else {
            this.$store.dispatch('show', {
              msg: res.data.message
            });
            setTimeout(() => {
              this.$store.dispatch('close');
              if (res.data.code === 5002) {
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
    },
    methods: {
      back() {
        this.$router.back();
      },
      toIndex() {
        this.$router.push('/');
      },
      update() {

      },
      comment() {
        this.$router.push({name: 'movieComment', params: {movieId: this.$route.params.movieId}});
      },
      more() {
        this.briefText = this.briefMore ? '更多' : '收起';
        this.briefMore = !this.briefMore;
      }
    },
    components: {
      'f-movie-rating-item': MovieRatingItem,
      'f-star': Star
    }
  };
</script>
<style lang="scss" scoped>
  @import '../assets/css/mixin';

  .container {
    padding-top: 45px;
    padding-bottom: 55px;
    .card {
      overflow: auto;
      box-sizing: border-box;
      background-color: #ffffff;
      border-bottom: 10px solid #f2f2f2;
      padding: 15px 15px 0 15px;
      position: relative;
      .card-title {
        font-size: 17px;
        color: #333;
        text-align: center;
        margin: 0 0 10px 0;
      }
      .card-container {
        margin-right: 75px;
        position: relative;
        height: 134px;
        .card-detail {
          margin-left: 100px;
          font-size: 12px;
          line-height: 20px;
          overflow: auto;
          .card-directors,
          .card-actors,
          .card-tags {
            @include hidden-line-clamp(4);
            .card-detail-title {
              font-size: 13px;
            }
            .card-detail-item {
              font-weight: 300;
              &:after {
                content: '/';
                margin: 0 3px;
              }
              &:last-child:after {
                content: none;
              }
            }
          }
          .card-directors {
            margin-top: 5px;
          }
        }
        .card-img {
          width: 87px;
          position: absolute;
        }

      }
      .card-rating {
        position: absolute;
        top: 75px;
        right: 9px;
        font-size: 14px;
        text-align: center;
        .star {
          margin-bottom: 10px;
        }
        .card-rating-count {
          font-size: 12px;
          .card-rating-num {
            color: #1478f0;
          }
          margin-top: 10px;
          display: block;
        }
      }
      .card-brief-container {
        position: relative;
        padding-bottom: 20px;
        font-size: 14px;
        line-height: 24px;
        .card-brief {
          color: #333;
          margin: 10px 0;
          @include hidden-line-clamp(10);
          &.card-brief-long {
            overflow: auto;
            display: block;
          }
        }
        .card-brief-more {
          cursor: pointer;
          color: #1478f0;
          position: absolute;
          padding: 10px;
          bottom: -5px;
          right: -2px;
        }
      }
      .card-footer {
        border-top: 1px solid #dcdcdc;
        display: flex;
        text-align: center;
        .card-footer-container {
          flex: 1;
          padding: 10px;
          color: #777;
          .card-footer-text {
            font-size: 14px;
          }
          .iconfont {
            margin-right: 5px;
          }
        }
      }
    }
    footer {
      border-top: 1px solid #dcdcdc;
      display: flex;
      text-align: center;
      position: fixed;
      bottom: 0;
      width: 100%;
      .footer-container {
        flex: 1;
        padding: 10px;
        color: #777;
        background: #fff;
        .footer-text {
          font-size: 14px;
        }
        .iconfont.icon-xieyingping {
          margin-right: 5px;
          position: relative;
          top: 2px;
        }
      }
    }
  }
</style>

