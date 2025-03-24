import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Import Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// Import Element Plus icons
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 初始化数据管理器
import { initDataManager } from './utils/DataManager'

// 应用初始化前确保数据管理器已初始化
try {
    console.log('初始化数据管理器')
    initDataManager()
} catch (error) {
    console.error('初始化数据管理器失败:', error)
    // 错误通知用户
    alert('应用程序初始化失败，请尝试清除浏览器缓存后重新加载。')
}

// 创建Vue应用
const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
    console.error('应用错误:', err)
    console.error('错误信息:', info)
}

// Register Element Plus
app.use(ElementPlus, {
    size: 'default',
    zIndex: 3000,
})

// Register all icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 使用路由
app.use(router)

// 挂载应用
app.mount('#app')
