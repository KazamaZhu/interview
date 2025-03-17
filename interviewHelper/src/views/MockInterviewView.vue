<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { categories, interviewQuestions } from '@/data/interviewData'
import { ElMessage } from 'element-plus'
import { evaluateAnswer } from '@/utils/AnswerEvaluator'

const router = useRouter()

// 模拟面试状态
const interviewState = reactive({
    started: false,
    finished: false,
    currentQuestionIndex: 0,
    inputMethod: 'text', // 'text' 或 'voice'
    questions: [],
    answers: {},
    evaluations: {}, // 存储每个问题的评估结果
    timeSpent: 0,
    timer: null,
    showingResult: false // 是否正在显示当前题目的评分结果
})

// 语音识别相关
const recognition = ref(null)
const isListening = ref(false)
const transcript = ref('')

// 当前问题
const currentQuestion = computed(() => {
    if (interviewState.questions.length === 0 ||
        interviewState.currentQuestionIndex >= interviewState.questions.length) {
        return null
    }
    return interviewState.questions[interviewState.currentQuestionIndex]
})

// 当前答案
const currentAnswer = ref('')

// 初始化语音识别（如果浏览器支持）
const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognition.value = new SpeechRecognition()
        recognition.value.continuous = true
        recognition.value.interimResults = true
        recognition.value.lang = 'zh-CN'

        recognition.value.onresult = (event) => {
            let interimTranscript = ''
            let finalTranscript = ''

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcriptText = event.results[i][0].transcript
                if (event.results[i].isFinal) {
                    finalTranscript += transcriptText
                } else {
                    interimTranscript += transcriptText
                }
            }

            // 更新最终结果
            if (finalTranscript) {
                transcript.value += finalTranscript + ' '
            }

            // 实时更新当前答案，包括最终结果和临时结果
            currentAnswer.value = transcript.value + interimTranscript
        }

        recognition.value.onerror = (event) => {
            console.error('语音识别错误:', event.error)
            isListening.value = false
            ElMessage.error('语音识别出错，请重试或切换到文本输入')
        }
    } else {
        ElMessage.warning('您的浏览器不支持语音识别，请使用文本输入')
        interviewState.inputMethod = 'text'
    }
}

// 开始语音识别
const startListening = () => {
    if (!recognition.value) {
        initSpeechRecognition()
    }

    if (recognition.value) {
        transcript.value = ''
        recognition.value.start()
        isListening.value = true
    }
}

// 停止语音识别
const stopListening = () => {
    if (recognition.value && isListening.value) {
        recognition.value.stop()
        isListening.value = false
    }
}

// 切换输入方式
const toggleInputMethod = () => {
    if (interviewState.inputMethod === 'text') {
        interviewState.inputMethod = 'voice'
        ElMessage.success('已切换到语音输入模式')
    } else {
        stopListening()
        interviewState.inputMethod = 'text'
        ElMessage.success('已切换到文本输入模式')
    }
}

// 从每个分类中随机选择问题
const generateRandomQuestions = () => {
    const questions = []

    // 遍历每个分类
    categories.forEach(category => {
        const categoryQuestions = interviewQuestions[category.id] || []

        // 如果该分类有问题，随机选择3个（或更少，如果问题不足3个）
        if (categoryQuestions.length > 0) {
            // 随机打乱问题顺序
            const shuffled = [...categoryQuestions].sort(() => 0.5 - Math.random())

            // 选择前3个问题
            const selected = shuffled.slice(0, 3)

            // 添加分类信息
            selected.forEach(question => {
                questions.push({
                    ...question,
                    categoryId: category.id,
                    categoryName: category.name
                })
            })
        }
    })

    // 再次随机打乱所有问题的顺序
    return questions.sort(() => 0.5 - Math.random())
}

// 开始模拟面试
const startInterview = () => {
    interviewState.questions = generateRandomQuestions()
    interviewState.started = true
    interviewState.finished = false
    interviewState.currentQuestionIndex = 0
    interviewState.answers = {}
    interviewState.timeSpent = 0

    // 开始计时
    interviewState.timer = setInterval(() => {
        interviewState.timeSpent++
    }, 1000)

    // 如果选择了语音输入，初始化语音识别
    if (interviewState.inputMethod === 'voice') {
        initSpeechRecognition()
        // 自动开始录音
        startListening()
    }
}

