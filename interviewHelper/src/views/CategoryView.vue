<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categories, interviewQuestions } from '@/data/interviewData'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  addInterviewQuestion, 
  updateInterviewQuestion, 
  deleteInterviewQuestion, 
  getCurrentData,
  moveInterviewQuestion,
  saveCustomData
} from '@/utils/DataManager'

const route = useRoute()
const router = useRouter()

// 用于触发刷新的标志
const refreshTrigger = ref(0)

// 当前分类
const currentCategory = computed(() => route.params.category)

// 本地存储的问题
const localQuestions = ref([])

// 当前分类的问题列表
const questions = computed(() => {
  // 优先使用本地加载的最新数据
  if (localQuestions.value.length > 0) {
    return localQuestions.value
  }
  // 否则使用导入的数据
  return interviewQuestions[currentCategory.value] || []
})

// 加载最新数据
const loadLatestData = () => {
  try {
    const data = getCurrentData()
    if (data && data.interviewQuestions && data.interviewQuestions[currentCategory.value]) {
      localQuestions.value = data.interviewQuestions[currentCategory.value]
    } else {
      localQuestions.value = []
    }
    refreshTrigger.value++
  } catch (error) {
    console.error('加载最新数据失败:', error)
    localQuestions.value = []
  }
}

// 显示问题的答案
const visibleAnswers = ref(new Set())

// 切换答案显示状态
const toggleAnswer = (index) => {
  if (visibleAnswers.value.has(index)) {
    visibleAnswers.value.delete(index)
  } else {
    visibleAnswers.value.add(index)
  }
}

// 收起所有答案
const collapseAllAnswers = () => {
  // 清空所有可见答案
  visibleAnswers.value.clear()
  // 移除成功提示
}

// 检查分类是否存在
const categoryExists = computed(() => {
  // 从当前数据中获取最新的分类列表
  try {
    const data = getCurrentData()
    if (data && Array.isArray(data.categories)) {
      return data.categories.includes(currentCategory.value)
    }
  } catch (error) {
    console.error('检查分类存在性时出错:', error)
  }

  // 如果无法获取最新数据，则回退到导入的静态数据
  return categories.includes(currentCategory.value)
})

// 如果分类不存在，重定向到首页
onMounted(() => {
  // 立即同步检查分类是否存在
  if (!categoryExists.value) {
    ElMessage.error({
      message: `分类 "${currentCategory.value}" 不存在或已被删除`,
      duration: 5000 // 显示5秒
    })

    // 在重定向之前，确保我们使用了最新的数据
    loadLatestData()

    // 如果再次检查仍确认分类不存在，才重定向
    if (!categoryExists.value) {
      console.error(`分类 "${currentCategory.value}" 不存在，重定向到首页`)
      router.replace({
        name: 'home',
        query: { error: 'category_not_found', category: currentCategory.value }
      })
    }
  } else {
    // 加载最新数据
    loadLatestData()
  }
})

// 监听路由参数变化，刷新数据并检查分类存在性
watch(() => route.params.category, (newCategory) => {
  if (newCategory) {
    // 先加载最新数据
    loadLatestData()

    // 检查分类是否存在
    if (!categoryExists.value) {
      ElMessage.error({
        message: `分类 "${currentCategory.value}" 不存在或已被删除`,
        duration: 5000
      })
      router.replace({
        name: 'home',
        query: { error: 'category_not_found', category: currentCategory.value }
      })
    }
  }
})

// 返回首页
const goBack = () => {
  // 使用replace而不是push，可以避免路由堆栈问题
  // 并且使用name确保路由配置正确匹配
  router.replace({
    name: 'home',
    // 添加一个时间戳查询参数，确保视图重新渲染
    query: {
      t: Date.now()
    }
  }).catch(err => {
    console.error('导航错误:', err)
    // 使用后备方案直接跳转
    window.location.href = '/'
  })
}

// 编辑相关
const showEditForm = ref(false)
const editMode = ref('add') // 'add' 或 'edit'
const editIndex = ref(-1)
const editData = ref({
  question: '',
  answer: '',
  position: 'bottom' // 'top'表示置顶，'bottom'表示置底，默认置底
})

// 打开添加表单
const openAddForm = () => {
  editMode.value = 'add'
  editData.value = {
    question: '',
    answer: '',
    position: 'bottom' // 默认置底
  }
  showEditForm.value = true
}

// 打开编辑表单
const openEditForm = (index) => {
  editMode.value = 'edit'
  editIndex.value = index
  const question = questions.value[index]
  editData.value = {
    question: question.question,
    answer: question.answer,
    position: 'bottom' // 编辑时position不重要
  }
  showEditForm.value = true
}

