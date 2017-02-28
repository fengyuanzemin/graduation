<template>
  <div class="container">
    <header>
      <span class="iconfont icon-houtui header-left" />
      <span class="clickBoard clickBoard-left" @click="back"/>
      <div class="header-title">{{name}}</div>
    </header>
    <f-post-item v-for="item in items" :item="item"/>
  </div>
</template>
<script>
import PostItem from 'src/components/PostItem';
import {getUserList} from 'src/api';

export default {
  created() {
    getUserList(this.$route.params.userId).then((res)=>{
      console.log(res)
      if(res.data.code === 200) {
        this.name = res.data.items[0].user.name;
        this.items = res.data.items;
      }
    }).catch((err)=>{
      console.log(err);
    })
  },
  data() {
    return {
      name: null,
      items: []
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
  margin-top: 45px;
}
</style>

