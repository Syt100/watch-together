<template>
  <div
      id="art-player-container"
      ref="artRef"
      @mousedown="isSeeking = true"
      @mouseup="isSeeking = false"
      :style="artPlayerStyle"
  />
</template>

<script setup>
import {nextTick, onMounted, reactive, ref, watch} from 'vue'
import Artplayer from 'artplayer'
import {useDebounceFn} from '@vueuse/core'
import {useWatchConfigStore} from '@/stores/watchConfig'
import {useThemeVars} from 'naive-ui'

// Naive UI的主题变量
const themeVars = useThemeVars()

const watchConfig = useWatchConfigStore()

// 声明props
const props = defineProps({
  option: {
    type: Object,
    required: false,
    default: function () {
      return {}
    }
  },
  url: {
    type: String,
    required: false,
    default: 'https://artplayer.org/assets/sample/video.mp4'
  }
})

// 声明事件
const emit = defineEmits(['get-instance', 'seeked', 'seeking', 'play', 'pause'])

// 实例ref引用
const artRef = ref()
let instance = null

const defaultOption = reactive({
  title: 'Your Name',
  theme: themeVars.value.primaryColor,
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
})

const isSeeking = ref(false)
const events = [
  'ready',
  'play',
  'pause'
]

// 播放器样式
const artPlayerStyle = reactive({})

// 监听播放链接变化
watch(() => props.url, newUrl => {
  if (instance) {
    instance.switchUrl(newUrl)
  }
})

onMounted(() => {
  instance = new Artplayer({
    url: props.url,
    ...props.option,
    ...defaultOption,
    container: artRef.value,
    customType: {
      m3u8: playM3u8,
      flv: playMpegTs,
      mpd: playMpd
    }
  })

  nextTick(() => {
    emit('get-instance', instance)
    // seek会出发多次，使用防抖https://www.lodashjs.com/docs/lodash.debounce

    instance.on('seek', useDebounceFn((...args) => {
      if (!isSeeking.value) {
        emit('seeked', ...args)
      }
    }, 200))

    // 拖动进度条事件，会多次触发，此处不能监听原生事件，原生事件会导致本机设置currentTime时也会触发此事件
    instance.on('seek', (...args) => {
      emit('seeking', ...args)
      console.log('触发调节进度事件')
    })
    instance.on('video:play', (...args) => {
      emit('play', ...args)
    })
    instance.on('video:pause', (...args) => {
      emit('pause', ...args)
    })
  })
  compatibilityCheck()
})

// 兼容性检查
function compatibilityCheck () {
  // 检查浏览器是否支持CSS的aspect-ratio属性
  if ('aspectRatio' in document.documentElement.style) {
    // 支持则什么都不做
  } else {
    // offsetWidth获取元素真实大小
    // 将高度设为宽度的9/16，从而实现横纵比16:9
    artPlayerStyle.height = artRef.value.offsetWidth * 9 / 16 + 'px'
    watchConfig.showCompatibilityAlert = true
  }
}

async function playM3u8(video, url, art) {
  const {default: Hls} = await import('hls.js')
  if (Hls.isSupported()) {
    // 添加enableWorker: false配置以解决报错问题 https://github.com/video-dev/hls.js/issues/5107
    const hls = new Hls({enableWorker: false});
    hls.loadSource(url);
    hls.attachMedia(video);

    // optional
    art.hls = hls;
    art.once('url', () => hls.destroy());
    art.once('destroy', () => hls.destroy());
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
  } else {
    art.notice.show = '不支持播放格式: m3u8';
  }
}

// 使用mpegts.js代替flv.js https://github.com/xqq/mpegts.js
// 原来的写法
// async function playFlv(video, url, art) {
//   const {default: flvjs} = await import('flv.js')
//   if (flvjs.isSupported()) {
//     const flv = flvjs.createPlayer({type: 'flv', url});
//     flv.attachMediaElement(video);
//     flv.load();
//
//     // optional
//     art.flv = flv;
//     art.once('url', () => flv.destroy());
//     art.once('destroy', () => flv.destroy());
//   } else {
//     art.notice.show = '不支持播放格式: flv';
//   }
// }
async function playMpegTs(video, url, art) {
  // const {default: flvjs} = await import('flv.js')
  const Mpegts = await import('mpegts.js')
  if (Mpegts.isSupported()) {
    const flv = Mpegts.createPlayer({type: 'flv', url});
    flv.attachMediaElement(video);
    flv.load();

    // optional
    art.flv = flv;
    art.once('url', () => flv.destroy());
    art.once('destroy', () => flv.destroy());
  } else {
    art.notice.show = '不支持播放格式: flv';
  }
}

async function playMpd(video, url, art) {
  const { default: dashjs } = await import('dashjs')
  if (dashjs.supportsMediaSource()) {
    const dash = dashjs.MediaPlayer().create();
    dash.initialize(video, url, art.option.autoplay);

    // optional
    art.dash = dash;
    art.once('url', () => dash.destroy());
    art.once('destroy', () => dash.destroy());
  } else {
    art.notice.show = '不支持播放格式: mpd';
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
