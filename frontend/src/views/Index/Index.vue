<template>
  <div class="index">
    <div class="card" v-for="item in cardList">
      adsf
    </div>
  </div>
</template>
<script>
import {getList} from 'src/api';
import {getCookie} from 'src/utils';
export default {
  created(){
    getList(this.token).then((res) => {
      console.log(res);
      if (res.data.code === 200) {
        this.cardList = res.data.data.list;
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
  methods: {

  }
};
</script>
<style lang="scss" scoped>
.index {
	margin-top: 45px;
}
</style>

