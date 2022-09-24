<template>
  <div class="video-together-container">
    <div class="main">
      <div class="group video">
        <VueAliplayerV2
          v-show="false"
          ref="VueAliplayerV2"
          :source="config.source"
          @ready="handleVideoReady"
          @play="handleVideoPlay"
          @pause="handleVideoPause"
          @completeSeek="handleVideoCompleteSeek"
        />
        <XGPlayer
          ref="xgPlayer"
          :url="config.source"
          @play="handleVideoPlay"
          @pause="handleVideoPause"
          @seeked="handleVideoCompleteSeek"
        />
      </div>
      <div class="group panel">
        <div>
          <el-tabs value="first">
            <el-tab-pane label="创建房间" name="first">
              <el-button @click="createRoomId">点击创建房间</el-button>
              <span>{{ config.roomId }}</span>
            </el-tab-pane>
            <el-tab-pane label="加入房间" name="second">
              <el-input v-model.number="config.roomId" type="number" placeholder="输入房间号">
                <el-button slot="append" icon="el-icon-check">确定</el-button>
              </el-input>
            </el-tab-pane>
          </el-tabs>
          <div>
            <span>当前播放：</span>
            <el-input v-model.lazy="config.source" placeholder="输入视频链接">
              <el-button slot="append" icon="el-icon-check" @click="handleUpdateVideoUrl">更新</el-button>
            </el-input>
          </div>
          <el-form :model="config">
            <el-form-item label="自动同步进度">
              <el-switch v-model="config.autoSyncPlayProgress" />
              <span>{{ syncProgressTimeComputed }}</span>
            </el-form-item>
          </el-form>
          <el-divider></el-divider>
          <el-card shadow="hover" style="max-height: 300px;overflow-y: auto">
            <ul>
              <li v-for="item in messageList" :key="item.id">
                <span :style="{color: item.color}">{{ item.content }}</span>
              </li>
            </ul>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import XGPlayer from '@/components/XGPlayer'
import { getSocket } from '@/api/socketServer'
import { uuid } from '@/utils/uuid'
import moment from 'moment'

