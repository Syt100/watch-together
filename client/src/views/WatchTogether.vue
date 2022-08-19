<template>
  <div>
    <VueAliplayerV2
      ref="VueAliplayerV2"
      :source="config.source"
      @ready="handleVideoReady"
      @play="handleVideoPlay"
      @pause="handleVideoPause"
      @completeSeek="handleVideoCompleteSeek"
    />
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
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { io } from 'socket.io-client'
import { uuid } from '@/utils/uuid'

export default {
  name: 'WatchTogether',
  data () {
    return {
      socket: null,
      player: null,
      config: {
        roomId: 123,
        autoSyncPlayProgress: false,
        source: '//player.alicdn.com/video/aliyunmedia.mp4'
      },
      autoSyncPlayProgressTimer: null,
      eventParameters: {
        type: 'play',
        uuid: undefined,
        seekTime: null,
        updateUrl: null
      }
    }
  },
  computed: {
    triggerEventParameters () {
      return {
        roomId: this.config.roomId,
        ...this.eventParameters
      }
    }
  },
  watch: {
    config: {
      deep: true,
      handler () {
        localStorage.setItem('config', JSON.stringify(this.config))
        if (this.config.autoSyncPlayProgress) {
          console.log('开启自动同步')
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
    console.log(this.player)
    this.socket = io('ws://192.168.1.115:2233')
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
          this.player.play()
          break
        case 'pause':
          console.log('收到暂停播放的消息', message)
          this.player.pause()
          break
        case 'seek':
          console.log('收到调节播放进度的消息', message)
          this.player.seek(message.seekTime)
          break
        case 'syncProcess': {
          console.log('收到同步播放进度的消息', message)
          const difference = Math.abs(this.player.getCurrentTime() - message.seekTime)
          console.log('本机进度与远程进度的差距为', difference)
          if (difference > 6) {
            this.player.seek(message.seekTime)
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
      console.log('跳转播放，时间为', time)
      this.eventParameters.type = 'seek'
      this.eventParameters.seekTime = time.paramData
      this.seedMessage()
    },
    handleAutoSyncPlayProgress () {
      console.log('自动同步进度。当前播放器状态', this.player.getStatus())
      if (this.player.getStatus() === 'playing') {
        this.eventParameters.type = 'syncProcess'
        this.eventParameters.seekTime = this.player.getCurrentTime()
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
    }
  }
}
</script>

<style scoped>

</style>
