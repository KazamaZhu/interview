<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { categories, interviewQuestions } from '@/data/interviewData'
import { ElMessage, ElMessageBox } from 'element-plus'
import { addPoints } from '@/utils/PointsManager'
import { addInterviewQuestion, saveCustomData, getCurrentData, deleteInterviewQuestion, editCategory as updateCategory } from '@/utils/DataManager'

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

// 新分类对话框
const newCategoryDialogVisible = ref(false)
const newCategoryName = ref('')

// 编辑分类对话框
const editCategoryDialogVisible = ref(false)
const editCategoryName = ref('')
const originalCategoryName = ref('')

// 分类管理对话框
const categoryManagerDialogVisible = ref(false)

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

// 显示添加分类对话框
const showAddCategoryDialog = () => {
  newCategoryName.value = ''
  newCategoryDialogVisible.value = true
}

// 显示分类管理对话框
const showCategoryManagerDialog = () => {
  categoryManagerDialogVisible.value = true
}

// 显示编辑分类对话框
const showEditCategoryDialog = (category) => {
  originalCategoryName.value = category
  editCategoryName.value = category
  editCategoryDialogVisible.value = true
  categoryManagerDialogVisible.value = false
}

// 添加新分类
const addNewCategory = () => {
  if (!newCategoryName.value.trim()) {
    ElMessage.warning('分类名称不能为空')
    return
  }

  // 检查分类是否已存在
  if (categories.includes(newCategoryName.value.trim())) {
    ElMessage.warning('此分类已存在')
    return
  }

  // 添加新分类（通过添加一个空问题来创建分类）
  const success = addInterviewQuestion(
    newCategoryName.value.trim(),
    "示例问题",
    "示例答案"
  )

  if (success) {
    ElMessage.success('分类添加成功')
    selectedCategory.value = newCategoryName.value.trim()
    newCategoryDialogVisible.value = false

    // 添加积分奖励
    addPoints(20)
  }
}

// 编辑分类名称
const editCategory = () => {
  if (!editCategoryName.value.trim()) {
    ElMessage.warning('分类名称不能为空')
    return
  }

  if (editCategoryName.value.trim() === originalCategoryName.value) {
    ElMessage.info('分类名称未变更')
    editCategoryDialogVisible.value = false
    categoryManagerDialogVisible.value = true
    return
  }

  // 使用统一的编辑分类功能
  const success = updateCategory(originalCategoryName.value, editCategoryName.value.trim())

  if (success) {
    ElMessage.success('分类名称修改成功')

    // 如果当前选中的是被修改的分类，更新选中的分类
    if (selectedCategory.value === originalCategoryName.value) {
      selectedCategory.value = editCategoryName.value.trim()
    }

    // 添加积分奖励
    addPoints(10)

    editCategoryDialogVisible.value = false
    categoryManagerDialogVisible.value = true
  } else {
    ElMessage.error('编辑分类失败，可能该分类已存在')
  }
}

// 删除分类
const deleteCategory = (category) => {
  ElMessageBox.confirm(
    `确定要删除"${category}"分类吗？此操作将删除该分类下的所有问题！`,
    '警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    try {
      // 获取当前数据
      const data = getCurrentData()

      // 从categories中删除
      const categoryIndex = data.categories.indexOf(category)
      if (categoryIndex !== -1) {
        data.categories.splice(categoryIndex, 1)

        // 删除该分类下的所有问题
        delete data.interviewQuestions[category]

        // 保存数据
        if (saveCustomData(data)) {
          ElMessage.success('分类删除成功')

          // 如果当前选中的是被删除的分类，清空选中
          if (selectedCategory.value === category) {
            selectedCategory.value = ''
          }
        }
      }
    } catch (error) {
      console.error('删除分类失败:', error)
      ElMessage.error('删除分类失败: ' + error.message)
    }
  }).catch(() => {
    // 用户取消删除操作
  })
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
  try {
    // 生成一个新的ID
    const newId = `${selectedCategory.value}-${Date.now()}`

    // 获取当前数据
    const data = getCurrentData()

    // 确保分类存在
    if (!data.interviewQuestions[selectedCategory.value]) {
      data.interviewQuestions[selectedCategory.value] = []
    }

    // 添加新问题
    data.interviewQuestions[selectedCategory.value].push({
      id: newId,
      question: form.question,
      answer: form.answer
    })

    // 保存数据
    if (saveCustomData(data)) {
      // 添加积分奖励
      addPoints(20)

      ElMessage({
        type: 'success',
        message: '问题添加成功！获得20积分奖励。'
      })

      // 跳转到该分类的页面，以查看新添加的问题
      router.push({
        path: `/category/${selectedCategory.value}`
      })
    } else {
      ElMessage.error('保存问题失败')
    }
  } catch (error) {
    console.error('添加问题失败:', error)
    ElMessage.error('添加问题失败: ' + error.message)
  }
}

