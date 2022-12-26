/*
 * @Author: luoyz
 * @Date: 2022-12-26 16:27:24
 * @LastEditors: luoyz
 * @LastEditTime: 2022-12-26 16:40:10
 */
import { defineConfig } from 'vitepress'
import { FrontEnd } from './sidebar'

export default defineConfig({
  title: '前端功能案例',
  description: '收集一些前端案例',
  lastUpdated: true,
  ignoreDeadLinks: true,
  head: [
    [
      'link',
      { rel: 'icon', href: '/images/mess.png' }
      //浏览器的标签栏的网页图标，第一个'/'会遍历public文件夹的文件
    ],
  ],
  themeConfig: {
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    logo: '/images/mess.png',
    nav: [
      {
        text: '纯前端 案例合集',
        link: '/front-end/pure-fe/upload/index',
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/raomaiping/map-demo' },
    ],
    sidebar: {
      '/front-end/': FrontEnd
    },
    lastUpdatedText: '最近更新时间',
  },
  vite: {
    build: {
      sourcemap: false,
      minify: 'terser',
      chunkSizeWarningLimit: 1500,
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id
                .toString()
                .split('node_modules/')[1]
                .split('/')[0]
                .toString()
            }
          },
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId.split('/')
              : []
            const fileName =
              facadeModuleId[facadeModuleId.length - 2] || '[name]'
            return `js/${fileName}/[name].[hash].js`
          },
        },
      },
    },
  },
})
