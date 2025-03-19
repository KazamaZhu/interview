import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      // 增加对旧版本 node 的支持
      template: {
        compilerOptions: {
          whitespace: 'preserve',
        }
      }
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 针对 Node.js v14 的兼容性配置
  build: {
    target: 'es2015', // 目标为 ES2015，兼容旧版浏览器和 Node.js
    minify: 'terser',
    terserOptions: {
      compress: {
        // 避免使用 Node.js v14 不支持的语法
        ecma: 2015
      }
    }
  },
  esbuild: {
    target: 'es2015' // 同样将 esbuild 目标设置为 ES2015
  },
  // 开发服务器配置
  server: {
    hmr: {
      overlay: false // 禁用错误覆盖，这在某些旧版本下可能会有问题
    }
  }
})
