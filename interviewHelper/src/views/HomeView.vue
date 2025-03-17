<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { categories } from '@/data/interviewData'

const router = useRouter()
const searchKeyword = ref('')

// 处理搜索
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/search',
      query: { keyword: searchKeyword.value.trim() }
    })
  }
}

// 处理分类点击
const handleCategoryClick = (categoryId) => {
  router.push({
    path: `/category/${categoryId}`
  })
}

// 进入编辑页面
const goToEdit = () => {
  router.push('/edit')
}

// 进入模拟面试页面
const goToMockInterview = () => {
  router.push('/mock-interview')
}
</script>

<template>
  <div class="home-container">
    <div class="header">
      <h1 class="title">Java面试助手</h1>
      <div class="header-actions">
        <p class="subtitle">快速查找Java相关面试题及答案</p>
        <div class="action-buttons">
          <el-button type="primary" class="edit-button" size="small" @click="goToEdit">
            <el-icon>
              <Edit />
            </el-icon>
            编辑面试题
          </el-button>
          <el-button type="success" class="mock-interview-button" size="small" @click="goToMockInterview">
            <el-icon>
              <Microphone />
            </el-icon>
            模拟面试
          </el-button>
        </div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-container">
      <el-input v-model="searchKeyword" placeholder="输入关键词搜索面试题..." class="search-input" @keyup.enter="handleSearch"
        size="small">
        <template #append>
          <el-button @click="handleSearch" size="small">
            <el-icon>
              <Search />
            </el-icon>
            搜索
          </el-button>
        </template>
      </el-input>
    </div>

    <!-- 分类菜单 -->
    <div class="category-section">
      <h2 class="section-title">面试题分类</h2>
      <div class="category-menu">
        <div v-for="category in categories" :key="category.id" class="category-item"
          @click="handleCategoryClick(category.id)">
          {{ category.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}

.title {
  font-size: 2rem;
  color: #409EFF;
  margin-bottom: 5px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.subtitle {
  font-size: 1rem;
  color: #606266;
}

.search-container {
  max-width: 600px;
  margin: 0 auto 30px;
}

.search-input {
  font-size: 0.95rem;
}

.section-title {
  font-size: 1.5rem;
  color: #303133;
  margin-bottom: 20px;
  text-align: center;
}

.category-section {
  margin: 0 auto;
  width: 100%;
  max-width: 800px;
}

.category-menu {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
}

.category-item {
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px 20px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  min-width: 120px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.category-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-color: #c6e2ff;
  color: #409EFF;
}

.edit-button {
  margin: 0;
}
</style>
