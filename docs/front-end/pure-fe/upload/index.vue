<template>
  <div class="upload-container">
    <n-config-provider :theme="darkTheme">
      <div class="upload-list">
        <div class="upload-header">
          <div class="upload-header-title">文件列表</div>
          <n-upload
            ref="upload"
            :default-upload="false"
            @change="handleChange"
            multiple
          >
            <n-button>上传文件</n-button>
          </n-upload>
        </div>

        <div class="upload-list-item">
          <div
            class="upload-list-file"
            v-for="item in fileList"
            :key="item.name"
          >
            <div class="file-title">
              {{ item.name }}
            </div>
            <div class="upload-operation">
              <n-button
                quaternary
                circle
                color="#70c0e8"
                title="文件上传"
                @click="handleUpload(item.file)"
              >
                <template #icon>
                  <n-icon><UploadFileRound /></n-icon>
                </template>
              </n-button>
              <!-- <n-button quaternary circle color="#70c0e8">
                <template #icon>
                  <n-icon><MotionPhotosPauseOutlined /></n-icon>
                </template>
              </n-button>
              <n-button quaternary circle color="#70c0e8">
                <template #icon>
                  <n-icon><CallMissedOutgoingRound /></n-icon>
                </template>
              </n-button> -->
            </div>
          </div>
        </div>
      </div>
    </n-config-provider>
  </div>
</template>

<script lang="ts" setup>
import {
  NConfigProvider,
  NUpload,
  NButton,
  NIcon,
  NScrollbar,
  darkTheme
} from 'naive-ui'
import type { UploadInst, UploadFileInfo } from 'naive-ui'
import {
  UploadFileRound,
  MotionPhotosPauseOutlined,
  CallMissedOutgoingRound
} from '@vicons/material'
import { Ref, ref } from 'vue'
import FragmentUpload from './composables/useFragmentUpload/useFragmentUpload';

const fileList: Ref<{ file: File | null | undefined; progress: 0; name: string | undefined }[]> = ref([])

const handleChange = ({ file: { file } }: { file: UploadFileInfo }) => {
  fileList.value.push({ file, progress: 0, name: file?.name })
}

const handleUpload = async (file: File) => {
  const upload = new FragmentUpload(file)

  upload.upload()
}
</script>

<style>
.upload-container {
  padding: 5px;

  width: 100%;
  height: 350px;

  border: 1px solid;
  border-radius: 5px;

  overflow: auto;
}

.n-config-provider {
  height: 100%;
}

.upload-list {
  display: flex;
  flex-flow: column;

  height: 100%;
}

.upload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 10px 20px 20px;
}

.upload-header-title {
  width: 200px;
  font-size: 24px;
}

.n-upload {
  display: flex;
  justify-content: end;
  align-items: center;
}

.n-upload-trigger + .n-upload-file-list {
  display: none;
}

.upload-list-item {
  padding: 0 20px;

  width: 100%;
  height: 100%;

  overflow: auto;
}

.upload-list-file {
  display: flex;
  justify-content: space-between;

  padding-bottom: 5px;

  border-bottom: 1px solid;
}

.file-title {
  display: flex;
  align-items: center;

  width: 450px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}
</style>
