<template>
  <div class="card" @click.stop.prevent="detail(item.movie)" v-if="item.action">
    <div class="card-attitude" v-if="item.recommend">你和{{item.user.name}}都对它感兴趣</div>
    <img :src="item.movie.imgUrl | imgAttend" :alt="item.movie.title" class="card-img card-img-attitude">
    <div class="card-wrapper">
      <div class="card-title">{{item.movie.title}}</div>
      <div class="card-rating-container">
        <f-star :rating="item.movie.rating"></f-star>
        <span class="card-rating">{{item.movie.rating | toFixed}}分</span>
      </div>
      <div class="card-brief">
        <span v-for="d in item.movie.brief">{{d}}</span>
      </div>
    </div>
  </div>
  <div class="card" @click.stop.prevent="detail(item)" :key="item._id" v-else>
    <img :src="item.imgUrl | imgAttend" :alt="item.title" class="card-img">
    <div class="card-wrapper">
      <div class="card-title">{{item.title}}</div>
      <div class="card-rating-container">
        <f-star :rating="item.rating"></f-star>
        <span class="card-rating">{{item.rating | toFixed}}分</span>
      </div>
      <div class="card-brief">
        <span v-for="d in item.brief">{{d}}</span>
      </div>
    </div>
  </div>
</template>
<script>
  import Star from 'src/components/Star';
  import {clickIn} from 'src/api';

  export default {
    props: ['item'],
    methods: {
      detail(item) {
        if (/^\/un-login/.test(this.$route.path)) {
          this.$router.push('/login');
          return;
        }
        clickIn(item._id, this.$store.state.token, 'movie');
        this.$router.push({name: 'movie', params: {movieId: item._id}});
      }
    },
    components: {
      'f-star': Star
    }
  };
</script>
<style lang="scss" scoped>
  @import '../assets/css/mixin';

  .card {
    padding: 10px 15px 0 15px;
    position: relative;
    border-bottom: 5px solid #f2f2f2;
    .card-attitude {
      padding: 0 0 8px;
      margin-bottom: 8px;
      color: #1478f0;
      font-weight: 300;
      font-size: 13px;
      border-bottom: 1px solid #dcdcdc;
    }
    .card-img {
      position: absolute;
      width: 80px;
      top: 19px;
      &.card-img-attitude {
        top: 50px;
      }
    }
    .card-wrapper {
      margin-left: 100px;
      .card-title {
        margin-bottom: 10px;
        @include text-overflow;
        color: #333;
        text-align: center;
      }
      .card-rating-container {
        margin-bottom: 8px;
        text-align: center;
        .star {
          display: inline-block;
          margin-right: 8px;
        }
        .card-rating {
          text-align: center;
          font-size: 13px;
          line-height: 13px;
          position: relative;
          top: 1px;
        }
      }
      .card-brief {
        @include hidden-line-clamp(5);
        margin-bottom: 10px;
        font-size: 13px;
        color: #666;
        line-height: 1.3;
      }
    }
  }
</style>

