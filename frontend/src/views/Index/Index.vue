<template>
  <div class="index">
    <f-post-item v-for="item in cardList" :item="item"/>
  </div>
</template>
<script>
import {getList} from 'src/api';
import PostItem from 'components/PostItem';

export default {
  created() {
    getList(this.token).then((res) => {
      if (res.data.code === 200) {
        this.cardList = res.data.cardList;
      } else {
        this.$store.dispatch('show', {
          msg: res.data.message
  	    });
  	    setTimeout(() => {
          this.$store.dispatch('close');
          if(res.data.code === 5002) {
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
      cardList: [],
      token: localStorage.getItem('f-token')
    };
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

