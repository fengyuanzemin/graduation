<template>
  <div class="repost">
    <div v-if="items.length==0">
      <div class="repost-empty">暂无转发</div>
    </div>
  </div>
</template>
<script>
export default {
  props: ['items']
};
</script>
<style lang="scss" scoped>
  .repost {
    .repost-empty {
      color: #999;
      font-size: 20px;
      text-align: center;
      margin-top: 100px;
    }
  }
</style>

