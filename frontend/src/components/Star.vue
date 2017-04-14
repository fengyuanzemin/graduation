<template>
  <div class="star" :class="size">
    <span class="iconfont icon-unie61a" v-for="(s,index) in star"
          :class="{active: s === '$'}" @click="rated(index)"
    ></span>
  </div>
</template>
<script>
  const fix = (num) => {
    const half = Number(num) / 2;
    const halfNum = (Math.floor(half) + Math.ceil(half)) / 2;
    return half >= halfNum ? Math.ceil(half) : Math.floor(half);
  };
  export default {
    props: {
      isRate: {
        type: Boolean,
        'default': false
      },
      rating: {
        type: Number,
        'default': 0
      },
      size: {
        type: String,
        'default': ''
      }
    },
    created() {
      if (this.isRate) {
        return;
      }
      const point = fix(this.rating);
      this.star = this.star.map((item, i) => {
        if (i <= point - 1) {
          item = '$';
        }
        return item;
      });
    },
    data() {
      return {
        star: ['*', '*', '*', '*', '*']
      };
    },
    methods: {
      rated(index) {
        if (!this.isRate) {
          return;
        }

        this.$emit('change', (index + 1) * 2);

        this.star = this.star.map((item, i) => {
          if (i <= index) {
            item = '$'
          } else {
            item = '*'
          }
          return item;
        });
      }
    }
  };
</script>
<style lang="scss" scoped>
  .star {
    .icon-unie61a {
      font-size: 13px;
      color: #999;
      &.active {
        color: #ffac2d;
      }
    }
    &.rating {
      .icon-unie61a {
        font-size: 20px;
      }
    }
  }
</style>

