<template>
  <div class="spinner-fading-circle" :class="size">
    <div v-for="n in 12" :class="['is-circle' + (n + 1)]" class="spinner-fading-circle-circle"></div>
  </div>
</template>
<style lang="scss" scoped>
  .spinner-fading-circle {
    position: relative;
    top: 1px;
    width: 15px;
    height: 15px;
    display: inline-block;
  }

  .spinner-fading-circle.middle {
    width: 25px;
    height: 25px;
    .spinner-fading-circle-circle:before {
      background-color: #666;
    }
  }

  .spinner-fading-circle.big {
    width: 40px;
    height: 40px;
    .spinner-fading-circle-circle:before {
      background-color: #1478f0;
    }
  }

  .spinner-fading-circle-circle {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    position: absolute;
  }

  .spinner-fading-circle-circle:before {
    background-color: #ffffff;
    content: " ";
    display: block;
    margin: 0 auto;
    width: 15%;
    height: 15%;
    border-radius: 100%;
    animation: mint-fading-circle 1.2s infinite ease-in-out both;
  }

  .spinner-fading-circle-circle.is-circle2 {
    transform: rotate(30deg);
  }

  .spinner-fading-circle-circle.is-circle2:before {
    animation-delay: -1.1s;
  }

  .spinner-fading-circle-circle.is-circle3 {
    transform: rotate(60deg);
  }

  .spinner-fading-circle-circle.is-circle3:before {
    animation-delay: -1s;
  }

  .spinner-fading-circle-circle.is-circle4 {
    transform: rotate(90deg);
  }

  .spinner-fading-circle-circle.is-circle4:before {
    animation-delay: -.9s;
  }

  .spinner-fading-circle-circle.is-circle5 {
    transform: rotate(120deg);
  }

  .spinner-fading-circle-circle.is-circle5:before {
    animation-delay: -.8s;
  }

  .spinner-fading-circle-circle.is-circle6 {
    transform: rotate(150deg);
  }

  .spinner-fading-circle-circle.is-circle6:before {
    animation-delay: -.7s;
  }

  .spinner-fading-circle-circle.is-circle7 {
    transform: rotate(180deg);
  }

  .spinner-fading-circle-circle.is-circle7:before {
    animation-delay: -.6s;
  }

  .spinner-fading-circle-circle.is-circle8 {
    transform: rotate(210deg);
  }

  .spinner-fading-circle-circle.is-circle8:before {
    animation-delay: -.5s;
  }

  .spinner-fading-circle-circle.is-circle9 {
    transform: rotate(240deg);
  }

  .spinner-fading-circle-circle.is-circle9:before {
    animation-delay: -.4s;
  }

  .spinner-fading-circle-circle.is-circle10 {
    transform: rotate(270deg);
  }

  .spinner-fading-circle-circle.is-circle10:before {
    animation-delay: -.3s;
  }

  .spinner-fading-circle-circle.is-circle11 {
    transform: rotate(300deg);
  }

  .spinner-fading-circle-circle.is-circle11:before {
    animation-delay: -.2s;
  }

  .spinner-fading-circle-circle.is-circle12 {
    transform: rotate(330deg);
  }

  .spinner-fading-circle-circle.is-circle12:before {
    animation-delay: -.1s;
  }

  @keyframes mint-fading-circle {
    0%,
    39%,
    to {
      opacity: 0
    }
    40% {
      opacity: 1
    }
  }
</style>
<script>
export default {
  name: 'fade-spinner',
  // 传下来一个尺寸的值
  props: ['size']
};

</script>
