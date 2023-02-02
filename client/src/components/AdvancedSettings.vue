<template>
  <n-modal v-model:show="config.show" preset="dialog" title="高级设置">
    <div>
      <n-form class="mt10" :model="config" label-align="left" label-placement="left" label-width="auto">
        <n-form-item label="启用debug模式" path="enableDebugModel">
          <n-switch v-model:value="config.enableDebugModel"/>
        </n-form-item>
      </n-form>
    </div>
    <template #action>
      <n-button @click="config.show = false">关闭</n-button>
    </template>
  </n-modal>
</template>

<script setup>
import { useWatchConfigStore } from '@/stores/watchConfig'

const watchConfig = useWatchConfigStore()
const config = watchConfig.advancedSettingConfig

</script>

<style scoped>

</style>
