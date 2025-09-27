import { reactive } from 'vue'
import { uuid } from '@/utils/uuid'

export function useMessageManager() {
  const messageList = reactive([])

  const messageColorList = {
    play: '#43e97b',
    pause: '#fee140',
    seek: '#fa709a',
    sync: '#4facfe'
  }

  function pushMessage(message, type) {
    const m = {
      id: uuid(),
      content: new Date().toTimeString().slice(0, 8) + ' ' + message,
      color: messageColorList[type]
    }
    messageList.unshift(m)
  }

  return {
    messageList,
    pushMessage
  }
}