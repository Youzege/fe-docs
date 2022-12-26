const CHUNKSIZE = 2 * 1024 * 1024

enum STATUS {
  WAIT = 'wait',
  PAUSE = 'pause',
  UPLOADING = 'uploading',
  ERROR = 'error',
  DONE = 'done'
}

interface Chunks {
  file: Blob
}

interface HashChunk {
  fileHash: string
  chunk: Blob
  index: number
  percent: number
  hash: string
  size: number
  form?: FormData
  status?: string
}

/**
 * 分片上传
 * - 处理单个文件的分片上传
 * 功能
 * - 上传分片
 * - 合并请求
 * - 分片进度
 *   传入外部接收函数
 * - 上传进度
 *   传入外部接收函数
 * - 查询是否存在当前文件
 */
export default class FragmentUpload {
  public size: number = CHUNKSIZE
  public fileName: string = ''
  public chunks: Chunks[]
  public newChunks: HashChunk[]
  public uploadedChunks: HashChunk[] | []
  public hash: string
  public status: string
  public calcProgress: number
  public uploadProgress: number

  constructor (file: File) {
    this.fileName = file.name
    this.sliceFile(file)
  }

  sliceFile (file: File) {
    const chunks: Chunks[] = []
    let current = 0

    while (current < file.size) {
      chunks.push({ file: file.slice(current, current + this.size) })
      current += this.size
    }

    this.chunks = chunks
  }

  async calcMD5 () {
    const calcResult: Promise<{ hash: string }> = new Promise(resolve => {
      // web-worker 防止卡顿主线程'
      const worker = new Worker(
        new URL('./worker/hash.worker.js', import.meta.url)
      )
      // 向worker 发送 chunks 片段
      worker.postMessage({ chunks: this.chunks })
      worker.onmessage = ({ data }) => {
        const { hash, progress } = data

        this.calcProgress = progress
        // getHashCalaProgress(filename, progress)
        console.log('calc', this.calcProgress)
        if (hash) {
          resolve({ hash })
        }
      }
    })
    const { hash } = await calcResult

    this.hash = hash
  }

  async checkFileExistence () {
    // 1. 接口- 检查文件存在
    const response: { uploaded: boolean; uploadedList: HashChunk[] | [] } = {
      uploaded: false,
      uploadedList: []
    }
    return response
  }

  async upload () {
    // 0. 文件计算MD5
    await this.calcMD5()

    // 1. 检查服务端是否存在当前文件
    const { uploaded, uploadedList } = await this.checkFileExistence()
    this.uploadedChunks = uploadedList
    // 2. 文件存在 秒传
    if (uploaded) {
      this.status = STATUS.DONE
      console.log(`文件:${this.fileName} 秒传成功`)
      return {
        status: STATUS.DONE
      }
    }

    // 3. 文件不存在，设置文件Hash
    this.newChunks = this.processChunks()
    this.chunks = []

    // 4. 执行上传
    this.uploadChunks()
  }

  processChunks () {
    return this.chunks.map((chunk, index) => {
      // 每一个分片
      const chunkName = this.hash + '-' + index

      return {
        fileHash: this.hash,
        chunk: chunk.file,
        index,
        percent: 0,
        hash: chunkName,
        size: chunk.file.size
      }
    })
  }

  async uploadChunks () {
    // 1. 获取待传分片列表
    const uploadList = this.filterUploadedChunks()

    // 2. 上传分片
    this.status = STATUS.UPLOADING
    await this.uploadRequest(uploadList, 4, 3)
  }

  filterUploadedChunks () {
    return this.newChunks
      .filter(
        (chunk: HashChunk) =>
          this.uploadedChunks.findIndex(item => item.hash === chunk.hash) === -1
      )
      .map(list => {
        const form = new FormData()
        form.append('chunk', list.chunk)
        form.append('hash', list.hash)
        form.append('filename', this.fileName)
        form.append('fileHash', this.hash)

        list.form = form
        list.status = STATUS.WAIT
        return list
      })
  }

  async uploadRequest (uploadList: HashChunk[], concurrency: number, retry: number) {
    return new Promise((resolve, reject) => {
      const len = uploadList.length
      let counter = 0
      const retryArr = new Array(len).fill(0)
      const start = async () => {
        if (counter === len && counter === 0) {
          resolve(true)
        }
        // 上传请求, 控制请求数量
        while (counter < len && concurrency > 0) {
          // 占用通道
          concurrency--
          // 状态: wait或者error 需要重新发送上传请求
          const upIndex = uploadList.findIndex(
            v => v.status == STATUS.WAIT || v.status == STATUS.ERROR
          )
          if (upIndex == -1) {
            // 没有等待的请求，结束
            resolve(true)
            return
          }
          uploadList[upIndex].status = STATUS.UPLOADING

          const form = uploadList[upIndex].form
          const index = uploadList[upIndex].index
          if (typeof retryArr[index] == 'number') {
            console.log(index, `第${retryArr[index] + 1}次上传`)
          }
          try {
            // await chunkUploadReq({
            //   url: '/upload',
            //   method: 'post',
            //   data: form
            // })
            uploadList[upIndex].status = STATUS.DONE
            concurrency++ // 释放通道
            counter++
            if (counter === len) {
              resolve(true)
            } else {
              start()
            }
          } catch (e) {
            // 报错后--重试上传
            uploadList[upIndex].status = STATUS.ERROR
            if (typeof retryArr[index] !== 'number') {
              retryArr[index] = 0
            }
            // 重试次数累加
            retryArr[index]++
            // 重复次数过多 终止上传
            if (retryArr[index] > retry) {
              return reject()
            }
            console.log(index, retryArr[index], e, '次报错')

            // 释放当前占用的通道，但是counter不累加
            concurrency++

            // 重试次数内, 重新发送请求
            start()
          }
        }
      }

      start()
    })
  }
}
