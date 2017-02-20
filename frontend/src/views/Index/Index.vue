<template>
  <div class="index">
    <div class="card" v-for="item in cardList" @click="detail">
      <div class="card-header">
        <span class="card-name">{{item.user.name}}</span>
        <span class="card-time">{{item.createdAt | timeFormat('{m}-{d} {h}:{m}')}}</span>
      </div>
      <div class="card-content">{{item.content}}</div>
      <div class="card-footer">
        <div class="card-footer-container">
          <span class="iconfont icon-zhuanfa1"/><span v-if="item.reposts_count" class="card-footer-text">{{item.reposts_count}}</span><span
          class="card-footer-text" v-else>转发</span>
        </div>
        <div class="card-footer-container">
          <span class="iconfont icon-pinglun"/><span v-if="item.comments_count" class="card-footer-text">{{item.comments_count}}</span><span
          class="card-footer-text" v-else>评论</span>
        </div>
        <div class="card-footer-container">
          <span class="iconfont icon-unie60e"/><span v-if="item.attitudes_count" class="card-footer-text">{{item.attitudes_count}}</span><span
          class="card-footer-text" v-else>点赞</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {getList} from 'src/api';
import {getCookie,dateFormat} from 'src/utils';
export default {
  created(){
    getList(this.token).then((res) => {
      console.log(res);
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
  methods: {
    detail() {
      console.log('点击某微博')
    }
  },
  filters: {
    timeFormat(val, option) {
      return dateFormat(val, option);
    }
  }
};
</script>
<style lang="scss" scoped>
  .index {
    padding-top: 45px;
    padding-bottom: 49px;
    background-color: #f2f2f2;
    .card {
      overflow: auto;
      margin: 10px 0;
      box-sizing: border-box;
      background-color: #ffffff;
      .card-header {
        margin: 10px 0;
        padding: 0 15px;
        .card-name {
          font-size: 17px;
          color: #333;
          margin-right: 5px;
        }
        .card-time {
          font-size: 14px;
          color: #666;
          font-weight: 300;
        }
      }
      .card-content {
        overflow: hidden;
        font-size: 15px;
        color: #333;
        margin: 0 15px 10px 15px;
        line-height: 24px;
      }
      .card-footer {
        border-top: 1px solid #dcdcdc;
        display: flex;
        text-align: center;
        .card-footer-container {
          flex: 1;
          padding: 10px;
          border-right: 1px solid #dcdcdc;
          color: #777;
          &:nth-last-child(1) {
            border-right: none;
          }
          .card-footer-text {
            font-size: 14px;
          }
          .iconfont {
            margin-right: 5px;
          }
        }
      }
    }
  }
</style>

