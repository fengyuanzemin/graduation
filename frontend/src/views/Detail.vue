<template>
  <div class="container">
    <header>
      <span class="header-left iconfont icon-houtui"/>
      <span class="clickBoard clickBoard-left" @click="back"/>
      <div class="header-title">正文</div>
    </header>
    <f-post-item :item="item"/>
  </div>
</template>
<script>
import {getPostItem} from 'src/api';
import PostItem from 'components/PostItem';
export default {
  created() {
    getPostItem(this.$route.params.postId).then((res) => {
      if(res.data.code === 200) {
          this.item = res.data.detail;
      }
    }).catch((err) => {
      console.log(err)
    });
  },
  data() {
    return {
      item: null
    };
  },
  methods: {
    back() {
      this.$router.back();
    }
  },
  components: {
    'f-post-item': PostItem
  }
};
</script>
<style lang="scss" scoped>
  .container {
    padding-top: 45px;
  }
</style>

