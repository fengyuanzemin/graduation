<template>
  <div class="card" @click.stop.prevent="detail(item)" :key="item._id">
    <img :src="item.imgUrl | imgAttend" :alt="item.title" class="card-img">
    <div class="card-wrapper">
      <div class="card-title">{{item.title}}</div>
      <div class="card-rating">{{item.rating}}分</div>
      <div class="card-brief">
        <span v-for="d in item.brief">{{d}}</span>
      </div>
    </div>
  </div>
</template>
<script>
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
      .card-rating {
        text-align: center;
        font-size: 14px;
        margin-bottom: 8px;
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