// 更新问题
const updateQuestion = () => {
  try {
    // 获取当前数据
    const data = getCurrentData()

    // 找到要更新的问题索引
    const questionList = data.interviewQuestions[selectedCategory.value] || []
    const questionIndex = questionList.findIndex(q => q.id === selectedQuestion.value)

    if (questionIndex === -1) {
      ElMessage.error('找不到要更新的问题')
      return
    }

    // 更新问题
    data.interviewQuestions[selectedCategory.value][questionIndex] = {
      id: selectedQuestion.value,
      question: form.question,
      answer: form.answer
    }

    // 保存数据
    if (saveCustomData(data)) {
      // 添加积分奖励
      addPoints(20)

      ElMessage({
        type: 'success',
        message: '问题更新成功！获得20积分奖励。'
      })

      // 跳转到该分类的页面，以查看更新后的问题
      router.push({
        path: `/category/${selectedCategory.value}`
      })
    } else {
      ElMessage.error('保存问题失败')
    }
  } catch (error) {
    console.error('更新问题失败:', error)
    ElMessage.error('更新问题失败: ' + error.message)
  }
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
      try {
        // 获取当前数据
        const data = getCurrentData()

        // 找到要删除的问题索引
        const questionList = data.interviewQuestions[selectedCategory.value] || []
        const questionIndex = questionList.findIndex(q => q.id === selectedQuestion.value)

        if (questionIndex === -1) {
          ElMessage.error('找不到要删除的问题')
          return
        }

        // 删除问题
        data.interviewQuestions[selectedCategory.value].splice(questionIndex, 1)

        // 如果分类中没有问题了，考虑是否删除该分类
        if (data.interviewQuestions[selectedCategory.value].length === 0) {
          // 这里可以选择是否删除空分类，暂时保留空分类
          // delete data.interviewQuestions[selectedCategory.value]
        }

        // 保存数据
        if (saveCustomData(data)) {
          ElMessage({
            type: 'success',
            message: '问题删除成功！'
          })

          selectedQuestion.value = ''
          resetForm()

          // 跳转到该分类的页面
          router.push({
            path: `/category/${selectedCategory.value}`
          })
        } else {
          ElMessage.error('删除问题失败')
        }
      } catch (error) {
        console.error('删除问题失败:', error)
        ElMessage.error('删除问题失败: ' + error.message)
      }
    })
    .catch(() => {
      // 用户取消删除
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
            <div class="category-select-group">
              <el-select v-model="selectedCategory" placeholder="请选择分类" @change="handleCategoryChange" size="small">
                <el-option v-for="category in categories" :key="category.id" :label="category" :value="category" />
              </el-select>
              <el-button type="warning" size="small" @click="showCategoryManagerDialog">
                <el-icon>
                  <Setting />
                </el-icon>
                管理分类
              </el-button>
            </div>
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

    <!-- 添加新分类对话框 -->
    <el-dialog v-model="newCategoryDialogVisible" title="添加新分类" width="400px">
      <el-form>
        <el-form-item label="分类名称">
          <el-input v-model="newCategoryName" placeholder="请输入分类名称"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="newCategoryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addNewCategory">添加</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分类管理对话框 -->
    <el-dialog v-model="categoryManagerDialogVisible" title="分类管理" width="500px">
      <div class="category-manager">
        <p class="category-manager-tip">在这里您可以管理（编辑或删除）已有的分类。</p>

        <el-table :data="categories" style="width: 100%" v-if="categories.length > 0">
          <el-table-column prop="name" label="分类名称">
            <template #default="{ row }">
              {{ row }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <div class="operation-buttons">
                <el-button type="primary" size="small" @click="showEditCategoryDialog(row)">
                  <el-icon>
                    <Edit />
                  </el-icon> 编辑
                </el-button>
                <el-button type="danger" size="small" @click="deleteCategory(row)">
                  <el-icon>
                    <Delete />
                  </el-icon> 删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-else description="暂无分类数据"></el-empty>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="categoryManagerDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="showAddCategoryDialog">添加新分类</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog v-model="editCategoryDialogVisible" title="编辑分类" width="400px">
      <el-form>
        <el-form-item label="分类名称">
          <el-input v-model="editCategoryName" placeholder="请输入新的分类名称"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editCategoryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="editCategory">保存</el-button>
        </span>
      </template>
    </el-dialog>
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

.category-select-group {
  display: flex;
  align-items: center;
  gap: 10px;
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

.category-manager-tip {
  margin-top: 0;
  margin-bottom: 15px;
  color: #606266;
  font-size: 0.9rem;
}

.operation-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.operation-buttons .el-button {
  width: 100px;
  margin-left: 0 !important;
  margin-right: 0 !important;
}
</style>