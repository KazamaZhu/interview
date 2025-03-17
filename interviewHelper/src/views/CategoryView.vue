<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categories, interviewQuestions } from '@/data/interviewData'

const route = useRoute()
const router = useRouter()

// 当前分类ID
const categoryId = computed(() => route.params.category)

// 当前分类信息
const currentCategory = computed(() => {
  return categories.find(cat => cat.id === categoryId.value) || { name: '未知分类' }
})

// 当前分类下的问题列表
const questions = computed(() => {
  return interviewQuestions[categoryId.value] || []
})

// 当前展开的问题ID
const expandedQuestionId = ref('')

// 搜索关键词
const searchKeyword = ref('')

// 搜索结果
const filteredQuestions = computed(() => {
  if (!searchKeyword.value.trim()) {
    return questions.value
  }

  const keyword = searchKeyword.value.toLowerCase()
  return questions.value.filter(question =>
    question.question.toLowerCase().includes(keyword) ||
    question.answer.toLowerCase().includes(keyword)
  )
})

// 获取当前选中的问题
const getCurrentQuestion = computed(() => {
  if (!expandedQuestionId.value) return null
  return filteredQuestions.value.find(q => q.id === expandedQuestionId.value)
})

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

// 全局搜索
const handleGlobalSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/search',
      query: { keyword: searchKeyword.value.trim() }
    })
  }
}

// 添加一个新函数用于编辑当前问题
const editCurrentQuestion = () => {
  if (!getCurrentQuestion.value) return

  router.push({
    path: '/edit',
    query: {
      category: categoryId.value,
      question: expandedQuestionId.value
    }
  })
}
</script>

<template>
  <div class="category-view">
    <div class="page-layout">
      <!-- 左侧面板：包含头部、搜索和问题列表 -->
      <div class="left-panel">
        <div class="category-header">
          <el-button @click="goBack" type="primary" plain size="small">
            <el-icon>
              <Back />
            </el-icon>
            返回首页
          </el-button>
          <h1>{{ currentCategory.name }}</h1>
        </div>

        <!-- 搜索栏 -->
        <div class="search-container">
          <el-input v-model="searchKeyword" placeholder="在当前分类中搜索..." class="search-input" size="small" clearable>
            <template #append>
              <el-button @click="handleGlobalSearch" size="small" type="primary">
                <el-icon>
                  <Search />
                </el-icon>
                全局搜索
              </el-button>
            </template>
          </el-input>
        </div>

        <div class="result-count" v-if="searchKeyword.trim() && filteredQuestions.length > 0">
          找到 {{ filteredQuestions.length }} 条结果
        </div>

        <!-- 问题列表 -->
        <div class="questions-list" v-if="filteredQuestions.length > 0">
          <div class="question-grid">
            <div v-for="question in filteredQuestions" :key="question.id" class="question-item"
              :class="{ 'active': expandedQuestionId === question.id }" @click="toggleQuestion(question.id)">
              <div class="question-card">
                <h3>{{ question.question }}</h3>
                <el-icon class="expand-icon" :class="{ 'is-expanded': expandedQuestionId === question.id }">
                  <ArrowDown />
                </el-icon>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <el-empty :description="searchKeyword.trim() ? '未找到匹配的面试题' : '该分类下暂无面试题'" />
        </div>
      </div>

      <!-- 右侧面板：显示答案 -->
      <div class="right-panel">
        <div v-if="expandedQuestionId && getCurrentQuestion" class="answer-container">
          <div class="answer-header">
            <h3>问题详情</h3>
            <el-button @click="editCurrentQuestion" type="primary" size="small" plain>
              <el-icon>
                <Edit />
              </el-icon>
              编辑
            </el-button>
          </div>
          <div class="answer-content">
            <div class="question-title">{{ getCurrentQuestion.question }}</div>
            <div class="divider"></div>
            <div class="answer" v-html="getCurrentQuestion.answer.replace(/\n/g, '<br>')"></div>
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
.category-view {
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

.category-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.category-header h1 {
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

.result-count {
  margin-bottom: 10px;
  color: #606266;
  font-size: 0.9rem;
}

.questions-list {
  flex: 1;
  overflow-y: auto;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.question-item {
  width: 100%;
}

.question-card {
  background-color: #fff;
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  height: 100%;
}

.question-item.active .question-card {
  border-left: 3px solid #409EFF;
  background-color: #f0f7ff;
}

.question-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
}

.question-card h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #303133;
  line-height: 1.3;
  flex: 1;
  word-break: break-word;
}

.expand-icon {
  font-size: 1.1rem;
  transition: transform 0.3s;
  flex-shrink: 0;
  margin-left: 10px;
  margin-top: 3px;
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
  .question-grid {
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