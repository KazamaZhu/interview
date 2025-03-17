<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categories, interviewQuestions } from '@/data/interviewData'

const route = useRoute()
const router = useRouter()

// 搜索关键词
const keyword = ref('')

// 当前展开的问题ID
const expandedQuestionId = ref('')

// 搜索结果
const searchResults = ref([])

// 获取当前选中的结果
const getCurrentResult = computed(() => {
  if (!expandedQuestionId.value) return null
  return searchResults.value.find(r => r.id === expandedQuestionId.value)
})

// 监听路由参数变化
watch(
  () => route.query.keyword,
  (newKeyword) => {
    if (newKeyword) {
      keyword.value = newKeyword
      performSearch()
    }
  },
  { immediate: true }
)

// 执行搜索
const performSearch = () => {
  if (!keyword.value.trim()) {
    searchResults.value = []
    return
  }

  const results = []
  const searchTerm = keyword.value.toLowerCase()

  // 遍历所有分类和问题
  Object.entries(interviewQuestions).forEach(([categoryId, questions]) => {
    const categoryName = categories.find(c => c.id === categoryId)?.name || categoryId

    questions.forEach(question => {
      // 在问题和答案中搜索关键词
      if (
        question.question.toLowerCase().includes(searchTerm) ||
        question.answer.toLowerCase().includes(searchTerm)
      ) {
        results.push({
          ...question,
          categoryId,
          categoryName
        })
      }
    })
  })

  searchResults.value = results
}

// 切换问题展开状态
const toggleQuestion = (questionId) => {
  if (expandedQuestionId.value === questionId) {
    expandedQuestionId.value = ''
  } else {
    expandedQuestionId.value = questionId
  }
}

// 返回首页
const goBack = () => {
  router.push('/')
}

// 前往分类页面
const goToCategory = (categoryId) => {
  router.push(`/category/${categoryId}`)
}

// 处理搜索
const handleSearch = () => {
  performSearch()
  // 更新URL，但不触发路由变化
  router.replace({
    query: { keyword: keyword.value }
  })
}

// 添加一个新函数用于编辑当前问题
const editCurrentResult = () => {
  if (!getCurrentResult.value) return

  router.push({
    path: '/edit',
    query: {
      category: getCurrentResult.value.categoryId,
      question: expandedQuestionId.value
    }
  })
}
</script>

<template>
  <div class="search-view">
    <div class="page-layout">
      <!-- 左侧面板：包含头部、搜索和结果列表 -->
      <div class="left-panel">
        <div class="search-header">
          <el-button @click="goBack" type="primary" plain size="small">
            <el-icon>
              <Back />
            </el-icon>
            返回首页
          </el-button>
          <h1>搜索结果</h1>
        </div>

        <div class="search-container">
          <el-input v-model="keyword" placeholder="输入关键词搜索面试题..." class="search-input" @keyup.enter="handleSearch"
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

        <div v-if="searchResults.length > 0" class="search-content">
          <div class="result-count">
            找到 {{ searchResults.length }} 条结果
          </div>

          <!-- 搜索结果列表 -->
          <div class="results-list">
            <div class="result-grid">
              <div v-for="result in searchResults" :key="result.id" class="result-item"
                :class="{ 'active': expandedQuestionId === result.id }" @click="toggleQuestion(result.id)">
                <div class="result-card">
                  <div class="result-category" @click.stop="goToCategory(result.categoryId)">
                    <el-tag size="small">{{ result.categoryName }}</el-tag>
                  </div>
                  <h3>{{ result.question }}</h3>
                  <el-icon class="expand-icon" :class="{ 'is-expanded': expandedQuestionId === result.id }">
                    <ArrowDown />
                  </el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="keyword" class="empty-state">
          <el-empty description="未找到匹配的面试题" />
        </div>

        <div v-else class="empty-state">
          <el-empty description="请输入关键词进行搜索" />
        </div>
      </div>

      <!-- 右侧面板：显示答案 -->
      <div class="right-panel">
        <div v-if="expandedQuestionId && getCurrentResult" class="answer-container">
          <div class="answer-header">
            <h3>问题详情</h3>
            <el-button @click="editCurrentResult" type="primary" size="small" plain>
              <el-icon>
                <Edit />
              </el-icon>
              编辑
            </el-button>
          </div>
          <div class="answer-content">
            <div class="category-tag">
              <el-tag size="small" @click="goToCategory(getCurrentResult.categoryId)">
                {{ getCurrentResult.categoryName }}
              </el-tag>
            </div>
            <div class="question-title">{{ getCurrentResult.question }}</div>
            <div class="divider"></div>
            <div class="answer" v-html="getCurrentResult.answer.replace(/\n/g, '<br>')"></div>
          </div>
        </div>
        <div v-else class="empty-answer">
          <div class="empty-content">
            <el-icon class="empty-icon">
              <Document />
            </el-icon>
            <p>请选择一个问题查看答案</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-view {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.page-layout {
  display: flex;
  gap: 20px;
  min-height: calc(100vh - 40px);
}

/* 左侧面板样式 */
.left-panel {
  width: 60%;
  display: flex;
  flex-direction: column;
}

/* 右侧面板样式 */
.right-panel {
  width: 40%;
  position: sticky;
  top: 20px;
  height: auto;
  min-height: 500px;
  max-height: calc(100vh - 40px);
  border-radius: 8px;
  border: 1px solid #EBEEF5;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.search-header h1 {
  margin: 0 0 0 15px;
  font-size: 1.6rem;
  color: #409EFF;
}

.search-container {
  margin-bottom: 20px;
}

.search-input {
  font-size: 0.95rem;
}

.search-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.result-count {
  margin-bottom: 10px;
  color: #606266;
  font-size: 0.9rem;
}

.results-list {
  flex: 1;
  overflow-y: auto;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.result-item {
  width: 100%;
}

.result-card {
  background-color: #fff;
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

.result-item.active .result-card {
  border-left: 3px solid #409EFF;
  background-color: #f0f7ff;
}

.result-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
}

.result-category {
  cursor: pointer;
}

.result-card h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #303133;
  line-height: 1.3;
  word-break: break-word;
}

.expand-icon {
  font-size: 1.1rem;
  transition: transform 0.3s;
  align-self: flex-end;
}

.expand-icon.is-expanded {
  transform: rotate(180deg);
}

.answer-header {
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #EBEEF5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.answer-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #303133;
  font-weight: 600;
}

.answer-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
}

.answer-content {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.category-tag {
  margin-bottom: 16px;
  width: 100%;
}

.question-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  line-height: 1.4;
  width: 100%;
}

.divider {
  height: 1px;
  background-color: #EBEEF5;
  margin-bottom: 16px;
  width: 100%;
}

.answer {
  color: #303133;
  line-height: 1.7;
  font-size: 1rem;
  letter-spacing: 0.3px;
  white-space: normal;
  word-break: normal;
  overflow-wrap: normal;
  width: 100%;
  min-width: 80%;
  box-sizing: border-box;
}

.answer br {
  margin-bottom: 10px;
  display: block;
}

.empty-answer {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.empty-content {
  text-align: center;
  color: #909399;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 10px;
  color: #DCDFE6;
}

.empty-state {
  margin-top: 50px;
  text-align: center;
}

@media (max-width: 992px) {
  .result-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-layout {
    flex-direction: column;
  }

  .left-panel,
  .right-panel {
    width: 100%;
  }

  .right-panel {
    margin-top: 20px;
    min-height: 500px;
    height: auto;
    position: static;
  }
}
</style>