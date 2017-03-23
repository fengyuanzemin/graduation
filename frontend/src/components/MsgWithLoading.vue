<template>
  <transition name="fade">
    <div class="loading-container" v-show="show">
      <div class="loading-modal" :class="{big: isBig}">
        <div class="loading-msg">
          <div class="loading-state">{{msg}}</div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import {mapState} from 'vuex';

export default {
  computed: mapState({
    show : state => state.isShow,
    msg : state => state.msg,
    isBig : state => state.isBig
  })
};
</script>
<style lang="scss" scoped>
  $width: 200px;
  $height: 40px;
  .loading-container {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    .loading-modal {
      text-align: center;
      width: $width;
      height: auto;
      box-sizing: border-box;
      padding: 13px 20px;
      opacity: 0.89;
      background-color: #3E3F46;
      border-radius: 20px;
      .loading-msg {
        div {
          color: #ffffff;
          display: inline-block;
        }
        .loading-tips {
          font-size: 14px;
          line-height: 20px;
          display: block;
        }
        .loading-state {
          font-size: 14px;
          line-height: 14px;
        }
      }
      &.big {
        width: 250px;
        border-radius: 10px;
        .loading-msg {
          .loading-state {
            line-height: 20px;
          }
        }
      }
    }
  }
</style>