// 提交当前问题的答案
const submitAnswer = () => {
    if (!currentQuestion.value) return

    // 保存答案
    interviewState.answers[currentQuestion.value.id] = currentAnswer.value

    // 评估答案
    if (currentQuestion.value.answer) {
        const evaluation = evaluateAnswer(currentAnswer.value, currentQuestion.value.answer)
        interviewState.evaluations[currentQuestion.value.id] = evaluation
    }

    // 如果是语音输入，停止监听
    if (interviewState.inputMethod === 'voice' && isListening.value) {
        stopListening()
    }

    // 显示当前题目的评分结果
    interviewState.showingResult = true
}

// 继续下一题
const continueToNextQuestion = () => {
    // 清空当前答案
    currentAnswer.value = ''
    transcript.value = ''

    // 隐藏评分结果
    interviewState.showingResult = false

    // 移动到下一个问题
    if (interviewState.currentQuestionIndex < interviewState.questions.length - 1) {
        interviewState.currentQuestionIndex++

        // 如果是语音输入，开始新的监听
        if (interviewState.inputMethod === 'voice') {
            startListening()
        }
    } else {
        // 面试结束
        finishInterview()
    }
}

// 重置当前问题的答案
const resetAnswer = () => {
    // 清空当前答案
    currentAnswer.value = ''
    transcript.value = ''

    // 如果是语音输入，重新开始录音
    if (interviewState.inputMethod === 'voice') {
        if (isListening.value) {
            stopListening()
        }
        startListening()
    }

    ElMessage.success('已重置当前答案')
}

// 完成模拟面试
const finishInterview = () => {
    // 停止计时
    if (interviewState.timer) {
        clearInterval(interviewState.timer)
        interviewState.timer = null
    }

    // 停止语音识别
    stopListening()

    // 设置状态
    interviewState.finished = true
}

// 返回首页
const goBack = () => {
    router.push('/')
}

// 重新开始
const restart = () => {
    startInterview()
}

// 格式化时间
const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
}

// 计算总分
const totalScore = computed(() => {
    if (Object.keys(interviewState.evaluations).length === 0) return 0

    const scores = Object.values(interviewState.evaluations).map(evaluation => evaluation.score)
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
})

// 获取总体评级
const overallGrade = computed(() => {
    const score = totalScore.value
    if (score >= 90) return '优秀'
    if (score >= 75) return '良好'
    if (score >= 60) return '一般'
    if (score >= 40) return '较差'
    return '差'
})

// 获取进度条状态
const getProgressStatus = (score) => {
    if (score >= 80) return 'success'
    if (score >= 60) return ''
    return 'exception'
}

// 组件挂载时
onMounted(() => {
    // 初始化语音识别
    if (interviewState.inputMethod === 'voice') {
        initSpeechRecognition()
    }
})

// 组件卸载前
onBeforeUnmount(() => {
    // 清除计时器
    if (interviewState.timer) {
        clearInterval(interviewState.timer)
    }

    // 停止语音识别
    stopListening()
})
</script>

