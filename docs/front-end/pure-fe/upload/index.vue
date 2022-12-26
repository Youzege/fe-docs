<template>
  <div class="upload-container">
    <n-config-provider :theme="darkTheme">
      <div class="upload-list">
        <div class="upload-header">
          <div class="upload-header-title">文件列表</div>
          <n-upload action="" @before-upload="beforeUpload">
            <n-button>上传文件</n-button>
          </n-upload>
        </div>

        <div class="upload-list-item">
          <div class="upload-list-file" v-for="item in 5" :key="item">
            <div class="file-title">
              xxx.pdf
            </div>
            <div class="upload-operation">
              <n-button
                  quaternary
                  circle
                  color="#70c0e8"
                >
                  <template #icon>
                    <n-icon><UploadFileRound /></n-icon>
                  </template>
                </n-button>
                <n-button quaternary circle color="#70c0e8">
                  <template #icon>
                    <n-icon><MotionPhotosPauseOutlined/></n-icon>
                  </template>
                </n-button>
                <n-button
                  quaternary
                  circle
                  color="#70c0e8"
                >
                  <template #icon>
                    <n-icon><CallMissedOutgoingRound /></n-icon>
                  </template>
                </n-button>
            </div>
          </div>
        </div>
      </div>
    </n-config-provider>
  </div>
</template>

<script lang="ts" setup>
import { NConfigProvider, NUpload, NButton,NIcon, NScrollbar, darkTheme } from 'naive-ui'
import {
  UploadFileRound,
  MotionPhotosPauseOutlined,
  CallMissedOutgoingRound
} from '@vicons/material'

const beforeUpload = e => {
  console.log('e', e)
}
</script>

<style scoped>
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
  justify-content:space-between;
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

.upload-list-item {
  padding: 0 20px;

  width: 100%;
  height: 100%;

  overflow: auto;
}

.upload-list-file {
  display: flex;
  justify-content:space-between;

  padding-bottom: 5px;

  border-bottom: 1px solid;
}

.file-title {
  display: flex;
  align-items: center;

  width: 450px;
}
</style>
