<template>
  <div id="art-player-container" ref="artRef"/>
</template>

<script>
import Artplayer from 'artplayer'
// import * as _ from 'lodash'
import { debounce } from 'lodash'

export default {
  name: 'ArtPlayer',
  data () {
    return {
      instance: null,
      optionDefault: {
        url: 'https://artplayer.org/assets/sample/video.mp4',
        title: 'Your Name',
        theme: 'var(--bpx-primary-color,#00a1d6)',
        volume: 0.8,
        flip: true, // 是否显示视频翻转功能，目前只出现在 设置面板 里，所以需要同时设置 setting 为 true
        playbackRate: true, // 是否显示视频播放速度功能，会出现在 设置面板 和 右键菜单 里
        aspectRatio: true, // 是否显示视频长宽比功能，会出现在 设置面板 和 右键菜单 里
        screenshot: true, // 是否在底部控制栏里显示视频截图功能
        // 可选 由于浏览器安全机制，假如视频源地址和网站是跨域的，可能会出现截图失败
        moreVideoAttr: {
          crossOrigin: 'anonymous'
        },
        setting: true, // 是否在底部控制栏里显示设置面板的开关按钮
        pip: true, // 是否在底部控制栏里显示画中画的开关按钮
        fullscreen: true, // 是否在底部控制栏里显示播放器窗口全屏按钮
        fullscreenWeb: true, // 是否在底部控制栏里显示播放器网页全屏按钮
        subtitleOffset: true, // 字幕时间偏移，范围在 [-5s, 5s]
        whitelist: ['*'],
        autoOrientation: true // 是否在移动端的网页全屏时，根据视频尺寸和视口尺寸，旋转播放器
      },
      events: [
        'ready',
        'play',
        'pause'
      ]
    }
  },
  props: {
    option: {
      type: Object,
      required: false,
      default: function () {
        return {}
      }
    }
  },
  mounted () {
    this.instance = new Artplayer({
      ...this.option,
      ...this.optionDefault,
      container: this.$refs.artRef
    })
    this.$nextTick(() => {
      this.$emit('get-instance', this.instance)
      // this.events.forEach(event => {
      //   this.instance.on(event, (...args) => {
      //     this.$emit(event, ...args)
      //   })
      // })
      // seek会出发多次，使用防抖https://www.lodashjs.com/docs/lodash.debounce
      this.instance.on('seek', debounce((...args) => {
        this.$emit('seeked', ...args)
      }, 300))
      this.instance.on('video:play', (...args) => {
        this.$emit('play', ...args)
      })
      this.instance.on('video:pause', (...args) => {
        this.$emit('pause', ...args)
      })
    })
  },
  beforeUnmount () {
    if (this.instance && this.instance.destroy) {
      this.instance.destroy(false)
    }
  }
}
</script>

<style scoped>
#art-player-container {
  width: 100%;
  /* 高度根据宽度自适应显示，按比例显示宽高 */
  aspect-ratio: 16 / 9;
}
</style>
