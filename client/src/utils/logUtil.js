import { useWatchConfigStore } from '@/stores/watchConfig'

/**
 * 记录日志
 * @param {'log' | 'debug'} type
 * @param {any} args
 */
export function debugLog (type, ...args) {
  const watchConfigStore = useWatchConfigStore()
  if (watchConfigStore.advancedSettingConfig.enableDebugModel) {
    console[type](...args)
  }
}
