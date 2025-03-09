<template>
  <div class="video-together-container">
    <div class="main">
      <div class="group video">
        <ArtPlayer
          :url="config.source"
          @get-instance="getInstance"
          @play="handleVideoPlay"
          @pause="handleVideoPause"
          @seeking="handleVideoSeeking"
          @seeked="handleVideoCompleteSeek"
        />
      </div>
      <div class="group panel">
        <div>
          <!-- 兼容性警告 -->
          <n-alert v-if="watchConfigStore.showCompatibilityAlert" class="m-tb10" title="浏览器版本过低警告" type="warning" closable>
            当前浏览器版本过低，部分功能可能无法正常使用，页面显示可能出现异常。
          </n-alert>
          <n-tabs animated default-value="first" >
            <n-tab-pane tab="加入房间" name="first">
              <n-input-group>
                <n-input-number v-model:value="config.roomId" placeholder="输入房间号"/>
                <n-button icon="el-icon-check">确定</n-button>
              </n-input-group>
            </n-tab-pane>
            <n-tab-pane tab="创建房间" name="second">
              <n-button @click="createRoomId">点击创建房间</n-button>
              <span>{{ config.roomId }}</span>
            </n-tab-pane>
          </n-tabs>

          <div>
            <div class="m-tb10">当前播放：</div>
            <n-input-group>
              <n-input v-model:value.lazy="config.source" placeholder="输入视频链接"/>
              <n-button @click="handlePasteVideoUrl">粘贴</n-button>
              <n-divider vertical />
              <n-button icon="el-icon-check" @click="handleUpdateVideoUrl">更新</n-button>
            </n-input-group>
          </div>

          <n-form class="mt10" :model="config" label-align="left" label-placement="left" label-width="auto">
            <n-form-item label="自动同步进度">
              <n-switch v-model:value="config.autoSyncPlayProgress"/>
              <span>{{ syncProgressTimeComputed }}</span>
            </n-form-item>

            <n-form-item label="同步阈值" feedback="进度差距超过阈值时自动将对方进度同步到本机">
              <n-input-number v-model:value="config.autoSyncThreshold">
                <template #suffix>秒</template>
              </n-input-number>
            </n-form-item>

            <n-form-item label="服务器状态">
              <n-tag :type="serverStatus.map[serverStatus.status].type" size="medium">
                {{ serverStatus.map[serverStatus.status].name }}
              </n-tag>
            </n-form-item>

            <n-form-item label="深色模式">
              <n-switch v-model:value="isDark" @update:value="toggleDark" />
            </n-form-item>
          </n-form>

          <n-button class="mb10" @click="watchConfigStore.advancedSettingConfig.show = true">高级设置</n-button>
          <n-button class="mb10 ml10" @click="subtitleConfig.show = true">字幕设置</n-button>

          <n-card hoverable >
            <n-scrollbar style="max-height: 300px;">
              <ul>
                <li v-for="item in messageList" :key="item.id">
                  <span :style="{color: item.color}">{{ item.content }}</span>
                </li>
              </ul>
            </n-scrollbar>
          </n-card>
        </div>
      </div>
    </div>
    <VersionInfo/>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive } from 'vue'
import ArtPlayer from '@/components/ArtPlayer.vue'
import { getSocket } from '@/api/socketServer'
import { uuid } from '@/utils/uuid'
import { useWatchConfigStore } from '@/stores/watchConfig'
import { useNotification } from 'naive-ui'
import { useDark, useEventBus, useObjectUrl, useToggle } from '@vueuse/core'
import { debugLog } from '@/utils/logUtil'
import { useSubtitleConfigStore } from '@/stores/subtitleConfig'
import VersionInfo from '@/components/VersionInfo.vue'

const isDark = useDark()
const toggleDark = useToggle(isDark)

const subtitleConfig = useSubtitleConfigStore()

const notification = useNotification()

// socket 部分
const socket = getSocket()
// 此事件由 Socket 实例在连接和重新连接时触发
socket.on('connect', () => {
  serverStatus.status = 1
})
// 在连接错误时触发
socket.io.on('error', (err) => {
  console.log('连接错误', err) // false
  serverStatus.status = 2
})
// 在断开连接时触发
socket.on('disconnect', () => {
  serverStatus.status = 0
})
socket.on('video-control', (res) => {
  const result = JSON.parse(res)
  debugLog('debug', '接收到消息：', result)
  if (result.uuid !== eventParameters.uuid && result.roomId === config.roomId) {
    handleOtherMessage(result)
  }
})

let player = null
const watchConfigStore = useWatchConfigStore()
const config = watchConfigStore.config

function createRoomId() {
  const x = 100000; const y = 999999
  return  Math.round(Math.random() * (y - x) + x)
}

// 发送自动同步消息的定时器
let autoSyncPlayProgressTimer = setInterval(handleAutoSyncPlayProgress, 1000 * 2)
// 页面卸载前清除定时器
onBeforeUnmount(() => {
  clearInterval(autoSyncPlayProgressTimer)
  autoSyncPlayProgressTimer = null
})

const syncConfig = reactive({
  syncProgressTime: 0, // 本机与对方的进度差值
  isSeeking: false, // 是否处于调节进度状态，避免与自动同步进度冲突
})

