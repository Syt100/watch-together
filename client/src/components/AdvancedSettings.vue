<template>
  <n-modal v-model:show="config.show" preset="dialog" title="高级设置">
    <div>
      <n-form class="mt10" :model="config" label-align="left" label-placement="left" label-width="auto">
        <n-form-item label="启用debug模式" path="enableDebugModel">
          <n-switch v-model:value="config.enableDebugModel"/>
        </n-form-item>

        <n-form-item label="缓冲整个视频" feedback="此功能由浏览器实现，某些浏览器可能会完全忽略该属性">
          <n-switch v-model:value="config.enablePreloadAuto"/>
          <div class="ml10">
            <div>开启：播放时会持续缓冲视频；</div>
            <div>关闭：播放时间歇性缓冲。（默认）</div>
          </div>
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
