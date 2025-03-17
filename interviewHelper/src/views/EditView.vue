<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { categories, interviewQuestions } from '@/data/interviewData'
import { ElMessage, ElMessageBox } from 'element-plus'
import { addPoints } from '@/utils/PointsManager'

const router = useRouter()
const route = useRoute()

// 当前选中的分类
const selectedCategory = ref('')

// 当前选中的问题
const selectedQuestion = ref('')

// 编辑模式：'add'或'edit'
const editMode = ref('add')

// 表单数据
const form = reactive({
  id: '',
  question: '',
  answer: ''
})

// 表单规则
const rules = reactive({
  question: [
    { required: true, message: '请输入问题', trigger: 'blur' },
    { min: 3, max: 200, message: '长度在3到200个字符', trigger: 'blur' }
  ],
  answer: [
    { required: true, message: '请输入答案', trigger: 'blur' }
  ]
})

// 表单引用
const formRef = ref(null)

// 当前分类下的问题列表
const currentQuestions = computed(() => {
  if (!selectedCategory.value) return []
  return interviewQuestions[selectedCategory.value] || []
})

// 监听分类变化
const handleCategoryChange = () => {
  selectedQuestion.value = ''
  resetForm()
}

// 监听问题变化
const handleQuestionChange = () => {
  if (!selectedQuestion.value) {
    editMode.value = 'add'
    resetForm()
    return
  }

  editMode.value = 'edit'
  const question = currentQuestions.value.find(q => q.id === selectedQuestion.value)
  if (question) {
    form.id = question.id
    form.question = question.question
    form.answer = question.answer
  }
}

// 重置表单
const resetForm = () => {
  form.id = ''
  form.question = ''
  form.answer = ''
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid, fields) => {
    if (valid) {
      if (editMode.value === 'add') {
        addQuestion()
      } else {
        updateQuestion()
      }
    }
  })
}

// 添加问题
const addQuestion = () => {
  // 在实际应用中，这里会调用API保存数据
  // 由于这是静态应用，我们只显示一个成功消息

  // 生成一个新的ID
  const newId = `${selectedCategory.value}-${Date.now()}`

  // 添加积分奖励
  addPoints(20)

  ElMessage({
    type: 'success',
    message: '问题添加成功！获得20积分奖励。在实际应用中，这将保存到数据库。'
  })

  // 添加成功后返回首页
  router.push('/')
}

// 更新问题
const updateQuestion = () => {
  // 在实际应用中，这里会调用API更新数据
  // 由于这是静态应用，我们只显示一个成功消息

  // 添加积分奖励
  addPoints(20)

  ElMessage({
    type: 'success',
    message: '问题更新成功！获得20积分奖励。在实际应用中，这将更新到数据库。'
  })

  // 更新成功后返回首页
  router.push('/')
}

// 删除问题
const deleteQuestion = () => {
  if (!selectedQuestion.value) return

  ElMessageBox.confirm(
    '确定要删除这个问题吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // 在实际应用中，这里会调用API删除数据
      ElMessage({
        type: 'success',
        message: '问题删除成功！在实际应用中，这将从数据库中删除。'
      })
      selectedQuestion.value = ''
      resetForm()

      // 删除成功后返回首页
      router.push('/')
    })
    .catch(() => {
      // 取消删除
    })
}

// 返回首页
const goBack = () => {
  router.push('/')
}

// 全局搜索
const searchKeyword = ref('')
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/search',
      query: { keyword: searchKeyword.value.trim() }
    })
  }
}

// 监听路由参数变化，自动选择分类和问题
onMounted(async () => {
  // 如果URL中有分类和问题参数，自动选择
  if (route.query.category) {
    selectedCategory.value = route.query.category.toString();

    // 等待Vue更新DOM
    await nextTick();

    // 如果有问题ID参数，选择对应的问题
    if (route.query.question) {
      selectedQuestion.value = route.query.question.toString();

      // 手动触发问题变化处理函数，确保表单被正确填充
      await nextTick();
      handleQuestionChange();
    }
  }
});
</script>

<template>
  <div class="edit-view">
    <div class="edit-header">
      <el-button @click="goBack" type="primary" plain size="small">
        <el-icon>
          <Back />
        </el-icon>
        返回首页
      </el-button>
      <h1>编辑面试题</h1>
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

    <div class="edit-content">
      <div class="selector-container">
        <el-form :inline="true" size="small">
          <el-form-item label="选择分类">
            <el-select v-model="selectedCategory" placeholder="请选择分类" @change="handleCategoryChange" size="small">
              <el-option v-for="category in categories" :key="category.id" :label="category.name"
                :value="category.id" />
            </el-select>
          </el-form-item>

          <el-form-item label="选择问题" v-if="selectedCategory">
            <el-select v-model="selectedQuestion" placeholder="请选择问题或新建" @change="handleQuestionChange" clearable
              size="small">
              <el-option v-for="question in currentQuestions" :key="question.id" :label="question.question"
                :value="question.id" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <div class="form-container" v-if="selectedCategory">
        <h2>{{ editMode === 'add' ? '添加新问题' : '编辑问题' }}</h2>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="small" class="edit-form">
          <el-form-item label="问题" prop="question">
            <el-input v-model="form.question" type="text" placeholder="请输入问题" size="large" />
          </el-form-item>

          <el-form-item label="答案" prop="answer" class="answer-item">
            <el-input v-model="form.answer" type="textarea" :rows="16" placeholder="请输入答案" class="answer-textarea" />
          </el-form-item>

          <el-form-item class="form-buttons">
            <el-button type="primary" @click="submitForm" size="small">
              {{ editMode === 'add' ? '添加' : '更新' }}
            </el-button>
            <el-button @click="resetForm" size="small">重置</el-button>
            <el-button type="danger" v-if="editMode === 'edit'" @click="deleteQuestion" size="small">
              删除
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="empty-state" v-else>
        <el-empty description="请先选择一个分类" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.edit-view {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
}

.edit-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.edit-header h1 {
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

.edit-content {
  background-color: #fff;
  border-radius: 6px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
}

.selector-container {
  margin-bottom: 20px;
}

.form-container {
  margin-top: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-container h2 {
  margin-bottom: 20px;
  font-size: 1.5rem;
  color: #303133;
  border-bottom: 1px solid #EBEEF5;
  padding-bottom: 10px;
}

.el-form-item__label {
  font-size: 1.1rem !important;
  font-weight: 600 !important;
  margin-bottom: 8px !important;
}

.edit-form {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.answer-item {
  margin-bottom: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.answer-textarea {
  flex: 1;
  min-height: 300px;
}

.el-textarea__inner {
  min-height: 300px !important;
  height: 100%;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.6;
}

.form-buttons {
  margin-top: 20px;
  margin-bottom: 0;
  display: flex;
  gap: 10px;
}

.form-buttons .el-button {
  padding: 10px 20px;
  font-size: 1rem;
}

.empty-state {
  margin: 30px 0;
  text-align: center;
}
</style>