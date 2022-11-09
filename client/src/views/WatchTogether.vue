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
          <el-tabs value="first">
            <el-tab-pane label="加入房间" name="first">
              <el-input v-model.number="config.roomId" type="number" placeholder="输入房间号">
                <el-button slot="append" icon="el-icon-check">确定</el-button>
              </el-input>
            </el-tab-pane>
            <el-tab-pane label="创建房间" name="second">
              <el-button @click="createRoomId">点击创建房间</el-button>
              <span>{{ config.roomId }}</span>
            </el-tab-pane>
          </el-tabs>
          <div>
            <div style="margin: 10px 0;">当前播放：</div>
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
import ArtPlayer from '@/components/ArtPlayer'
import { getSocket } from '@/api/socketServer'
import { uuid } from '@/utils/uuid'
import { format } from 'date-fns'

export default {
  name: 'WatchTogether',
  components: {
    ArtPlayer
  },
  data () {
    return {
      socket: null,
      currentPlayer: null,
      config: {
        roomId: 123,
        autoSyncPlayProgress: true,
        source: '//player.alicdn.com/video/aliyunmedia.mp4'
      },
      autoSyncPlayProgressTimer: null,
      syncProgressTime: 0, // 本机与对方的进度差值
      isSeeking: false, // 是否处于调节进度状态，避免与自动同步进度冲突
      eventParameters: {
        type: 'play',
        uuid: undefined,
        seekTime: null,
        updateUrl: null,
        isSeeking: false
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
          this.autoSyncPlayProgressTimer = setInterval(this.handleAutoSyncPlayProgress, 1000 * 2)
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
      console.debug('接收到消息：', result)
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
    getInstance (art) {
      // 初始化播放器实例
      this.currentPlayer = art
    },
    handleOtherMessage (message) {
      switch (message.type) {
        case 'play':
          console.debug('收到开始播放的消息：', message)
          this.playerPlay()
          this.pushMessage('对方开始播放', 'play')
          break
        case 'pause':
          console.debug('收到暂停播放的消息', message)
          this.playerPause()
          this.pushMessage('对方暂停播放', 'pause')
          break
        case 'seek': {
          console.debug('收到调节播放进度的消息', message)
          const difference = Math.abs(this.playerGetCurrentTime() - message.seekTime)
          if (difference > 2) {
            this.playerSeek(message.seekTime)
            this.pushMessage('对方调节了播放进度', 'seek')
          }
          break
        }
        case 'syncProcess': {
          console.debug('收到同步播放进度的消息', message)
          const difference = Math.abs(this.playerGetCurrentTime() - message.seekTime)
          console.debug('本机进度与远程进度的差距为', difference)
          this.syncProgressTime = this.playerGetCurrentTime() - message.seekTime
          // 只有当自己和对方都没有调节进度条时才同步
          if (difference > 6 && !this.isSeeking && !message.isSeeking && this.playerStatus() === 'playing') {
            this.playerSeek(message.seekTime)
            this.pushMessage('播放进度已同步', 'sync')
          }
          break
        }
        case 'updateUrl':
          console.debug('收到更新播放url的消息', message)
          this.config.source = message.updateUrl
      }
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
    handleVideoSeeking () {
      this.isSeeking = true
    },
    handleVideoCompleteSeek (time) {
      this.eventParameters.type = 'seek'
      this.eventParameters.seekTime = time
      console.log('跳转播放，时间为', this.eventParameters.seekTime)
      this.isSeeking = true
      // 设置延时，防止点击进度条时自动同步进度
      setTimeout(() => {
        console.log('this.isSeeking = ', this.isSeeking)
        this.isSeeking = false
      }, 300)
      this.seedMessage()
    },
    handleAutoSyncPlayProgress () {
      console.debug('自动同步进度。当前播放器状态', this.playerStatus())
      this.eventParameters.type = 'syncProcess'
      this.eventParameters.seekTime = this.playerGetCurrentTime()
      this.eventParameters.isSeeking = this.isSeeking
      this.seedMessage()
    },
    handleUpdateVideoUrl () {
      console.debug('更新播放链接')
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
      return this.currentPlayer.playing ? 'playing' : 'paused'
    },
    playerGetCurrentTime () {
      return this.currentPlayer.currentTime
    },
    playerSeek (time) {
      this.currentPlayer.currentTime = time
    },
    pushMessage (message, type) {
      const m = {
        id: uuid(),
        content: format(new Date(), 'hh:mm:ss') + ' ' + message,
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
