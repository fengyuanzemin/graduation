<template>
  <div class="card" @click.stop.prevent="detail(item)" :key="item._id">
    <img :src="item.imgUrl | imgAttend" :alt="item.title" class="card-img">
    <div class="card-wrapper">
      <div class="card-title">{{item.title}}</div>
      <div class="card-rating-container">
        <f-star :rating="item.rating"></f-star>
        <span class="card-rating">{{item.rating}}分</span>
      </div>
      <div class="card-brief">
        <span v-for="d in item.brief">{{d}}</span>
      </div>
    </div>
  </div>
</template>
<script>
  import Star from 'src/components/Star';

  export default {
    props: ['item'],
    data() {
      return {};
    },
    methods: {
      detail(item) {
        if (/^\/un-login/.test(this.$route.path)) {
          this.$router.push('/login');
          return;
        }
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
    padding: 15px 15px 0 15px;
    position: relative;
    border-bottom: 5px solid #f2f2f2;
    .card-img {
      position: absolute;
      width: 80px;
      top: 19px;
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