// 保存问题
const saveQuestion = () => {
  // 验证表单
  if (!editData.value.question.trim()) {
    ElMessage.warning('问题不能为空')
    return
  }

  if (!editData.value.answer.trim()) {
    ElMessage.warning('答案不能为空')
    return
  }

  let success = false

  if (editMode.value === 'add') {
    // 获取当前数据
    const data = getCurrentData()
    
    // 检查分类是否存在，不存在则添加
    if (!data.categories.includes(currentCategory.value)) {
      data.categories.push(currentCategory.value)
    }
    
    // 确保该分类的问题数组存在
    if (!data.interviewQuestions[currentCategory.value]) {
      data.interviewQuestions[currentCategory.value] = []
    }
    
    // 创建新问题
    const newQuestion = {
      question: editData.value.question,
      answer: editData.value.answer
    }
    
    // 根据选择的位置添加问题
    if (editData.value.position === 'top') {
      // 添加到顶部
      data.interviewQuestions[currentCategory.value].unshift(newQuestion)
      ElMessage.success('问题已添加到顶部')
    } else {
      // 添加到底部
      data.interviewQuestions[currentCategory.value].push(newQuestion)
      ElMessage.success('问题已添加到底部')
    }
    
    // 保存数据
    success = saveCustomData(data)
  } else {
    // 更新问题
    success = updateInterviewQuestion(
      currentCategory.value,
      editIndex.value,
      editData.value.question,
      editData.value.answer
    )
  }

  if (success) {
    showEditForm.value = false
    // 重新加载最新数据
    loadLatestData()

    // 如果是新添加的问题，自动显示其答案
    if (editMode.value === 'add') {
      setTimeout(() => {
        // 根据添加位置设置可见答案
        const index = editData.value.position === 'top' ? 0 : localQuestions.value.length - 1
        visibleAnswers.value.add(index)
      }, 100)
    }
  }
}

