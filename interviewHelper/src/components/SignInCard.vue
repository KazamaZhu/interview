<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { canSignIn, signIn, getSignInStreak, getLastSignInTime } from '@/utils/PointsManager'
import { ElMessage } from 'element-plus'
import { interviewQuestions, categories } from '@/data/interviewData'

const props = defineProps({
    onPointsChange: Function
})

// 签到状态
const canSignInToday = ref(false)
const signInStreak = ref(0)
const lastSignInDate = ref(null)
const isSignInDialogVisible = ref(false)
const signInResult = ref(null)

// 面试题状态
const showQuestionDialog = ref(false)
const currentQuestion = reactive({
    id: '',
    question: '',
    answer: '',
    categoryName: ''
})
const userAnswer = ref('')
const isAnswerSubmitted = ref(false)

// 计算上次签到时间的友好显示
const lastSignInText = computed(() => {
    if (!lastSignInDate.value) return '从未签到'

    const now = new Date()
    const last = new Date(lastSignInDate.value)

    // 如果是今天
    if (isSameDay(now, last)) {
        return '今天已签到'
    }

    // 如果是昨天
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    if (isSameDay(yesterday, last)) {
        return '昨天签到'
    }

    // 其他日期
    return `${last.getMonth() + 1}月${last.getDate()}日签到`
})

// 判断两个日期是否是同一天
function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
}

// 开始签到流程
const handleSignIn = () => {
    if (!canSignInToday.value) {
        ElMessage.warning('今天已经签到过了')
        return
    }

    // 随机选择一道面试题
    selectRandomQuestion()

    // 显示问题对话框
    showQuestionDialog.value = true
}

// 随机选择一道面试题
const selectRandomQuestion = () => {
    // 获取所有分类
    const allCategories = Object.keys(interviewQuestions)

    // 随机选择一个分类
    const randomCategoryId = allCategories[Math.floor(Math.random() * allCategories.length)]
    const categoryQuestions = interviewQuestions[randomCategoryId]

    // 随机选择一道题目
    const randomQuestion = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)]

    // 获取分类名称
    const categoryObj = categories.find(c => c.id === randomCategoryId)
    const categoryName = categoryObj ? categoryObj.name : randomCategoryId

    // 设置当前问题
    currentQuestion.id = randomQuestion.id
    currentQuestion.question = randomQuestion.question
    currentQuestion.answer = randomQuestion.answer
    currentQuestion.categoryName = categoryName

    // 重置用户答案和提交状态
    userAnswer.value = ''
    isAnswerSubmitted.value = false
}

// 提交答案
const submitAnswer = () => {
    if (!userAnswer.value.trim()) {
        ElMessage.warning('请输入您的答案')
        return
    }

    isAnswerSubmitted.value = true
}

// 完成签到
const completeSignIn = () => {
    // 关闭问题对话框
    showQuestionDialog.value = false

    // 执行签到
    const result = signIn()
    if (result.success) {
        signInResult.value = result
        isSignInDialogVisible.value = true

        // 更新状态
        canSignInToday.value = false
        signInStreak.value = result.streak
        lastSignInDate.value = new Date()

        // 通知积分变化
        if (props.onPointsChange) {
            props.onPointsChange()
        }
    } else {
        ElMessage.error(result.message)
    }
}

// 关闭签到结果对话框
const closeSignInDialog = () => {
    isSignInDialogVisible.value = false
}

// 组件挂载时初始化数据
onMounted(() => {
    canSignInToday.value = canSignIn()
    signInStreak.value = getSignInStreak()
    const lastTime = getLastSignInTime()
    if (lastTime) {
        lastSignInDate.value = lastTime
    }
})
</script>

