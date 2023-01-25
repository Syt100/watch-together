import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    AutoImport({
      resolvers: [
        NaiveUiResolver()
      ]
    }),
    Components({
      resolvers: [
        NaiveUiResolver()
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      // '/': {
      //   target: 'http://localhost:2233',
      //   ws: false
      //   // 将请求前缀key（key为正则表达式）重写为value。用来将请求前缀统一替换
      //   // pathRewrite: { 'key': 'value' }
      // },
      '/socket.io': {
        target: 'http://localhost:2233',
        ws: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output:{
        manualChunks(id) {
          if (cutChunks(id)) {
            return id.split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    }
  }
})

/**
 * 根据依赖包的名称判断是否分割
 * @param {string} id
 */
function cutChunks(id) {
  // 包含在列表中的包将被分割
  const list = ['artplayer']
  let contains = false
  for (let name of list) {
    if (id.includes(name)) {
      contains = true
      break
    }
  }
  return id.includes('node_modules') && contains
}
