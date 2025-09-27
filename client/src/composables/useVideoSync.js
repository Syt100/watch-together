import { reactive, computed, onBeforeUnmount } from 'vue'
import { debugLog } from '@/utils/logUtil'

export function useVideoSync(config, eventParameters, seedMessage, playerGetCurrentTime, playerSeek, playerStatus, pushMessage) {
  const syncConfig = reactive({
    syncProgressTime: 0,
    isSeeking: false
  })

  const syncProgressTimeComputed = computed(() => {
    const s = syncConfig.syncProgressTime > 0 ? '快' : '慢'
    return `进度比对方${s}了` + Math.abs(syncConfig.syncProgressTime).toFixed(2) + '秒'
  })

  function handleAutoSyncPlayProgress() {
    debugLog('debug', '自动同步进度。当前播放器状态', playerStatus())
    eventParameters.type = 'syncProcess'
    eventParameters.seekTime = playerGetCurrentTime()
    eventParameters.isSeeking = syncConfig.isSeeking
    seedMessage()
  }

  function handleOtherMessage(message, playerPlay, playerPause) {
    switch (message.type) {
      case 'play':
        debugLog('debug', '收到开始播放的消息：', message)
        playerPlay()
        pushMessage('对方开始播放', 'play')
        break
      case 'pause':
        debugLog('debug', '收到暂停播放的消息', message)
        playerPause()
        pushMessage('对方暂停播放', 'pause')
        break
      case 'seek': {
        debugLog('debug', '收到调节播放进度的消息', message)
        const difference = Math.abs(playerGetCurrentTime() - message.seekTime)
        if (difference > 2) {
          playerSeek(message.seekTime)
          pushMessage('对方调节了播放进度', 'seek')
        }
        break
      }
      case 'syncProcess': {
        debugLog('debug', '收到同步播放进度的消息', message)
        const difference = Math.abs(playerGetCurrentTime() - message.seekTime)
        debugLog('debug', '本机进度与远程进度的差距为', difference)
        syncConfig.syncProgressTime = playerGetCurrentTime() - message.seekTime

        const isSync = config.autoSyncPlayProgress && difference > config.autoSyncThreshold
          && !syncConfig.isSeeking && !message.isSeeking && playerStatus() === 'playing'
        if (isSync) {
          playerSeek(message.seekTime)
          pushMessage('播放进度已同步', 'sync')
        }
        break
      }
      case 'updateUrl':
        debugLog('debug', '收到更新播放url的消息', message)
        config.source = message.updateUrl
    }
  }

  let autoSyncPlayProgressTimer = setInterval(handleAutoSyncPlayProgress, 1000 * 2)

  onBeforeUnmount(() => {
    clearInterval(autoSyncPlayProgressTimer)
    autoSyncPlayProgressTimer = null
  })

  return {
    syncConfig,
    syncProgressTimeComputed,
    handleAutoSyncPlayProgress,
    handleOtherMessage
  }
}