<template>
  <div class="index">
    <f-post-item v-for="item in cardList" :item="item"/>
  </div>
</template>
<script>
import {getList} from 'src/api';
import {getCookie, dateFormat} from 'src/utils';
import PostItem from 'components/PostItem';
export default {
  created() {
    getList(this.token).then((res) => {
      if (res.data.code === 200) {
        this.cardList = res.data.cardList;
      }
    }).catch((err) => {
      console.log(err);
    });
  },
  data() {
    return {
      cardList: []
    };
  },
  computed:{
    token(){
      return getCookie('f-token');
    }
  },
  components: {
    'f-post-item': PostItem
  }
};

</script>
<style lang="scss" scoped>
  .index {
    background-color: #f2f2f2;
  }
</style>

