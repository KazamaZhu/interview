import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      // Vue 选项
      reactivityTransform: true, // 启用 reactivity transform
      template: {
        compilerOptions: {
          whitespace: 'preserve',
        }
      }
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue': 'vue/dist/vue.esm-bundler.js' // 确保导入完整版的 Vue
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  define: {
    __VUE_OPTIONS_API__: true, // 启用 Options API
    __VUE_PROD_DEVTOOLS__: false // 在生产环境中禁用开发工具
  },
  // 针对 Node.js v14 的兼容性配置
  build: {
    target: 'es2015', // 目标为 ES2015，兼容旧版浏览器和 Node.js
    minify: 'terser',
    terserOptions: {
      compress: {
        ecma: 2015
      }
    }
  },
  esbuild: {
    target: 'es2015'
  },
  // 开发服务器配置
  server: {
    hmr: {
      overlay: false
    }
  }
})