export default {
  name: 'WatchTogether',
  components: {
    XGPlayer
  },
  data () {
    return {
      socket: null,
      player: null,
      xgPlayer: null,
      currentPlayerName: 'xgPlayer',
      currentPlayer: null,
      config: {
        roomId: 123,
        autoSyncPlayProgress: true,
        source: '//player.alicdn.com/video/aliyunmedia.mp4'
      },
      autoSyncPlayProgressTimer: null,
      syncProgressTime: 0, // 本机与对方的进度差值
      eventParameters: {
        type: 'play',
        uuid: undefined,
        seekTime: null,
        updateUrl: null
      },
      messageList: [],
      messageColorList: {
        play: '#43e97b',
        pause: '#fee140',
        seek: '#fa709a',
        sync: '#4facfe'
      }
    }
  },
  computed: {
    triggerEventParameters () {
      return {
        roomId: this.config.roomId,
        ...this.eventParameters
      }
    },
    syncProgressTimeComputed () {
      const s = this.syncProgressTime > 0 ? '快' : '慢'
      // 此处使用反引号 ` 实现模板字符串
      return `进度比对方${s}了` + Math.abs(this.syncProgressTime).toFixed(2) + '秒'
    }
  },
  watch: {
    config: {
      deep: true,
      handler () {
        localStorage.setItem('config', JSON.stringify(this.config))
        if (this.config.autoSyncPlayProgress) {
          console.log('开启自动同步')
          if (this.autoSyncPlayProgressTimer) {
            clearInterval(this.autoSyncPlayProgressTimer)
          }
          this.autoSyncPlayProgressTimer = setInterval(this.handleAutoSyncPlayProgress, 1000 * 3)
        } else {
          if (this.autoSyncPlayProgressTimer != null) {
            clearInterval(this.autoSyncPlayProgressTimer)
          }
        }
      }
    }
  },
  created () {
    this.createRoomId()
    this.eventParameters.uuid = uuid()
    const config = localStorage.getItem('config')
    if (config) {
      this.config = JSON.parse(config)
    }
  },
  mounted () {
    this.player = this.$refs.VueAliplayerV2
    this.xgPlayer = this.$refs.xgPlayer
    this.currentPlayer = this.xgPlayer
    console.log(this.player)
    this.socket = getSocket()
    // 在连接错误时触发
    this.socket.io.on('error', (err) => {
      console.log('连接错误', err) // false
    })
    this.socket.io.on('reconnect', attempt => {
      console.log('连接成功', attempt)
    })
    this.socket.on('video-control', (res) => {
      const result = JSON.parse(res)
      console.log('接收到消息：', result)
      if (result.uuid !== this.eventParameters.uuid && result.roomId === this.config.roomId) {
        this.handleOtherMessage(result)
      }
    })
  },
  methods: {
    createRoomId () {
      const x = 100000; const y = 999999
      this.config.roomId = Math.round(Math.random() * (y - x) + x)
    },
    handleOtherMessage (message) {
      switch (message.type) {
        case 'play':
          console.log('收到开始播放的消息：', message)
          this.playerPlay()
          this.pushMessage('对方开始播放', 'play')
          break
        case 'pause':
          console.log('收到暂停播放的消息', message)
          this.playerPause()
          this.pushMessage('对方暂停播放', 'pause')
          break
        case 'seek': {
          console.log('收到调节播放进度的消息', message)
          const difference = Math.abs(this.playerGetCurrentTime() - message.seekTime)
          if (difference > 2) {
            this.playerSeek(message.seekTime)
            this.pushMessage('对方调节了播放进度', 'seek')
          }
          break
        }
        case 'syncProcess': {
          console.log('收到同步播放进度的消息', message)
          const difference = Math.abs(this.playerGetCurrentTime() - message.seekTime)
          console.log('本机进度与远程进度的差距为', difference)
          this.syncProgressTime = this.playerGetCurrentTime() - message.seekTime
          if (difference > 6) {
            this.playerSeek(message.seekTime)
            this.pushMessage('播放进度已同步', 'sync')
          }
          break
        }
        case 'updateUrl':
          console.log('收到更新播放url的消息', message)
          this.config.source = message.updateUrl
      }
    },
    handleVideoReady () {
      console.log('播放器已经准备好播放')
      this.player.pause()
    },
    handleVideoPlay () {
      console.log('开始播放')
      this.eventParameters.type = 'play'
      this.seedMessage()
    },
    handleVideoPause () {
      console.log('暂停播放')
      this.eventParameters.type = 'pause'
      this.seedMessage()
    },
    handleVideoCompleteSeek (time) {
      this.eventParameters.type = 'seek'
      if (this.currentPlayerName === 'xgPlayer') {
        this.eventParameters.seekTime = this.currentPlayer.getPlayer().currentTime
      } else {
        this.eventParameters.seekTime = time.paramData
      }
      console.log('跳转播放，时间为', this.eventParameters.seekTime)
      this.seedMessage()
    },
    handleAutoSyncPlayProgress () {
      console.log('自动同步进度。当前播放器状态', this.playerStatus())
      if (this.playerStatus() === 'playing') {
        this.eventParameters.type = 'syncProcess'
        this.eventParameters.seekTime = this.playerGetCurrentTime()
        this.seedMessage()
      }
    },
    handleUpdateVideoUrl () {
      console.log('更新播放链接')
      this.eventParameters.type = 'updateUrl'
      this.eventParameters.updateUrl = this.config.source
      this.seedMessage()
    },
    seedMessage () {
      this.socket.emit('video-control', JSON.stringify(this.triggerEventParameters))
    },
    playerPlay () {
      this.currentPlayer.play()
    },
    playerPause () {
      this.currentPlayer.pause()
    },
    playerStatus () {
      if (this.currentPlayerName === 'xgPlayer') {
        return this.currentPlayer.getPlayer().paused ? 'paused' : 'playing'
      } else {
        return this.currentPlayer.getStatus()
      }
    },
    playerGetCurrentTime () {
      if (this.currentPlayerName === 'xgPlayer') {
        return this.currentPlayer.getPlayer().currentTime
      } else {
        return this.currentPlayer.getCurrentTime()
      }
    },
    playerSeek (time) {
      if (this.currentPlayerName === 'xgPlayer') {
        this.currentPlayer.getPlayer().currentTime = time
      } else {
        this.currentPlayer.seek(time)
      }
    },
    pushMessage (message, type) {
      const m = {
        id: uuid(),
        content: moment().format('hh:mm:ss') + ' ' + message,
        color: this.messageColorList[type]
      }
      this.messageList.unshift(m)
    }
  }
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

:deep(.el-card__body) {
  padding: 0;
}
</style>
