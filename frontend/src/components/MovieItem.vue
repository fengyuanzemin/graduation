<template>
  <div class="card" @click.stop.prevent="detail(item)" :key="item._id">
    <img :src="item.imgUrl | imgAttend" :alt="item.title" class="card-img">
    <div class="card-wrapper">
      <div class="card-title">{{item.title}}</div>
      <div class="card-brief">{{item.brief}}</div>
    </div>
  </div>
</template>
<script>
  export default {
    props: ['item'],
    data() {
      return {};
    },
    methods:{
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
    }
    .card-wrapper {
      margin-left: 100px;
      .card-title {
        margin-bottom: 10px;
        @include text-overflow;
        color: #333;
        text-align: center;
      }
      .card-brief {
        @include hidden-line-clamp(6);
        margin-bottom: 10px;
        font-size: 13px;
        color: #666;
        line-height: 1.3;
      }
    }
  }
</style>

