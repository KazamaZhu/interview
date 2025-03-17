<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPoints } from '@/utils/PointsManager'
import SignInCard from '@/components/SignInCard.vue'
import SlotMachine from '@/components/SlotMachine.vue'
import PointsCard from '@/components/PointsCard.vue'
import { categories } from '@/data/interviewData'
import PointsInput from '@/components/PointsInput.vue'

const router = useRouter()
const searchKeyword = ref('')
const pointsRefreshTrigger = ref(0)

// 对话框显示状态
const signInDialogVisible = ref(false)
const slotMachineDialogVisible = ref(false)
const pointsDialogVisible = ref(false)
const showPointsInputDialog = ref(false)

// 当前积分
const currentPoints = ref(0)

// 处理搜索
const handleSearch = () => {
  if (!searchKeyword.value || !searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  console.log('首页搜索关键词:', searchKeyword.value)

  // 使用简单的路径跳转，避免命名路由可能的问题
  router.push({
    path: '/search',
    query: { keyword: searchKeyword.value.trim() }
  }).catch(err => {
    console.error('导航失败:', err)
    // 如果路由导航失败，尝试直接刷新页面
    window.location.href = `/search?keyword=${encodeURIComponent(searchKeyword.value.trim())}`
  })
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

// 刷新积分显示
const refreshPoints = () => {
  pointsRefreshTrigger.value += 1
  currentPoints.value = getPoints()
}

// 显示签到对话框
const showSignInDialog = () => {
  signInDialogVisible.value = true
}

// 显示老虎机对话框
const showSlotMachineDialog = () => {
  slotMachineDialogVisible.value = true
}

// 显示积分对话框
const showPointsDialog = () => {
  pointsDialogVisible.value = true
  refreshPoints()
}

// 显示积分输入对话框
const showPointsInputDialogFunc = () => {
  showPointsInputDialog.value = true
}

// 组件挂载时获取积分
onMounted(() => {
  refreshPoints()
})
</script>

<template>
  <div class="home-container">
    <div class="header">
      <h1 class="title">Java面试助手</h1>
      <div class="header-actions">
        <p class="subtitle">快速查找Java相关面试题及答案</p>
      </div>
    </div>

    <!-- 右上角功能区 -->
    <div class="top-right-features">
      <div class="points-display" @click="showPointsDialog">
        <el-icon>
          <Coin />
        </el-icon>
        <span class="points-value">{{ currentPoints }}</span>
        <span class="points-label">积分</span>
      </div>

      <div class="feature-buttons">
        <el-button type="primary" @click="showSignInDialog" class="feature-button">
          <el-icon>
            <Calendar />
          </el-icon>
          每日签到
        </el-button>

        <el-button type="success" @click="showSlotMachineDialog" class="feature-button">
          <el-icon>
            <Trophy />
          </el-icon>
          幸运老虎机
        </el-button>

        <el-button type="info" @click="showPointsInputDialogFunc" class="feature-button">
          <el-icon>
            <Edit />
          </el-icon>
          设置积分
        </el-button>
      </div>
    </div>

    <!-- 主要操作按钮 -->
    <div class="main-actions">
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

    <!-- 对话框 -->
    <!-- 签到对话框 -->
    <el-dialog v-model="signInDialogVisible" title="每日签到" width="400px" destroy-on-close>
      <SignInCard :onPointsChange="refreshPoints" />
    </el-dialog>

    <!-- 老虎机对话框 -->
    <el-dialog v-model="slotMachineDialogVisible" title="幸运老虎机" width="450px" destroy-on-close>
      <SlotMachine :onPointsChange="refreshPoints" />
    </el-dialog>

    <!-- 积分详情对话框 -->
    <el-dialog v-model="pointsDialogVisible" title="我的积分" width="400px" destroy-on-close>
      <PointsCard :refreshTrigger="pointsRefreshTrigger" />
      <div class="points-info">
        <h4>如何获取积分?</h4>
        <ul>
          <li>每日签到: 20积分</li>
          <li>回答模拟面试题: 每题10积分</li>
          <li>编辑题目: 20积分</li>
          <li>添加题目: 20积分</li>
          <li>参与老虎机游戏: 有机会赢取高额积分</li>
        </ul>

        <h4>积分用途</h4>
        <ul>
          <li>参与老虎机游戏</li>
          <li>更多功能即将开放...</li>
        </ul>
      </div>
    </el-dialog>

    <!-- 积分输入对话框 -->
    <el-dialog v-model="showPointsInputDialog" title="设置积分" width="400px" center>
      <PointsInput @points-changed="refreshPoints" />
    </el-dialog>
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
  position: relative;
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

.subtitle {
  font-size: 1rem;
  color: #606266;
}

/* 右上角功能区 */
.top-right-features {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 10;
}

.points-display {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
  background-color: #f5f7fa;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.points-display:hover {
  background-color: #ecf5ff;
}

.points-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #F56C6C;
}

.points-label {
  font-size: 0.9rem;
  color: #909399;
}

.feature-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.feature-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 主要操作按钮 */
.main-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
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

/* 积分信息样式 */
.points-info {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}

.points-info h4 {
  font-size: 1rem;
  color: #303133;
  margin: 15px 0 10px;
}

.points-info ul {
  padding-left: 20px;
  margin: 0 0 15px;
}

.points-info li {
  color: #606266;
  margin-bottom: 5px;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .top-right-features {
    position: static;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
  }

  .feature-buttons {
    width: 100%;
    justify-content: center;
  }
}
</style>
