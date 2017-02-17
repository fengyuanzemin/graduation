<template>
  <transition name="fade">
    <div class="loading-container" v-show="isShow">
      <div class="loading-modal" :class="{big: isBig}">
        <div class="loading-msg" v-if="isTip">
          <div class="loading-tips">{{firstline}}</div>
          <div class="loading-tips">{{secondline}}</div>
        </div>
        <div class="loading-msg" v-else>
          <div class="loading-state">{{msg}}</div>
          <ws-fade-spinner v-show="isLoading"></ws-fade-spinner>
        </div>
      </div>
    </div>
  </transition>
</template>
<style lang="scss" scoped>
  $width: 200px;
  $height: 40px;
  .loading-container {
    width: 100%;
    height: 100%;
    position: absolute;
    top:0;
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
<script>
import FadeSpinner from 'components/FadeSpinner';

export default {
  props: {
    isShow: {
      default: false
    },
    // 一行文字时，使用的文字
    msg: {
      type: String
    },
    isLoading: {
      type: Boolean
    },
    // 宽度大一号
    isBig: {
      default: false
    },
    // 使用两行文字
    isTip: {
      default: false
    },
    // 因为有两行的文字，使用v-html后不能动态改变，所以特地用两行来展示
    firstline: {
      type: String
    },
    secondline: {
      type: String
    }
  },
  components: {
    'ws-fade-spinner': FadeSpinner
  }
};
</script>
