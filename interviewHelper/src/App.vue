<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <el-config-provider>
      <router-view v-slot="{ Component }">
        <template v-if="Component">
          <suspense>
            <component :is="Component" />
            <template #fallback>
              <div class="loading-container">
                <el-skeleton :rows="6" animated />
              </div>
            </template>
          </suspense>
        </template>
      </router-view>
    </el-config-provider>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  width: 100%;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background-color: #f5f7fa;
}

.app-container {
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
}

.loading-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

pre {
  background-color: #f8f8f8;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 8px 0;
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.4;
}

code {
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  background-color: #f0f0f0;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.9em;
}

pre code {
  background-color: transparent;
  padding: 0;
}

/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 调整Element Plus组件样式 */
.el-card {
  --el-card-padding: 12px;
}

.el-form-item {
  margin-bottom: 12px;
}

.el-form-item__label {
  padding-bottom: 4px;
}
</style>
