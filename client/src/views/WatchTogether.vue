<template>
  <div class="video-together-container">
    <div class="main">
      <div class="group video">
        <ArtPlayer
          :url="config.source"
          @get-instance="getInstance"
          @play="onVideoPlay"
          @pause="onVideoPause"
          @seeking="onVideoSeeking"
          @seeked="onVideoCompleteSeek"
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
import { reactive } from 'vue'
import ArtPlayer from '@/components/ArtPlayer.vue'
import { uuid } from '@/utils/uuid'
import { useWatchConfigStore } from '@/stores/watchConfig'
import { useNotification } from 'naive-ui'
import { useDark, useEventBus, useObjectUrl, useToggle } from '@vueuse/core'
import { debugLog } from '@/utils/logUtil'
import { useSubtitleConfigStore } from '@/stores/subtitleConfig'
import VersionInfo from '@/components/VersionInfo.vue'

// 导入 composables
import { useSocket } from '@/composables/useSocket'
import { useVideoPlayer } from '@/composables/useVideoPlayer'
import { useVideoSync } from '@/composables/useVideoSync'
import { useRoomManager } from '@/composables/useRoomManager'
import { useMessageManager } from '@/composables/useMessageManager'

const isDark = useDark()
const toggleDark = useToggle(isDark)

const subtitleConfig = useSubtitleConfigStore()
const notification = useNotification()
const watchConfigStore = useWatchConfigStore()
const config = watchConfigStore.config

const eventParameters = reactive({
  type: 'play',
  uuid: uuid(),
  seekTime: null,
  updateUrl: '',
  isSeeking: false
})

// 使用 composables
const { messageList, pushMessage } = useMessageManager()

const {
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
} = useVideoPlayer()

const {
  syncConfig,
  syncProgressTimeComputed,
  handleOtherMessage
} = useVideoSync(config, eventParameters, () => seedMessage(), playerGetCurrentTime, playerSeek, playerStatus, pushMessage)

const {
  createRoomId,
  handlePasteVideoUrl,
  handleUpdateVideoUrl
} = useRoomManager(config, eventParameters, () => seedMessage())

// Socket 相关处理函数
function handleSocketMessage(message) {
  handleOtherMessage(message, playerPlay, playerPause)
}

function handleSubtitleSync(result) {
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

const {
  serverStatus,
  seedMessage,
  sendSubtitleSync
} = useSocket(config, eventParameters, handleSocketMessage, handleSubtitleSync)

// 监听SubtitleSetting组件的同步字幕事件
const bus = useEventBus('updateSubtitle')
bus.on(event => {
  debugLog('log', '发送字幕', event)
  sendSubtitleSync(event)
})

// 重新包装视频事件处理函数以传递必要参数
function onVideoPlay() {
  handleVideoPlay(seedMessage, eventParameters)
}

function onVideoPause() {
  handleVideoPause(seedMessage, eventParameters)
}

function onVideoSeeking() {
  handleVideoSeeking(syncConfig)
}

function onVideoCompleteSeek(time) {
  handleVideoCompleteSeek(time, seedMessage, eventParameters, syncConfig)
}
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
