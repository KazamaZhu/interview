<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPoints } from '@/utils/PointsManager'
import SignInCard from '@/components/SignInCard.vue'
import SlotMachine from '@/components/SlotMachine.vue'
import PointsCard from '@/components/PointsCard.vue'
import { categories, interviewQuestions } from '@/data/interviewData'
import PointsInput from '@/components/PointsInput.vue'
import DataManagerUI from '@/components/DataManagerUI.vue'
import { getCurrentData } from '@/utils/DataManager'

const router = useRouter()
const route = useRoute()
const searchKeyword = ref('')
const pointsRefreshTrigger = ref(0)
const isSearching = ref(false)

// 对话框显示状态
const signInDialogVisible = ref(false)
const slotMachineDialogVisible = ref(false)
const pointsDialogVisible = ref(false)
const showPointsInputDialog = ref(false)
const dataManagerDialogVisible = ref(false)

// 当前积分
const currentPoints = ref(0)

// 从localStorage获取最新的数据
const latestData = ref(null)

// 安全地获取分类列表
const safeCategories = computed(() => {
  if (latestData.value && Array.isArray(latestData.value.categories)) {
    return latestData.value.categories
  }
  return categories || []
})

// 获取每个分类下的问题数量
const getQuestionCount = (category) => {
  // 优先使用本地最新数据
  if (latestData.value && latestData.value.interviewQuestions && latestData.value.interviewQuestions[category]) {
    return latestData.value.interviewQuestions[category].length || 0
  }
  // 否则使用导入的数据
  return interviewQuestions[category]?.length || 0
}

// 加载最新数据
const loadLatestData = () => {
  try {
    const data = getCurrentData()
    if (data) {
      latestData.value = data
    } else {
      console.warn('getCurrentData返回空数据')
      latestData.value = { categories: [...categories], interviewQuestions: { ...interviewQuestions } }
    }
  } catch (error) {
    console.error('加载最新数据失败:', error)
    // 失败时使用默认数据
    latestData.value = { categories: [...categories], interviewQuestions: { ...interviewQuestions } }
  }
}

// 处理搜索
const handleSearch = () => {
  // 记录日志
  console.log('首页搜索关键词:', searchKeyword.value)

  // 检查关键词是否为空
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  isSearching.value = true

  // 使用路由导航到搜索页面
  try {
    router.push(`/search?keyword=${encodeURIComponent(searchKeyword.value.trim())}`)
      .catch(err => {
        console.error('导航错误:', err)
        // 如果路由导航失败，尝试刷新页面导航
        window.location.href = `/#/search?keyword=${encodeURIComponent(searchKeyword.value.trim())}`
      })
      .finally(() => {
        isSearching.value = false
      })
  } catch (error) {
    console.error('搜索处理错误:', error)
    isSearching.value = false
    ElMessage.error('搜索过程中发生错误')
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

// 显示数据管理对话框
const showDataManagerDialog = () => {
  dataManagerDialogVisible.value = true
}

// 组件挂载时获取积分和最新数据
onMounted(() => {
  // 确保数据加载
  refreshPoints()

  // 确保latestData有默认值，防止模板渲染错误
  if (!latestData.value) {
    latestData.value = { categories: [...categories], interviewQuestions: { ...interviewQuestions } }
  }

  // 然后尝试加载最新数据
  loadLatestData()

  // 增加一个额外的安全检查，确保数据已加载
  setTimeout(() => {
    console.log('执行延迟数据加载检查')
    if (!latestData.value || !latestData.value.categories) {
      console.warn('延迟加载数据')
      latestData.value = { categories: [...categories], interviewQuestions: { ...interviewQuestions } }
      loadLatestData()
    }
  }, 300)

  // 检查URL中是否有错误信息
  if (route.query.error === 'category_not_found' && route.query.category) {
    ElMessage.error({
      message: `分类 "${route.query.category}" 不存在或已被删除，请检查分类名称。`,
      duration: 0,  // 不自动关闭
      showClose: true
    })
  }
})

// 创建一个强制刷新方法，可以在需要时调用
const forceRefresh = () => {
  console.log('强制刷新首页数据')
  refreshPoints()
  loadLatestData()
}

// 监听路由进入，确保每次回到首页都刷新数据
const handleRouteEnter = (to, from) => {
  if (to.name === 'home') {
    console.log('回到首页，刷新数据')
    nextTick(() => {
      forceRefresh()
    })
  }
}

// 注册路由守卫
router.beforeEach(handleRouteEnter)
</script>

<template>
  <div class="home">
    <!-- 顶部搜索框 -->
    <div class="search-box">
      <el-input v-model="searchKeyword" placeholder="请输入关键词搜索面试题..." class="search-input" @keyup.enter="handleSearch"
        clearable>
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
        <template #append>
          <el-button @click="handleSearch" :loading="isSearching">
            <el-icon v-if="!isSearching">
              <Search />
            </el-icon>
            <span>搜索</span>
          </el-button>
        </template>
      </el-input>
    </div>

    <!-- 分类展示 -->
    <div class="categories-container">
      <h2 class="category-title">
        <el-icon>
          <CollectionTag />
        </el-icon>
        <span>面试题分类</span>
      </h2>
      <div class="categories">
        <router-link v-for="category in safeCategories" :key="category" :to="{ name: 'category', params: { category } }"
          class="category-card">
          <el-card shadow="hover">
            <div class="category-content">
              <h3>{{ category }}</h3>
              <span class="question-count">
                {{ getQuestionCount(category) }} 题
              </span>
            </div>
          </el-card>
        </router-link>
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
      <el-button type="info" class="data-manager-button" size="small" @click="showDataManagerDialog">
        <el-icon>
          <DataLine />
        </el-icon>
        数据管理
      </el-button>
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

    <!-- 数据管理对话框 -->
    <el-dialog v-model="dataManagerDialogVisible" title="数据管理" width="600px" destroy-on-close>
      <DataManagerUI />
    </el-dialog>
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-box {
  margin-bottom: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.search-input {
  width: 100%;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  color: #409EFF;
}

.categories {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.category-card {
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s;
}

.category-card:hover {
  transform: translateY(-5px);
}

.category-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

.category-content h3 {
  margin: 0;
  margin-bottom: 10px;
  color: #303133;
}

.question-count {
  font-size: 14px;
  color: #909399;
}

@media (max-width: 768px) {
  .categories {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .category-content {
    min-height: 80px;
  }
}

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

.main-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.edit-button,
.mock-interview-button,
.data-manager-button {
  margin: 0;
}

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
