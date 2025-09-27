import { ref } from 'vue'
import { debugLog } from '@/utils/logUtil'

export function useVideoPlayer() {
  const player = ref(null)

  function getInstance(art) {
    player.value = art
  }

  function playerPlay() {
    if (player.value) {
      player.value.play()
    }
  }

  function playerPause() {
    if (player.value) {
      player.value.pause()
    }
  }

  function playerSeek(time) {
    if (player.value) {
      player.value.currentTime = time
    }
  }

  function playerGetCurrentTime() {
    return player.value ? player.value.currentTime : 0
  }

  function playerStatus() {
    return player.value?.playing ? 'playing' : 'paused'
  }

  function handleVideoPlay(seedMessage, eventParameters) {
    debugLog('log', '开始播放')
    eventParameters.type = 'play'
    seedMessage()
  }

  function handleVideoPause(seedMessage, eventParameters) {
    debugLog('log', '暂停播放')
    eventParameters.type = 'pause'
    seedMessage()
  }

  function handleVideoSeeking(syncConfig) {
    syncConfig.isSeeking = true
  }

  function handleVideoCompleteSeek(time, seedMessage, eventParameters, syncConfig) {
    eventParameters.type = 'seek'
    eventParameters.seekTime = time
    debugLog('debug', '跳转播放，时间为', eventParameters.seekTime)
    syncConfig.isSeeking = true

    setTimeout(() => {
      debugLog('debug', 'this.isSeeking = ', syncConfig.isSeeking)
      syncConfig.isSeeking = false
    }, 300)

    seedMessage()
  }

  return {
    player,
    getInstance,
    playerPlay,
    playerPause,
    playerSeek,
    playerGetCurrentTime,
    playerStatus,
    handleVideoPlay,
    handleVideoPause,
    handleVideoSeeking,
    handleVideoCompleteSeek
  }
}