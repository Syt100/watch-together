<template>
  <div id="xg-video-player" class="xg-video-player" />
</template>

<script>
import Player from 'xgplayer'
import HlsJsPlayer from 'xgplayer-hls.js'

export default {
  name: 'XGPlayer',
  props: {
    url: {
      // 父组件传过来的视频链接
      type: String,
      default: ''
    }
  },
  data () {
    return {
      player: null, // 实例,
      sourceType: 'mp4', // 视频类型
      /**
       * 播放器事件
       */
      events: [
        'play', // 播放
        'playing', // 继续播放
        'pause', // 暂停
        'ended', // 结束
        'error', // 错误 错误信息对象 {...}
        'seeking', // seek播放
        'seeked', // seek播放结束
        'timeupdate', // 播放时间改变
        'waiting', // 等待加载数据
        'canplay', // 视频可以播放
        'canplaythrough', // 视频可以流畅播放
        'durationchange', // 时长发生变化
        'volumechange', // 音量发生变化
        'bufferedChange', // 缓冲发生变化 当前缓存片段数组 [ [0, 10], [25, 60] ]
        'definitionChange', // 清晰度发生变化 切换前后清晰度 { from: '360p', to: '720p' }
        'playbackrateChange', // 播放速度发生变化 切换前后速度 { from: 1, to: 2 }
        'screenShot', // 完成截图操作 包含截图data URI的DOMString
        'requestFullscreen', // 进入全屏
        'exitFullscreen', // 退出全屏
        'requestCssFullscreen', // 进入样式全屏
        'exitCssFullscreen', // 退出样式全屏
        'getRotateFullscreen', // 进入样式横屏全屏
        'exitRotateFullscreen', // 退出样式横屏全屏
        'controlShow', // 控制栏展示
        'controlHide' // 控制栏隐藏
      ]
    }
  },
  mounted () {
    console.log('传过来的url:', this.url)
    // 初始化播放器
    this.initPlayer()
  },
  created () {},
  // 监听播放路径的变化
  watch: {
    url () {
      // this.player.src = this.url
      this.initPlayer()
    }
  },
  methods: {
    // =========================1，设置播放器必要参数===================
    initPlayer () {
      if (!this.url) {
        return console.warn('url 不存在')
      }
      const config = {
        id: 'xg-video-player',
        url: this.url,
        fluid: true, // 流式布局

        /** 倍速播放 */
        playbackRate: [0.5, 0.75, 1, 1.25, 1.5, 2],
        defaultPlaybackRate: 1,

        playsinline: this.isAppleDevice(), // IOS设备设置，防止被浏览器劫持
        'x5-video-player-type': 'h5', // 微信内置浏览器设置，防止被浏览器劫持
        'x5-video-orientation': 'portraint',
        /** 画中画 */
        pip: true,
        // pipConfig: {
        //   bottom: 100,
        //   right: 100,
        //   width: 320,
        //   height: 180
        // },
        // download: true,
        /** 初始化首帧 */
        videoInit: true,
        autoplay: false,
        /** 截图 */
        screenShot: {
          hideButton: false
        },
        keyShortcut: 'on',
        keyShortcutStep: { // 设置调整步长
          currentTime: 3, // 播放进度调整步长，默认10秒
          volume: 0.1 // 音量调整步长，默认0.1
        },
        /** 关闭点击视频切换播放/暂停状态 */
        closeVideoTouch: true,
        /** 使移动端支持双击暂停/播放 */
        enableVideoDbltouch: true
      }
      //= ========================= 2，开始实例化======================
      this.player && this.player.destroy() // 防止实例的重复
      let player = null
      if (this.url.includes('.m3u8')) {
        player = new HlsJsPlayer(config)
      } else {
        player = new Player(config)
      }

      if (player) {
        this.player = player
        // 这里注册监听
        this.events.forEach(event => {
          this.player && this.player.on(event, e => {
            this.$emit(event, e)
          })
        })
      }
    },
    // IOS设备设置，防止被浏览器劫持
    isAppleDevice () {
      const ua = navigator.userAgent.toLowerCase()
      return /iphone|ipad|phone|Mac/i.test(ua)
    },
    getPlayer () {
      return this.player
    },
    play () {
      this.player && this.player.play()
    },
    pause () {
      this.player && this.player.pause()
    }
  },
  beforeDestroy () {
    // 销毁播放器
    if (this.player) {
      this.player.destroy()
    }
  }
}
</script>

<style scoped>

</style>
