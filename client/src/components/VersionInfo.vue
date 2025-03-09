<script setup>
import { ref } from 'vue'

const buildInfo = ref({})

fetch('/build-info.json')
  .then(r => r.json())
  .then(data => buildInfo.value = data)
</script>

<template>
  <div class="version-info">
    <div>Version: {{ buildInfo.tag || 'dev' }}</div>
    <div>Build Time: {{ buildInfo.buildTime }}</div>
  </div>
</template>

<style scoped>
.version-info {
  padding: 12px 16px;
  font-size: 12px;
  text-align: center;
}

.version-info div {
  line-height: 1.4;
  margin: 2px 0;
}
</style>