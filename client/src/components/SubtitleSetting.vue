<template>
  <n-modal
    v-model:show="config.show"
    preset="dialog"
    title="字幕设置"
    :show-icon="false"
    :auto-focus="false"
  >
    <div class="mt10">
      <n-form
        :model="config"
        label-align="left"
        label-placement="left"
        label-width="auto"
      >
        <n-form-item label="字幕URL">
          <n-input
            v-model:value="config.subtitleUrl"
            type="textarea"
            :autosize="{minRows: 1, maxRows: 5}"
            placeholder="请输入字幕地址"
          />
        </n-form-item>

        <n-form-item label="本地字幕">
          <n-space>
            <n-button @click="handleOpenFile">选择文件</n-button>
            <n-button @click="reset()">重置</n-button>
            <my-text>字幕类型</my-text>
            <n-select v-model:value="config.subtitleType" :options="subtitleTypeOptions" style="width: 80px;"/>
          </n-space>
        </n-form-item>

        <n-form-item label="已选文件">
          <span v-if="files">{{ files.item(0).name }}</span>
          <span v-else>未选择文件</span>
        </n-form-item>

        <n-form-item label="同步字幕">
          <n-button @click="handleSyncSubtitle">点击同步到对方</n-button>
        </n-form-item>
      </n-form>
    </div>
    <template #action>
      <n-button @click="config.show = false">关闭</n-button>
    </template>
  </n-modal>
</template>

<script setup>
import { useSubtitleConfigStore } from '@/stores/subtitleConfig'
import { useFileDialog, useObjectUrl, useEventBus } from '@vueuse/core'
import { shallowRef, watch } from 'vue'
import { useMessage } from 'naive-ui'
import MyText from '@/components/MyText.vue'

const nMessage = useMessage()
const config = useSubtitleConfigStore()

const fileDialog = useFileDialog()
const { files, open, reset } = fileDialog
const file = shallowRef()

const localFileUrl = useObjectUrl(file)

watch(files, newFiles => {
  file.value = (newFiles && newFiles.length > 0) ? newFiles[0] : undefined
  config.subtitleUrl = localFileUrl
})

function handleOpenFile () {
  // 限制文件类型
  fileDialog.open({
    /** @see https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/input/file#accept */
    accept: '.ass,.vtt,.srt',
    multiple: false
  })
}

const subtitleTypeOptions = [
  { label: 'ass', value: 'ass' },
  { label: 'srt', value: 'srt' },
  { label: 'vtt', value: 'vtt' }
]

const bus = useEventBus('updateSubtitle')
function handleSyncSubtitle () {
  if (config.subtitleUrl) {
    const type = config.subtitleUrl.startsWith('blob') ? 'file': 'url'
    /** @type SyncSubtitle */
    const param = {
      type: type,
      url: config.subtitleUrl,
      file: type === 'file' ? file.value : undefined,
      fileName: file.value.name,
      subtitleType: config.subtitleType
    }
    bus.emit(param)
    nMessage.success('已发送字幕')
  } else {
    nMessage.warning('未选择字幕文件或未输入字幕URL')
  }
}

/**
 * @typedef {Object} SyncSubtitle
 * @property {'file' | 'url'} type 同步的字幕类型
 * @property {string} url URL
 * @property {any} file 文件的ArrayBuffer
 * @property {string} fileName 文件名
 * @property {'ass' | 'vtt' | 'srt'} subtitleType 字幕类型
 */
</script>

<style scoped>

</style>