<template>
    <div class="mock-interview-view">
        <div class="interview-header">
            <el-button @click="goBack" type="primary" plain size="small">
                <el-icon>
                    <Back />
                </el-icon>
                返回首页
            </el-button>
            <h1>模拟面试</h1>
        </div>

        <!-- 未开始状态 -->
        <div v-if="!interviewState.started" class="start-container">
            <div class="start-card">
                <h2>准备开始模拟面试</h2>
                <p>系统将从每个分类中随机选择问题，测试您的知识掌握程度。</p>

                <div class="options-section">
                    <h3>选择答题方式</h3>
                    <el-radio-group v-model="interviewState.inputMethod" class="input-method-selector">
                        <el-radio label="text">文本输入</el-radio>
                        <el-radio label="voice">语音输入</el-radio>
                    </el-radio-group>
                </div>

                <el-button type="primary" size="large" @click="startInterview" class="start-button">
                    开始模拟面试
                </el-button>
            </div>
        </div>

        <!-- 进行中状态 -->
        <div v-else-if="interviewState.started && !interviewState.finished" class="interview-container">
            <div class="interview-info">
                <div class="progress-info">
                    <span>问题 {{ interviewState.currentQuestionIndex + 1 }}/{{ interviewState.questions.length }}</span>
                    <span>用时: {{ formatTime(interviewState.timeSpent) }}</span>
                </div>
                <el-button @click="toggleInputMethod" size="small"
                    :type="interviewState.inputMethod === 'voice' ? 'success' : 'info'">
                    <el-icon v-if="interviewState.inputMethod === 'voice'">
                        <Microphone />
                    </el-icon>
                    <el-icon v-else>
                        <Edit />
                    </el-icon>
                    {{ interviewState.inputMethod === 'voice' ? '语音输入中' : '文本输入中' }}
                </el-button>
            </div>

            <div class="question-card" v-if="currentQuestion">
                <div class="question-category">
                    <el-tag size="small">{{ currentQuestion.categoryName }}</el-tag>
                </div>
                <h3 class="question-title">{{ currentQuestion.question }}</h3>

                <!-- 答题区域 -->
                <div v-if="!interviewState.showingResult" class="answer-section">
                    <div v-if="interviewState.inputMethod === 'text'">
                        <el-input v-model="currentAnswer" type="textarea" :rows="8" placeholder="请输入您的答案..."
                            class="answer-input" />
                    </div>
                    <div v-else class="voice-input-container">
                        <div class="voice-status">
                            <el-tag :type="isListening ? 'success' : 'info'" effect="dark">
                                {{ isListening ? '正在录音...' : '未开始录音' }}
                            </el-tag>
                            <div class="voice-controls">
                                <el-button @click="startListening" type="success" size="small" :disabled="isListening">
                                    开始录音
                                </el-button>
                                <el-button @click="stopListening" type="danger" size="small" :disabled="!isListening">
                                    停止录音
                                </el-button>
                            </div>
                        </div>
                        <div class="transcript-display">
                            <p v-if="currentAnswer">{{ currentAnswer }}</p>
                            <p v-else class="placeholder-text">您的语音将显示在这里...</p>
                        </div>
                    </div>

                    <div class="answer-actions">
                        <el-button @click="resetAnswer" type="warning" size="small">
                            <el-icon>
                                <RefreshRight />
                            </el-icon>
                            重置答案
                        </el-button>
                        <el-button @click="submitAnswer" type="primary" size="small">
                            <el-icon>
                                <Check />
                            </el-icon>
                            提交答案
                        </el-button>
                    </div>
                </div>

                <!-- 评分结果区域 -->
                <div v-else class="result-section">
                    <div class="current-result">
                        <div class="result-header">
                            <h4>您的答案评分</h4>
                            <div class="score-display">
                                <span class="score-value">{{ interviewState.evaluations[currentQuestion.id].score
                                    }}</span>
                                <span class="score-grade">({{ interviewState.evaluations[currentQuestion.id].grade
                                    }})</span>
                            </div>
                        </div>

                        <div class="feedback-section">
                            <div class="feedback-content">{{ interviewState.evaluations[currentQuestion.id].feedback }}
                            </div>
                        </div>

                        <div class="evaluation-details">
                            <div v-for="(detail, i) in interviewState.evaluations[currentQuestion.id].details" :key="i"
                                class="detail-item">
                                <div class="detail-aspect">{{ detail.aspect }}:</div>
                                <el-progress :percentage="detail.score" :status="getProgressStatus(detail.score)"
                                    :stroke-width="10" />
                                <div class="detail-description">{{ detail.description }}</div>
                            </div>
                        </div>

                        <div class="answer-comparison">
                            <div class="user-answer">
                                <div class="answer-header">您的回答:</div>
                                <div class="answer-content">{{ interviewState.answers[currentQuestion.id] }}</div>
                            </div>
                            <div class="reference-answer">
                                <div class="reference-header">参考答案:</div>
                                <div class="reference-content" v-html="currentQuestion.answer.replace(/\n/g, '<br>')">
                                </div>
                            </div>
                        </div>

                        <div class="next-actions">
                            <el-button @click="continueToNextQuestion" type="primary" size="small">
                                <el-icon>
                                    <Right />
                                </el-icon>
                                {{ interviewState.currentQuestionIndex < interviewState.questions.length - 1 ? '下一题'
                                    : '完成面试' }} </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 完成状态 -->
        <div v-else class="result-container">
            <div class="result-card">
                <h2>模拟面试结果</h2>
                <div class="result-summary">
                    <div class="summary-item">
                        <div class="summary-label">总题数</div>
                        <div class="summary-value">{{ interviewState.questions.length }}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">用时</div>
                        <div class="summary-value">{{ formatTime(interviewState.timeSpent) }}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">总评分</div>
                        <div class="summary-value score">{{ totalScore }}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">评级</div>
                        <div class="summary-value">{{ overallGrade }}</div>
                    </div>
                </div>

                <div class="result-details">
                    <div v-for="(question, index) in interviewState.questions" :key="question.id" class="result-item">
                        <div class="result-question">
                            <div class="question-header">
                                <span class="question-number">问题 {{ index + 1 }}</span>
                                <el-tag size="small">{{ question.categoryName }}</el-tag>
                                <span v-if="interviewState.evaluations[question.id]" class="question-score">
                                    得分: {{ interviewState.evaluations[question.id].score }}
                                    <span class="question-grade">({{ interviewState.evaluations[question.id].grade
                                        }})</span>
                                </span>
                            </div>
                            <div class="question-content">{{ question.question }}</div>
                        </div>

                        <div class="result-answer">
                            <div class="answer-header">您的回答:</div>
                            <div class="answer-content">{{ interviewState.answers[question.id] || '未作答' }}</div>
                        </div>

                        <div class="result-reference">
                            <div class="reference-header">参考答案:</div>
                            <div class="reference-content" v-html="question.answer.replace(/\n/g, '<br>')"></div>
                        </div>

                        <div v-if="interviewState.evaluations[question.id]" class="result-evaluation">
                            <div class="evaluation-header">评估反馈:</div>
                            <div class="evaluation-feedback">{{ interviewState.evaluations[question.id].feedback }}
                            </div>

                            <div class="evaluation-details">
                                <div v-for="(detail, i) in interviewState.evaluations[question.id].details" :key="i"
                                    class="detail-item">
                                    <div class="detail-aspect">{{ detail.aspect }}:</div>
                                    <el-progress :percentage="detail.score" :status="getProgressStatus(detail.score)"
                                        :stroke-width="10" />
                                    <div class="detail-description">{{ detail.description }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="result-actions">
                    <el-button @click="restart" type="primary">
                        <el-icon>
                            <RefreshLeft />
                        </el-icon>
                        重新开始
                    </el-button>
                    <el-button @click="goBack" plain>
                        <el-icon>
                            <Back />
                        </el-icon>
                        返回首页
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.mock-interview-view {
    max-width: 100%;
    margin: 0 auto;
    padding: 20px;
    min-height: 100vh;
}

.interview-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.interview-header h1 {
    margin: 0 0 0 15px;
    font-size: 1.6rem;
    color: #409EFF;
}

/* 开始页面样式 */
.start-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 100px);
}