<template>
    <div class="sign-in-card">
        <div class="sign-in-header">
            <el-icon>
                <Calendar />
            </el-icon>
            <span>每日签到</span>
        </div>

        <div class="sign-in-content">
            <div class="sign-in-info">
                <div class="streak-info">
                    <span class="streak-label">连续签到</span>
                    <span class="streak-value">{{ signInStreak }}天</span>
                </div>
                <div class="last-sign-in">
                    <span class="last-sign-label">上次签到</span>
                    <span class="last-sign-value">{{ lastSignInText }}</span>
                </div>
            </div>

            <el-button type="primary" @click="handleSignIn" :disabled="!canSignInToday" class="sign-in-button">
                {{ canSignInToday ? '立即签到' : '今日已签到' }}
            </el-button>
        </div>

        <!-- 面试题对话框 -->
        <el-dialog v-model="showQuestionDialog" title="回答面试题完成签到" width="500px" :close-on-click-modal="false"
            :show-close="false">
            <div class="question-container">
                <div class="question-header">
                    <el-tag size="small">{{ currentQuestion.categoryName }}</el-tag>
                </div>

                <div class="question-content">
                    <h3>{{ currentQuestion.question }}</h3>
                </div>

                <div class="answer-section" v-if="!isAnswerSubmitted">
                    <el-input v-model="userAnswer" type="textarea" :rows="6" placeholder="请输入您的答案..."
                        class="answer-input" />

                    <div class="answer-actions">
                        <el-button type="primary" @click="submitAnswer">
                            提交答案
                        </el-button>
                    </div>
                </div>

                <div class="result-section" v-else>
                    <div class="user-answer">
                        <h4>您的答案:</h4>
                        <div class="answer-content">{{ userAnswer }}</div>
                    </div>

                    <div class="reference-answer">
                        <h4>参考答案:</h4>
                        <div class="answer-content" v-html="currentQuestion.answer.replace(/\n/g, '<br>')"></div>
                    </div>

                    <div class="complete-actions">
                        <el-button type="success" @click="completeSignIn">
                            完成签到 (获得20积分)
                        </el-button>
                    </div>
                </div>
            </div>
        </el-dialog>

        <!-- 签到结果对话框 -->
        <el-dialog v-model="isSignInDialogVisible" title="签到成功" width="300px" center :show-close="false"
            class="sign-in-dialog">
            <div class="sign-in-result" v-if="signInResult">
                <div class="result-icon">
                    <el-icon>
                        <SuccessFilled />
                    </el-icon>
                </div>
                <div class="result-text">
                    <p class="result-message">{{ signInResult.message }}</p>
                    <p class="result-streak">连续签到: {{ signInResult.streak }}天</p>
                </div>
            </div>
            <template #footer>
                <el-button type="primary" @click="closeSignInDialog" class="dialog-button">
                    太棒了
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style scoped>
.sign-in-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 15px;
    margin-bottom: 20px;
}

.sign-in-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 15px;
    font-size: 1.1rem;
    font-weight: bold;
    color: #409EFF;
}

.sign-in-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.sign-in-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.streak-info,
.last-sign-in {
    display: flex;
    flex-direction: column;
}

.streak-label,
.last-sign-label {
    font-size: 0.8rem;
    color: #909399;
}

.streak-value {
    font-size: 1.2rem;
    font-weight: bold;
    color: #409EFF;
}

.last-sign-value {
    font-size: 0.9rem;
    color: #606266;
}

.sign-in-button {
    min-width: 100px;
}

/* 面试题对话框样式 */
.question-container {
    padding: 10px;
}

.question-header {
    margin-bottom: 15px;
}

.question-content {
    margin-bottom: 20px;
}

.question-content h3 {
    font-size: 1.2rem;
    color: #303133;
    margin: 10px 0;
}

.answer-section {
    margin-bottom: 20px;
}

.answer-input {
    margin-bottom: 15px;
}

.answer-actions {
    display: flex;
    justify-content: flex-end;
}

.result-section {
    margin-top: 20px;
}

.user-answer,
.reference-answer {
    margin-bottom: 20px;
}

.user-answer h4,
.reference-answer h4 {
    font-size: 1rem;
    color: #606266;
    margin-bottom: 10px;
}

.answer-content {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    color: #303133;
    line-height: 1.5;
    white-space: pre-wrap;
}

.complete-actions {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

/* 签到结果对话框样式 */
.sign-in-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 10px 0;
}

.result-icon {
    font-size: 3rem;
    color: #67C23A;
    margin-bottom: 15px;
}

.result-text {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.result-message {
    font-size: 1.1rem;
    font-weight: bold;
    color: #303133;
    margin: 0;
}

.result-streak {
    font-size: 0.9rem;
    color: #606266;
    margin: 0;
}

.dialog-button {
    width: 100%;
}

:deep(.el-dialog__header) {
    padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 1px solid #EBEEF5;
}

:deep(.el-dialog__body) {
    padding-top: 10px;
    padding-bottom: 10px;
}

:deep(.el-dialog__footer) {
    padding-top: 10px;
    padding-bottom: 15px;
}
</style>