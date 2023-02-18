<template>
  <!-- 此组件用于渲染垂直居中的文本 -->
  <div class="container">
    <span class="text">
      <slot/>
    </span>
  </div>
</template>

<style scoped>
.container {
  height: 100%;
  display: flex;
  justify-content: center;
}

.text {
  align-self: center;
}
</style>
