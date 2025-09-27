import { reactive, onBeforeUnmount } from 'vue'
import { getSocket } from '@/api/socketServer'
import { debugLog } from '@/utils/logUtil'

export function useSocket(config, eventParameters, messageHandler, subtitleHandler) {
  const socket = getSocket()

  const serverStatus = reactive({
    status: 0,
    map: [
      { name: '未连接', type: 'error' },
      { name: '已连接', type: 'success' },
      { name: '重连中', type: 'warning' }
    ]
  })

  socket.on('connect', () => {
    serverStatus.status = 1
  })

  socket.io.on('error', (err) => {
    console.log('连接错误', err)
    serverStatus.status = 2
  })

  socket.on('disconnect', () => {
    serverStatus.status = 0
  })

  socket.on('video-control', (res) => {
    const result = JSON.parse(res)
    debugLog('debug', '接收到消息：', result)
    if (result.uuid !== eventParameters.uuid && result.roomId === config.roomId) {
      messageHandler(result)
    }
  })

  socket.on('sync-subtitle', (res) => {
    const result = res
    debugLog('log', '接收到同步字幕的消息：', result)
    if (result.uuid !== eventParameters.uuid && result.roomId === config.roomId) {
      subtitleHandler(result)
    }
  })

  function seedMessage() {
    const params = {
      roomId: config.roomId,
      ...eventParameters
    }
    socket.emit('video-control', JSON.stringify(params))
  }

  function sendSubtitleSync(subtitleData) {
    const params = {
      roomId: config.roomId,
      ...eventParameters,
      subtitle: subtitleData
    }
    socket.emit('sync-subtitle', params)
  }

  onBeforeUnmount(() => {
    socket.disconnect()
  })

  return {
    socket,
    serverStatus,
    seedMessage,
    sendSubtitleSync
  }
}