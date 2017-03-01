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
    getHotList().then((res)=>{
      console.log(res)
      if(res.data.code ===200) {
        this.items = res.data.cardList;
      }
    }).catch((err)=>{
      console.log(err)
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

