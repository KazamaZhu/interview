import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Import Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// Import Element Plus icons
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

// Register Element Plus
app.use(ElementPlus)
// Register all icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(router)

app.mount('#app')