.start-card {
    background-color: #fff;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 600px;
    text-align: center;
}

.start-card h2 {
    font-size: 1.8rem;
    color: #303133;
    margin-bottom: 20px;
}

.start-card p {
    color: #606266;
    margin-bottom: 30px;
    font-size: 1.1rem;
    line-height: 1.6;
}

.options-section {
    margin-bottom: 30px;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 6px;
}

.options-section h3 {
    margin-bottom: 15px;
    font-size: 1.2rem;
    color: #303133;
}

.input-method-selector {
    display: flex;
    justify-content: center;
    gap: 30px;
}

.start-button {
    padding: 12px 30px;
    font-size: 1.1rem;
}

/* 面试进行中样式 */
.interview-container {
    max-width: 800px;
    margin: 0 auto;
}

.interview-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    background-color: #f5f7fa;
    padding: 10px 15px;
    border-radius: 6px;
}

.progress-info {
    display: flex;
    gap: 20px;
    font-size: 0.95rem;
    color: #606266;
}

.question-card {
    background-color: #fff;
    border-radius: 8px;
    padding: 25px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.question-category {
    margin-bottom: 15px;
}

.question-title {
    font-size: 1.3rem;
    color: #303133;
    margin-bottom: 25px;
    line-height: 1.4;
}

.answer-section {
    margin-bottom: 25px;
}

.answer-input {
    width: 100%;
    font-size: 1rem;
}

.voice-input-container {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 15px;
    min-height: 200px;
}

.voice-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.voice-controls {
    display: flex;
    gap: 10px;
}

.transcript-display {
    min-height: 150px;
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 15px;
    font-size: 1rem;
    line-height: 1.6;
}

.placeholder-text {
    color: #909399;
    font-style: italic;
}

.answer-actions {
    display: flex;
    justify-content: flex-end;
}

/* 结果页面样式 */
.result-container {
    max-width: 800px;
    margin: 0 auto;
}

.result-card {
    background-color: #fff;
    border-radius: 8px;
    padding: 25px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.result-card h2 {
    font-size: 1.8rem;
    color: #303133;
    margin-bottom: 20px;
    text-align: center;
}

.result-summary {
    display: flex;
    justify-content: space-around;
    margin: 20px 0;
    background-color: #f5f7fa;
    border-radius: 8px;
    padding: 20px;
}

.summary-item {
    text-align: center;
}

.summary-label {
    font-size: 0.9rem;
    color: #606266;
    margin-bottom: 5px;
}

.summary-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #303133;
}

.summary-value.score {
    color: #409EFF;
}

.result-details {
    margin-bottom: 30px;
}

.result-item {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.question-header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.question-number {
    font-weight: bold;
    margin-right: 10px;
}

.question-score {
    margin-left: auto;
    font-weight: bold;
}

.question-grade {
    color: #409EFF;
    margin-left: 5px;
}

.question-content {
    font-size: 1.1rem;
    margin-bottom: 15px;
}

.answer-header,
.reference-header,
.evaluation-header {
    font-weight: bold;
    margin-bottom: 5px;
    color: #606266;
}

.answer-content,
.reference-content {
    background-color: #f5f7fa;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;
    white-space: pre-wrap;
}

.evaluation-feedback {
    padding: 10px;
    background-color: #ecf5ff;
    border-radius: 4px;
    margin-bottom: 15px;
    color: #409EFF;
}

.evaluation-details {
    margin-top: 10px;
}

.detail-item {
    margin-bottom: 10px;
}

.detail-aspect {
    font-weight: bold;
    margin-bottom: 5px;
}

.detail-description {
    font-size: 0.9rem;
    color: #606266;
    margin-top: 5px;
}

.result-actions {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 30px;
}

/* 评分结果区域样式 */
.result-section {
    margin-top: 20px;
}

.current-result {
    background-color: #f5f7fa;
    border-radius: 8px;
    padding: 20px;
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 10px;
}

.result-header h4 {
    font-size: 1.2rem;
    color: #303133;
    margin: 0;
}

.score-display {
    display: flex;
    align-items: center;
}

.score-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #409EFF;
}

.score-grade {
    margin-left: 5px;
    font-size: 1.1rem;
    color: #606266;
}

.feedback-section {
    margin-bottom: 20px;
}

.feedback-content {
    background-color: #ecf5ff;
    padding: 15px;
    border-radius: 4px;
    color: #409EFF;
    font-size: 1rem;
    line-height: 1.5;
}

.answer-comparison {
    margin-top: 20px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.user-answer,
.reference-answer {
    background-color: #fff;
    border-radius: 4px;
    padding: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.next-actions {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

@media (max-width: 768px) {
    .input-method-selector {
        flex-direction: column;
        gap: 10px;
    }

    .voice-status {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .result-question-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }

    .answer-comparison {
        grid-template-columns: 1fr;
    }
}
</style>