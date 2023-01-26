import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'

function createRoomId() {
  const x = 100000; const y = 999999
  return  Math.round(Math.random() * (y - x) + x)
}

export const useWatchConfigStore = defineStore('watchConfig', () => {
  const config = reactive({
    roomId: createRoomId(),
    autoSyncPlayProgress: true,
    source: '//player.alicdn.com/video/aliyunmedia.mp4'
  })
  // 是否显示兼容性警告
  const showCompatibilityAlert = ref(false)
  return { config, showCompatibilityAlert }
}, {
  persist: true
})
