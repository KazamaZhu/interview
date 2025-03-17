<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categories, interviewQuestions } from '@/data/interviewData'
import { ElMessage } from 'element-plus'

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

// 添加加载状态
const isLoading = ref(false)

// 直接在组件挂载时执行一次搜索
onMounted(() => {
  console.log('搜索页面已挂载，路由参数:', route.query)

  // 从URL获取搜索关键词
  if (route.query.keyword) {
    keyword.value = route.query.keyword.toString()
    console.log('从URL获取到关键词:', keyword.value)

    // 延迟执行搜索，确保组件完全挂载
    setTimeout(() => {
      performSearch()
    }, 100)
  }
})

// 监听路由参数变化
watch(
  () => route.query.keyword,
  (newKeyword) => {
    console.log('路由参数变化，新关键词:', newKeyword)

    if (newKeyword) {
      keyword.value = newKeyword.toString()
      performSearch()
    } else {
      // 如果没有关键词参数，清空搜索结果
      keyword.value = ''
      searchResults.value = []
    }
  }
)

// 执行搜索
const performSearch = () => {
  console.log('执行搜索，关键词:', keyword.value)

  if (!keyword.value || !keyword.value.trim()) {
    searchResults.value = []
    return
  }

  // 设置加载状态
  isLoading.value = true
  searchResults.value = []

  const results = []
  const searchTerm = keyword.value.toLowerCase().trim()

  console.log('搜索词:', searchTerm)
  console.log('分类数量:', Object.keys(interviewQuestions).length)
  let totalQuestions = 0

  try {
    // 遍历所有分类和问题
    Object.entries(interviewQuestions).forEach(([categoryId, questions]) => {
      if (!questions || !Array.isArray(questions)) {
        console.warn(`分类 ${categoryId} 下没有有效的问题数组`)
        return
      }

      const categoryName = categories.find(c => c.id === categoryId)?.name || categoryId

      // 累计问题总数
      totalQuestions += questions.length
      console.log(`分类 ${categoryId} 有 ${questions.length} 个问题`)

      // 检查分类名称是否匹配搜索词
      const categoryNameMatch = categoryName.toLowerCase().includes(searchTerm);

      questions.forEach(question => {
        // 在问题和答案中搜索关键词
        const questionText = question.question ? question.question.toLowerCase() : '';
        const answerText = question.answer ? question.answer.toLowerCase() : '';

        // 检查是否匹配
        const questionMatch = questionText.includes(searchTerm);
        const answerMatch = answerText.includes(searchTerm);
        const idMatch = question.id.toLowerCase().includes(searchTerm);

        // 如果分类名称、问题ID、问题内容或答案内容匹配搜索词，则添加到结果中
        if (categoryNameMatch || idMatch || questionMatch || answerMatch) {
          console.log(`匹配到问题: ${question.id}, 分类匹配: ${categoryNameMatch}, ID匹配: ${idMatch}, 问题匹配: ${questionMatch}, 答案匹配: ${answerMatch}`);

          results.push({
            ...question,
            categoryId,
            categoryName
          });
        }
      })
    })

    searchResults.value = results
    console.log(`搜索完成，找到 ${results.length} 条结果，总问题数: ${totalQuestions}`)

    if (results.length === 0) {
      ElMessage.info(`未找到包含 "${keyword.value}" 的面试题`)
    }
  } catch (error) {
    console.error('搜索过程中发生错误:', error)
    ElMessage.error('搜索过程中发生错误，请稍后重试')
  } finally {
    // 无论成功失败，都结束加载状态
    isLoading.value = false
  }
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
    <div class="search-header">
      <el-button @click="goBack" type="primary" plain>
        <el-icon>
          <ArrowLeft />
        </el-icon> 返回首页
      </el-button>
      <div class="search-input-container">
        <el-input v-model="keyword" placeholder="输入关键词搜索面试题" @keyup.enter="handleSearch" clearable>
          <template #append>
            <el-button :loading="isLoading" @click="handleSearch">
              <el-icon>
                <Search />
              </el-icon>
              搜索
            </el-button>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- 搜索结果 -->
    <div v-else-if="searchResults.length > 0" class="search-results">
      <div class="results-header">
        <h2>搜索结果 ({{ searchResults.length }})</h2>
      </div>
      <div class="results-list">
        <div v-for="result in searchResults" :key="result.id" class="result-item">
          <div class="result-header" @click="toggleQuestion(result.id)">
            <div class="result-title">
              <span class="category-tag" @click.stop="goToCategory(result.categoryId)">
                {{ result.categoryName }}
              </span>
              <span class="question-text">{{ result.question }}</span>
            </div>
            <el-icon class="expand-icon" :class="{ expanded: expandedQuestionId === result.id }">
              <ArrowDown />
            </el-icon>
          </div>
          <div v-if="expandedQuestionId === result.id" class="result-content">
            <div class="answer" v-html="result.answer"></div>
            <div class="result-actions">
              <el-button type="primary" size="small" @click="editCurrentResult">
                编辑此题
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无搜索结果 -->
    <div v-else-if="keyword" class="no-results">
      <el-empty description="未找到相关面试题">
        <template #description>
          <p>未找到包含 "{{ keyword }}" 的面试题，请尝试其他关键词</p>
        </template>
      </el-empty>

      <!-- 调试信息 -->
      <div class="debug-info">
        <h3>调试信息</h3>
        <p>搜索词: {{ keyword }}</p>
        <p>路由参数: {{ JSON.stringify(route.query) }}</p>
        <p>分类总数: {{ Object.keys(interviewQuestions).length }}</p>
        <p>Redis分类问题数: {{ interviewQuestions['redis']?.length || '未找到Redis分类' }}</p>
        <p>Redis第一个问题: {{ interviewQuestions['redis']?.[0]?.question || '无' }}</p>
      </div>
    </div>

    <!-- 初始状态 -->
    <div v-else class="initial-state">
      <el-empty description="请输入关键词搜索面试题">
        <template #description>
          <p>在上方输入框中输入关键词，按回车或点击搜索按钮开始搜索</p>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<style scoped>
.search-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
}

.search-input-container {
  flex: 1;
}

.loading-container {
  padding: 20px;
}

.results-header {
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.result-item {
  margin-bottom: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f9f9f9;
  cursor: pointer;
}

.result-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.category-tag {
  background-color: #409eff;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.question-text {
  font-weight: 500;
}

.expand-icon {
  transition: transform 0.3s;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.result-content {
  padding: 15px;
  border-top: 1px solid #eee;
}

.answer {
  white-space: pre-wrap;
  line-height: 1.6;
}

.result-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.no-results,
.initial-state {
  padding: 40px 0;
  text-align: center;
}

.debug-info {
  margin-top: 30px;
  text-align: left;
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 8px;
  border: 1px dashed #ccc;
  font-family: monospace;
  font-size: 14px;
}

.debug-info h3 {
  margin-top: 0;
  color: #e6a23c;
}
</style>