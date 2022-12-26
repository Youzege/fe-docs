
self.importScripts('./spark-md5.js')

/**
 * webworker 防止卡住主线程
 * 监听 worker 信息
 * @param {*} event 
 */
self.onmessage = (event) => {
  const fileChunkList = event.data.chunks
  const spark = new (self).SparkMD5.ArrayBuffer()
  // 计算进度 
  let percentage = 0
  // 分片计算数
  let count = 0

  // 将分片逐个计算
  const loadNext = (index) => {
    /**
     * 文件读取
     *  - 读取一个文件 blob & file
     *  - 读取完成 返回 result 包含了 读取的文件数据
     */
    const reader = new FileReader()
    reader.readAsArrayBuffer(fileChunkList[index].file)
    reader.onload = (e) => {
      count++
      spark.append(e.target?.result)
      if(count === fileChunkList.length) {
        self.postMessage({
          hash: spark.end(),
          progress: 100
        })
        self.close()
      } else {
        percentage += 100 / fileChunkList.length
        self.postMessage({
          progress: percentage
        })
        // 递归
        loadNext(count)
      }
    }
  }
  // 开始
  loadNext(0)
}