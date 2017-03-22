<template>
  <div class="index">
	  <f-post-item v-for="item in items" :item="item"/>
  </div>
</template>
<script>
import PostItem from 'src/components/PostItem';
import {getHotList} from 'src/api';

export default {
  created() {
    getHotList().then((res) => {
      if(res.data.code === 200) {
        this.items = res.data.cardList;
      } else {
        this.$store.dispatch('show', {
          msg: res.data.message
        });
        setTimeout(() => {
          this.$store.dispatch('close');
        }, 2000);
      }
    }).catch((err)=>{
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
      items: []
    };
  },
  components: {
    'f-post-item': PostItem
  }
};
</script>
<style lang="scss" scoped>
.index {

}
</style>

