import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
// pinia数据持久化插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import '@csstools/normalize.css'
import './assets/main.css'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(pinia)

app.mount('#app')
