<template>
  <div class="star" :class="size">
    <span class="iconfont icon-xingxing" v-for="(s, index) in star"
          :class="{active: s === '$'}" @click="rated(index)"
    ></span>
  </div>
</template>
<script>
  const fix = (num) => {
    return Math.round(Number(num) / 2);
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
    .icon-xingxing {
      font-size: 13px;
      color: #999;
      padding-left: 1px;
      &.active {
        color: #ffac2d;
      }
    }
    &.rating {
      .icon-xingxing {
        font-size: 20px;
      }
    }
  }
</style>

