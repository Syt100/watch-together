<template>
  <n-config-provider :theme="isDark ? darkTheme : null">
    <n-notification-provider>
      <WatchTogether/>
      <AdvancedSettings/>
    </n-notification-provider>
  </n-config-provider>
</template>

<script setup>
import WatchTogether from '@/views/WatchTogether.vue'
import { darkTheme } from 'naive-ui'
import { useDark } from '@vueuse/core'
import { defineAsyncComponent } from 'vue'
// 异步加载组件
const AdvancedSettings = defineAsyncComponent(() => import('@/components/AdvancedSettings.vue'))

const isDark = useDark()

</script>

<style scoped>

</style>