// 进度字符串
const syncProgressTimeComputed = computed(() => {
  const s = syncConfig.syncProgressTime > 0 ? '快' : '慢'
  // 此处使用反引号 ` 实现模板字符串
  return `进度比对方${s}了` + Math.abs(syncConfig.syncProgressTime).toFixed(2) + '秒'
})

const eventParameters = reactive({
  type: 'play',
  uuid: uuid(),
  seekTime: null,
  updateUrl: '',
  isSeeking: false
})

const messageList = reactive([])

const messageColorList = {
  play: '#43e97b',
  pause: '#fee140',
  seek: '#fa709a',
  sync: '#4facfe'
}

const serverStatus = reactive({
  status: 0,
  map: [
    { name: '未连接', type: 'error' },
    { name: '已连接', type: 'success' },
    { name: '重连中', type: 'warning' }
  ]
})

function getInstance (art) {
  // 初始化播放器实例
  player = art
}

function handleVideoPlay () {
  debugLog('log', '开始播放')
  eventParameters.type = 'play'
  seedMessage()
}

function handleVideoPause () {
  debugLog('log', '暂停播放')
  eventParameters.type = 'pause'
  seedMessage()
}
function handleVideoSeeking () {
  syncConfig.isSeeking = true
}
function handleVideoCompleteSeek (time) {
  eventParameters.type = 'seek'
  eventParameters.seekTime = time
  debugLog('debug', '跳转播放，时间为', eventParameters.seekTime)
  syncConfig.isSeeking = true
  // 设置延时，防止点击进度条时自动同步进度
  setTimeout(() => {
    debugLog('debug', 'this.isSeeking = ', syncConfig.isSeeking)
    syncConfig.isSeeking = false
  }, 300)
  seedMessage()
}
function handleAutoSyncPlayProgress () {
  debugLog('debug', '自动同步进度。当前播放器状态', playerStatus())
  eventParameters.type = 'syncProcess'
  eventParameters.seekTime = playerGetCurrentTime()
  eventParameters.isSeeking = syncConfig.isSeeking
  seedMessage()
}

// 点击粘贴按钮
function handlePasteVideoUrl () {
  const clipboard = navigator.clipboard
  if (clipboard) {
    clipboard.readText().then(value => {
      debugLog('debug', '剪贴板中的内容：', value)
      config.source = value
    })
  } else {
    notification.warning({
      title: '粘贴失败',
      // 持续5秒后自动关闭
      duration: 5000,
      content: '浏览器不支持粘贴'
    })
  }
}

function handleUpdateVideoUrl () {
  debugLog('debug', '更新播放链接')
  eventParameters.type = 'updateUrl'
  eventParameters.updateUrl = config.source
  seedMessage()
}

function handleOtherMessage(message) {
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
      // 只有当自己和对方都没有调节进度条时才同步
      // 同步条件：开启自动同步，进度差异大于指定值，自己和对方都没有调节播放进度，自己播放器处于播放状态
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
function playerPlay() {
  player.play()
}

function playerPause() {
  player.pause()
}

function playerSeek(time) {
  player.currentTime = time
}
function playerGetCurrentTime() {
  return player.currentTime
}

function playerStatus() {
  return player.playing ? 'playing' : 'paused'
}

function pushMessage(message, type) {
  const m = {
    id: uuid(),
    content: new Date().toTimeString().slice(0, 8) + ' ' + message,
    color: messageColorList[type]
  }
  messageList.unshift(m)
}

function seedMessage() {
  const params = {
    roomId: config.roomId,
    ...eventParameters
  }
  socket.emit('video-control', JSON.stringify(params))
}

// 监听SubtitleSetting组件的同步字幕事件
const bus = useEventBus('updateSubtitle')
bus.on(event => {
  debugLog('log', '发送字幕', event)
  const params = {
    roomId: config.roomId,
    ...eventParameters,
    subtitle: event
  }
  socket.emit('sync-subtitle', params)
})

// 监听对方的同步字幕事件
socket.on('sync-subtitle', (res) => {
  const result = res
  debugLog('log', '接收到同步字幕的消息：', result)
  if (result.uuid !== eventParameters.uuid && result.roomId === config.roomId) {
    /** @type SyncSubtitle */
    const subtitleData = result.subtitle

    if (subtitleData.type === 'url') {
      subtitleConfig.subtitleUrl = subtitleData.url

      notification.success({
        title: '字幕URL同步成功',
        duration: 5000
      })
      pushMessage('字幕URL同步成功', 'sync')
    } else if (subtitleData.type === 'file') {
      const file = new File([subtitleData.file], subtitleData.fileName)
      subtitleConfig.subtitleUrl = useObjectUrl(file).value
      subtitleConfig.subtitleType = subtitleData.subtitleType

      notification.success({
        title: '字幕文件同步成功',
        duration: 5000
      })
      pushMessage('字幕文件同步成功', 'sync')
    }
  }
})
</script>

<style scoped>
.video-together-container {
  margin: 10px;
}

.main {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  margin: auto;
}

.group {
  width: 100%;
}

@media only screen and (min-width: 769px) {
  .main {
    max-width: 90%;
  }
  .video {
    max-width: 60%;
  }
  .panel {
    max-width: 35%;
  }
}

span {
  margin-left: 10px;
}
</style>