// 删除问题
const confirmDelete = (index) => {
  ElMessageBox.confirm(
    '确定要删除这个问题吗？此操作不可撤销。',
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const success = deleteInterviewQuestion(currentCategory.value, index)
    if (success) {
      visibleAnswers.value.delete(index)

      // 重新加载最新数据
      loadLatestData()

      // 更新可见答案的索引
      const newVisibleAnswers = new Set()
      visibleAnswers.value.forEach(oldIndex => {
        if (oldIndex > index) {
          newVisibleAnswers.add(oldIndex - 1)
        } else if (oldIndex < index) {
          newVisibleAnswers.add(oldIndex)
        }
      })
      visibleAnswers.value = newVisibleAnswers
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 移动问题位置（向上）
const moveQuestionUp = (index) => {
  if (index <= 0) return // 已经是第一个，无法上移
  
  const success = moveInterviewQuestion(currentCategory.value, index, index - 1)
  if (success) {
    // 更新可见答案的索引
    if (visibleAnswers.value.has(index) || visibleAnswers.value.has(index - 1)) {
      const newVisibleAnswers = new Set()
      visibleAnswers.value.forEach(visibleIndex => {
        if (visibleIndex === index) {
          newVisibleAnswers.add(index - 1)
        } else if (visibleIndex === index - 1) {
          newVisibleAnswers.add(index)
        } else {
          newVisibleAnswers.add(visibleIndex)
        }
      })
      visibleAnswers.value = newVisibleAnswers
    }
    
    // 重新加载最新数据
    loadLatestData()
  }
}

// 移动问题位置（向下）
const moveQuestionDown = (index) => {
  // 检查是否已经是最后一个问题
  if (index >= questions.value.length - 1) return // 已经是最后一个，无法下移
  
  const success = moveInterviewQuestion(currentCategory.value, index, index + 1)
  if (success) {
    // 更新可见答案的索引
    if (visibleAnswers.value.has(index) || visibleAnswers.value.has(index + 1)) {
      const newVisibleAnswers = new Set()
      visibleAnswers.value.forEach(visibleIndex => {
        if (visibleIndex === index) {
          newVisibleAnswers.add(index + 1)
        } else if (visibleIndex === index + 1) {
          newVisibleAnswers.add(index)
        } else {
          newVisibleAnswers.add(visibleIndex)
        }
      })
      visibleAnswers.value = newVisibleAnswers
    }
    
    // 重新加载最新数据
    loadLatestData()
  }
}
</script>

<template>
  <div class="category-view" v-if="categoryExists">
    <div class="category-header">
      <el-button @click="goBack" size="small" type="default">
        <el-icon>
          <ArrowLeft />
        </el-icon>
        返回
      </el-button>

      <h1 class="category-title">{{ currentCategory }}</h1>

      <div class="action-buttons">
        <el-button @click="collapseAllAnswers" size="small" type="info" class="collapse-button">
          <el-icon>
            <CaretTop />
          </el-icon>
          全部收起
        </el-button>

        <el-button @click="openAddForm" size="small" type="primary">
          <el-icon>
            <Plus />
          </el-icon>
          添加问题
        </el-button>
      </div>
    </div>

    <div class="questions-container">
      <el-empty v-if="questions.length === 0" description="此分类下暂无面试题">
        <el-button type="primary" @click="openAddForm">添加第一个问题</el-button>
      </el-empty>

      <div v-for="(question, index) in questions" :key="index" class="question-item">
        <div class="question-header">
          <h3 class="question-title">
            <span class="question-index">{{ index + 1 }}.</span>
            {{ question.question }}
          </h3>

          <div class="question-actions">
            <el-button @click="openEditForm(index)" size="small" type="primary" text>
              <el-icon>
                <Edit />
              </el-icon>
            </el-button>

            <el-button @click="confirmDelete(index)" size="small" type="danger" text>
              <el-icon>
                <Delete />
              </el-icon>
            </el-button>

            <!-- 上移按钮 -->
            <el-button 
              v-if="index > 0" 
              @click="moveQuestionUp(index)" 
              size="small" 
              type="warning" 
              text
              title="上移问题"
            >
              <el-icon>
                <Top />
              </el-icon>
            </el-button>

            <!-- 下移按钮 -->
            <el-button 
              v-if="index < questions.length - 1" 
              @click="moveQuestionDown(index)" 
              size="small" 
              type="warning" 
              text
              title="下移问题"
            >
              <el-icon>
                <Bottom />
              </el-icon>
            </el-button>

            <el-button @click="toggleAnswer(index)" size="small" text>
              <el-icon v-if="visibleAnswers.has(index)">
                <ArrowUp />
              </el-icon>
              <el-icon v-else>
                <ArrowDown />
              </el-icon>
            </el-button>
          </div>
        </div>

        <div v-if="visibleAnswers.has(index)" class="answer-container">
          <pre class="answer-content">{{ question.answer }}</pre>
        </div>
      </div>
    </div>

    <!-- 编辑/添加表单对话框 -->
    <el-dialog v-model="showEditForm" :title="editMode === 'add' ? '添加问题' : '编辑问题'" width="70%" destroy-on-close>
      <el-form label-position="top">
        <el-form-item label="问题">
          <el-input v-model="editData.question" type="textarea" :rows="2" placeholder="请输入问题内容"></el-input>
        </el-form-item>

        <el-form-item label="答案">
          <el-input v-model="editData.answer" type="textarea" :rows="8" placeholder="请输入答案内容"></el-input>
        </el-form-item>
        
        <!-- 添加新问题时显示位置选择 -->
        <el-form-item v-if="editMode === 'add'" label="添加位置">
          <el-radio-group v-model="editData.position">
            <el-radio label="top">置顶 (添加到列表顶部)</el-radio>
            <el-radio label="bottom">置底 (添加到列表底部)</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditForm = false">取消</el-button>
          <el-button type="primary" @click="saveQuestion">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.category-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.category-title {
  margin: 0;
  font-size: 1.5rem;
  color: #409EFF;
  text-align: center;
  flex-grow: 1;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.collapse-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

.questions-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.question-item {
  border-bottom: 1px solid #ebeef5;
  padding: 15px 0;
}

.question-item:last-child {
  border-bottom: none;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.question-title {
  margin: 0;
  font-size: 1.1rem;
  color: #303133;
  flex-grow: 1;
  padding-right: 10px;
}

.question-index {
  color: #409EFF;
  font-weight: bold;
  margin-right: 8px;
}

.question-actions {
  display: flex;
  gap: 5px;
  white-space: nowrap;
}

/* 排序按钮样式 */
.question-item .el-button--warning {
  opacity: 0.3;
  transition: opacity 0.3s;
}

.question-item:hover .el-button--warning {
  opacity: 1;
}

.answer-container {
  margin-top: 15px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  overflow-x: auto;
}

.answer-content {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  line-height: 1.5;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .category-header {
    flex-direction: column;
    gap: 10px;
  }

  .action-buttons {
    width: 100%;
    justify-content: center;
  }

  .question-header {
    flex-direction: column;
    gap: 10px;
  }

  .question-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>