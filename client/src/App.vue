<template>
  <n-config-provider :theme="isDark ? darkTheme : null">
    <n-notification-provider>
      <WatchTogether/>
    </n-notification-provider>
  </n-config-provider>
</template>

<script setup>
import WatchTogether from '@/views/WatchTogether.vue'
import { darkTheme } from 'naive-ui'
import { useDark } from '@vueuse/core'

const isDark = useDark()

</script>

<style scoped>

</style>
