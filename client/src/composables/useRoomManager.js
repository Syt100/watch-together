import { useNotification } from 'naive-ui'
import { debugLog } from '@/utils/logUtil'

export function useRoomManager(config, eventParameters, seedMessage) {
  const notification = useNotification()

  function createRoomId() {
    const x = 100000; const y = 999999
    const roomId = Math.round(Math.random() * (y - x) + x)
    config.roomId = roomId
    return roomId
  }

  function handlePasteVideoUrl() {
    const clipboard = navigator.clipboard
    if (clipboard) {
      clipboard.readText().then(value => {
        debugLog('debug', '剪贴板中的内容：', value)
        config.source = value
      })
    } else {
      notification.warning({
        title: '粘贴失败',
        duration: 5000,
        content: '浏览器不支持粘贴'
      })
    }
  }

  function handleUpdateVideoUrl() {
    debugLog('debug', '更新播放链接')
    eventParameters.type = 'updateUrl'
    eventParameters.updateUrl = config.source
    seedMessage()
  }

  return {
    createRoomId,
    handlePasteVideoUrl,
    handleUpdateVideoUrl
  }
}