import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'

function createRoomId() {
  const x = 100000; const y = 999999
  return  Math.round(Math.random() * (y - x) + x)
}

export const useWatchConfigStore = defineStore('watchConfig', () => {
  const config = reactive({
    roomId: createRoomId(),
    /** 是否开启自动同步进度 */
    autoSyncPlayProgress: true,
    /** 自动同步进度的阈值，当进度差异超过此阈值时会触发同步 */
    autoSyncThreshold: 6,
    source: '//player.alicdn.com/video/aliyunmedia.mp4'
  })

  const advancedSettingConfig = reactive({
    /** 是否显示高级设置对话框 */
    show: false,
    /** 是否开启debug模式 */
    enableDebugModel: false
  })

  // 是否显示兼容性警告
  const showCompatibilityAlert = ref(false)
  return { config, advancedSettingConfig, showCompatibilityAlert }
}, {
  persist: true
})
