import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSubtitleConfigStore = defineStore('subtitleConfig', () => {
  const show = ref(false)
  // 字幕URL
  const subtitleUrl = ref('')
  // 字幕类型
  const subtitleType = ref('ass')

  return { show, subtitleUrl, subtitleType }
})
