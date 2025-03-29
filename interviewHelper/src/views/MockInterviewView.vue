<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { categories, interviewQuestions } from '@/data/interviewData'
import { ElMessage, ElMessageBox } from 'element-plus'
import { evaluateAnswer } from '@/utils/AnswerEvaluator'
import { addPoints } from '@/utils/PointsManager'

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

// 音频设备检测状态
const audioDeviceState = reactive({
    isChecking: false,
    isDeviceConnected: false,
    errorMessage: '',
    showDeviceCheckDialog: false
})

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

// 检测音频输入设备
const checkAudioDevice = () => {
    audioDeviceState.isChecking = true
    audioDeviceState.errorMessage = ''

    // 检查浏览器是否支持 getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        audioDeviceState.isChecking = false
        audioDeviceState.isDeviceConnected = false
        audioDeviceState.errorMessage = '您的浏览器不支持音频输入设备检测，请确保已连接麦克风或耳机。'
        return Promise.reject(new Error('浏览器不支持设备检测'))
    }

    return navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            // 成功获取到音频流，表示有设备连接
            audioDeviceState.isDeviceConnected = true

            // 停止所有音频轨道，释放资源
            stream.getTracks().forEach(track => track.stop())

            audioDeviceState.isChecking = false
            return true
        })
        .catch(error => {
            console.error('音频设备检测失败:', error)
            audioDeviceState.isDeviceConnected = false

            // 根据错误类型设置友好的错误信息
            if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                audioDeviceState.errorMessage = '未检测到麦克风或耳机设备，请确保设备已连接并重试。'
            } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                audioDeviceState.errorMessage = '需要麦克风权限才能使用语音输入功能，请允许访问麦克风。'
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                audioDeviceState.errorMessage = '麦克风或耳机设备被占用或无法使用，请关闭其他使用此设备的应用后重试。'
            } else {
                audioDeviceState.errorMessage = '无法访问麦克风或耳机设备，请检查设备连接并重试。'
            }

            audioDeviceState.isChecking = false
            return Promise.reject(error)
        })
}

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

            // 如果是设备错误，显示相应提示
            if (event.error === 'no-speech' || event.error === 'audio-capture' || event.error === 'not-allowed') {
                audioDeviceState.isDeviceConnected = false

                if (event.error === 'audio-capture') {
                    audioDeviceState.errorMessage = '未检测到麦克风设备，请插入耳机或连接麦克风后重试。'
                } else if (event.error === 'not-allowed') {
                    audioDeviceState.errorMessage = '麦克风访问被拒绝，请允许浏览器使用麦克风。'
                } else {
                    audioDeviceState.errorMessage = '没有检测到语音输入，请确保麦克风正常工作。'
                }

                ElMessage.error(audioDeviceState.errorMessage)
                showDeviceCheckDialog()
            } else {
                ElMessage.error('语音识别出错，请重试或切换到文本输入')
            }
        }
    } else {
        ElMessage.warning('您的浏览器不支持语音识别，请使用文本输入')
        interviewState.inputMethod = 'text'
    }
}

// 显示设备检查对话框
const showDeviceCheckDialog = () => {
    if (!audioDeviceState.isDeviceConnected) {
        audioDeviceState.showDeviceCheckDialog = true
    }
}

// 处理设备检查结果
const handleDeviceCheckResult = (continueWithVoice = false) => {
    audioDeviceState.showDeviceCheckDialog = false

    if (continueWithVoice && audioDeviceState.isDeviceConnected) {
        // 用户确认使用语音输入，并且设备已连接
        interviewState.inputMethod = 'voice'

        if (interviewState.started) {
            startListening()
        }
    } else if (!continueWithVoice) {
        // 用户选择切换到文本输入
        interviewState.inputMethod = 'text'
    }
}

// 开始语音识别
const startListening = () => {
    if (!recognition.value) {
        initSpeechRecognition()
    }

    if (recognition.value) {
        // 先检查设备连接状态
        checkAudioDevice()
            .then(() => {
                transcript.value = ''
                recognition.value.start()
                isListening.value = true
                ElMessage.success('语音识别已开始')
            })
            .catch(error => {
                console.error('开始录音前设备检查失败:', error)
                showDeviceCheckDialog()
            })
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
        // 从文本切换到语音，先检查设备
        checkAudioDevice()
            .then(() => {
                interviewState.inputMethod = 'voice'
                ElMessage.success('已切换到语音输入模式')

                // 如果面试已开始，立即开始录音
                if (interviewState.started && !isListening.value) {
                    startListening()
                }
            })
            .catch(error => {
                console.error('切换到语音输入前设备检查失败:', error)
                showDeviceCheckDialog()
            })
    } else {
        stopListening()
        interviewState.inputMethod = 'text'
        ElMessage.success('已切换到文本输入模式')
    }
}

// 从每个分类中随机选择问题
const generateRandomQuestions = () => {
    const questions = []
    console.log('开始生成随机问题，分类列表:', categories)

    try {
        // 遍历每个分类
        categories.forEach(category => {
            // 检查category的格式，兼容老数据格式和新数据格式
            const categoryId = typeof category === 'object' ? category.id : category
            const categoryName = typeof category === 'object' ? category.name : category

            console.log(`处理分类: ${categoryName} (ID: ${categoryId})`)

            // 验证分类ID有效
            if (!categoryId) {
                console.warn('跳过无效分类ID:', category)
                return
            }

            // 获取该分类下的问题
            const categoryQuestions = interviewQuestions[categoryId] || []
            console.log(`分类 ${categoryName} 的问题数量:`, categoryQuestions.length)

            // 如果该分类有问题，随机选择3个（或更少，如果问题不足3个）
            if (categoryQuestions.length > 0) {
                try {
                    // 随机打乱问题顺序
                    const shuffled = [...categoryQuestions].sort(() => 0.5 - Math.random())

                    // 选择前3个问题
                    const selected = shuffled.slice(0, Math.min(3, shuffled.length))
                    console.log(`为分类 ${categoryName} 选择了 ${selected.length} 个问题`)

                    // 添加分类信息
                    selected.forEach(question => {
                        // 确保问题是有效对象
                        if (typeof question !== 'object' || question === null) {
                            console.warn('跳过无效问题:', question)
                            return
                        }

                        // 深拷贝问题对象，避免修改原始数据
                        const questionCopy = { ...question }

                        // 确保每个问题有一个唯一ID
                        if (!questionCopy.id) {
                            questionCopy.id = `${categoryId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
                        }

                        // 确保问题有基本属性
                        if (!questionCopy.question) {
                            questionCopy.question = '未知问题'
                        }
                        if (!questionCopy.answer) {
                            questionCopy.answer = '暂无参考答案'
                        }

                        // 添加分类信息
                        questionCopy.categoryId = categoryId
                        questionCopy.categoryName = categoryName

                        questions.push(questionCopy)
                    })
                } catch (error) {
                    console.error(`处理分类 ${categoryName} 时出错:`, error)
                }
            }
        })
    } catch (error) {
        console.error('生成随机问题时出错:', error)
    }

    console.log('生成的随机问题总数:', questions.length)

    if (questions.length === 0) {
        console.warn('没有生成任何问题，请检查分类和问题数据')
        ElMessage.warning('没有可用的面试问题，请先在编辑页面添加一些问题')
    }

    // 再次随机打乱所有问题的顺序
    return questions.sort(() => 0.5 - Math.random())
}

// 开始模拟面试
const startInterview = () => {
    // 如果选择了语音输入，先检查设备
    if (interviewState.inputMethod === 'voice') {
        checkAudioDevice()
            .then(() => {
                startInterviewCore()
            })
            .catch(error => {
                console.error('开始面试前设备检查失败:', error)
                showDeviceCheckDialog()
            })
    } else {
        startInterviewCore()
    }
}

// 核心开始面试功能
const startInterviewCore = () => {
    console.log('开始模拟面试前状态检查:', {
        categoriesCount: categories.length,
        hasQuestions: Object.keys(interviewQuestions).length > 0
    })

    interviewState.questions = generateRandomQuestions()
    console.log('生成的模拟面试问题:', interviewState.questions)

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

    // 确保问题有唯一ID
    if (!currentQuestion.value.id) {
        currentQuestion.value.id = `question-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    }

    // 保存答案
    interviewState.answers[currentQuestion.value.id] = currentAnswer.value

    try {
        // 评估答案
        console.log('评估答案:', {
            questionId: currentQuestion.value.id,
            answer: currentAnswer.value.substring(0, 50) + '...',
            referenceAnswer: currentQuestion.value.answer ? (currentQuestion.value.answer.substring(0, 50) + '...') : '未提供参考答案'
        })

        // 注意：evaluateAnswer函数的参数顺序是 (参考答案, 用户答案)
        const evaluation = evaluateAnswer(
            currentQuestion.value.answer || '参考答案未提供',
            currentAnswer.value || ''
        )

        // 确保评估结果有效
        if (!evaluation || typeof evaluation.score !== 'number') {
            console.error('评估结果无效:', evaluation)
            interviewState.evaluations[currentQuestion.value.id] = {
                score: 60,
                grade: '一般',
                feedback: '无法准确评估您的答案，请参考标准答案。',
                details: []
            }
        } else {
            interviewState.evaluations[currentQuestion.value.id] = evaluation
        }

        console.log('评估结果:', interviewState.evaluations[currentQuestion.value.id])
    } catch (error) {
        console.error('评估答案时出错:', error)
        // 提供默认评估结果，避免错误影响用户体验
        interviewState.evaluations[currentQuestion.value.id] = {
            score: 60,
            grade: '一般',
            feedback: '评估过程中遇到错误，请参考标准答案。',
            details: []
        }
    }

    // 如果是语音输入，停止监听
    if (interviewState.inputMethod === 'voice' && isListening.value) {
        stopListening()
    }

    // 显示当前题目的评分结果
    interviewState.showingResult = true

    // 奖励10积分
    addPoints(10)
    ElMessage.success('回答完成，获得10积分！')
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

    // 确保每个评估都有有效的分数
    const scores = Object.values(interviewState.evaluations)
        .filter(evaluation => evaluation && typeof evaluation.score === 'number' && !isNaN(evaluation.score))
        .map(evaluation => evaluation.score)

    // 如果没有有效分数，返回0
    if (scores.length === 0) return 0

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
    // 如果默认选择语音输入，先进行音频设备检测
    if (interviewState.inputMethod === 'voice') {
        checkAudioDevice()
            .then(() => {
                initSpeechRecognition()
            })
            .catch(error => {
                console.error('初始化时设备检查失败:', error)
                // 默认切换到文本输入
                interviewState.inputMethod = 'text'
            })
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
                        <el-radio label="voice">语音输入
                            <el-tooltip content="语音输入需要麦克风或耳机支持" placement="top">
                                <el-icon class="info-icon">
                                    <InfoFilled />
                                </el-icon>
                            </el-tooltip>
                        </el-radio>
                    </el-radio-group>

                    <div v-if="interviewState.inputMethod === 'voice'" class="device-check-info">
                        <el-button @click="checkAudioDevice" size="small" type="info"
                            :disabled="audioDeviceState.isChecking">
                            <el-icon>
                                <Microphone />
                            </el-icon>
                            检测麦克风设备
                        </el-button>
                        <div v-if="audioDeviceState.isDeviceConnected" class="device-status success">
                            <el-icon>
                                <CircleCheckFilled />
                            </el-icon> 麦克风设备已连接
                        </div>
                        <div v-else-if="audioDeviceState.errorMessage" class="device-status error">
                            <el-icon>
                                <CircleCloseFilled />
                            </el-icon> {{ audioDeviceState.errorMessage }}
                        </div>
                    </div>
                </div>

                <el-button type="primary" size="large" @click="startInterview" class="start-button">
                    开始模拟面试
                </el-button>
            </div>
        </div>

        <!-- 进行中状态 -->
        <div v-else-if="interviewState.started && !interviewState.finished" class="interview-content">
            <!-- 没有问题时显示提示 -->
            <div v-if="interviewState.questions.length === 0" class="no-questions-warning">
                <el-empty description="没有可用的面试问题">
                    <template #description>
                        <p>系统未找到任何面试问题，请先添加一些问题后再开始模拟面试。</p>
                    </template>
                    <el-button type="primary" @click="goBack">返回首页</el-button>
                </el-empty>
            </div>

            <!-- 有问题时显示问题内容 -->
            <div v-else class="question-container">
                <div class="progress-info">
                    <div class="progress-text">
                        问题 {{ interviewState.currentQuestionIndex + 1 }}/{{ interviewState.questions.length }}
                    </div>
                    <div class="timer">
                        用时: {{ formatTime(interviewState.timeSpent) }}
                    </div>
                </div>

                <el-card class="question-card" v-if="currentQuestion">
                    <template #header>
                        <div class="question-header">
                            <div class="category-tag">{{ currentQuestion.categoryName }}</div>
                            <div class="question-title">{{ currentQuestion.question }}</div>
                        </div>
                    </template>

                    <div v-if="!interviewState.showingResult">
                        <div class="answer-method">
                            <el-radio-group v-model="interviewState.inputMethod" @change="toggleInputMethod"
                                :disabled="isListening">
                                <el-radio label="text">文本输入</el-radio>
                                <el-radio label="voice">语音输入</el-radio>
                            </el-radio-group>
                            <el-tag v-if="isListening" type="success" effect="dark">正在录音...</el-tag>
                        </div>

                        <div class="answer-input">
                            <el-input v-model="currentAnswer" type="textarea" :rows="8" placeholder="请输入您的答案..."
                                :disabled="interviewState.inputMethod === 'voice'" />
                        </div>

                        <div class="answer-actions">
                            <el-button type="primary" @click="submitAnswer" :disabled="!currentAnswer.trim()">
                                提交答案
                            </el-button>
                            <el-button @click="resetAnswer">
                                重置答案
                            </el-button>
                        </div>
                    </div>

                    <div v-else class="result-display">
                        <h3>回答评估</h3>
                        <div class="score-display">
                            <el-progress type="dashboard"
                                :percentage="interviewState.evaluations[currentQuestion.id]?.score || 0"
                                :color="(interviewState.evaluations[currentQuestion.id]?.score || 0) >= 60 ? '#67C23A' : '#F56C6C'"
                                :status="getProgressStatus((interviewState.evaluations[currentQuestion.id]?.score || 0))">
                                <template #default>
                                    <div class="score-value">{{ interviewState.evaluations[currentQuestion.id]?.score ||
                                        0 }}</div>
                                    <div class="score-label">分</div>
                                </template>
                            </el-progress>
                        </div>

                        <div class="feedback">
                            <div class="feedback-title">评价:</div>
                            <div class="feedback-content">{{ interviewState.evaluations[currentQuestion.id]?.feedback ||
                                '无法评估答案' }}
                            </div>
                        </div>

                        <div class="model-answer">
                            <div class="model-answer-title">参考答案:</div>
                            <div class="model-answer-content">{{ currentQuestion.answer }}</div>
                        </div>

                        <div class="result-actions">
                            <el-button type="primary" @click="continueToNextQuestion">
                                {{ interviewState.currentQuestionIndex < interviewState.questions.length - 1 ? '下一题'
                                    : '完成面试' }} </el-button>
                        </div>
                    </div>
                </el-card>
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
                    <div v-for="(question, index) in interviewState.questions" :key="question.id || index"
                        class="result-item">
                        <div class="result-question">
                            <div class="question-header">
                                <span class="question-number">问题 {{ index + 1 }}</span>
                                <el-tag size="small">{{ question.categoryName || '未分类' }}</el-tag>
                                <span v-if="question.id && interviewState.evaluations[question.id]"
                                    class="question-score">
                                    得分: {{ interviewState.evaluations[question.id]?.score || 0 }}
                                    <span class="question-grade">({{ interviewState.evaluations[question.id]?.grade ||
                                        '未评分'
                                    }})</span>
                                </span>
                                <span v-else class="question-score">未评分</span>
                            </div>
                            <div class="question-content">{{ question.question || '未知问题' }}</div>
                        </div>

                        <div class="result-answer">
                            <div class="answer-header">您的回答:</div>
                            <div class="answer-content">{{ question.id && interviewState.answers[question.id] || '未作答'
                            }}</div>
                        </div>

                        <div class="result-reference">
                            <div class="reference-header">参考答案:</div>
                            <div class="reference-content"
                                v-html="(question.answer || '未提供参考答案').replace(/\n/g, '<br>')"></div>
                        </div>

                        <div v-if="question.id && interviewState.evaluations[question.id]" class="result-evaluation">
                            <div class="evaluation-header">评估反馈:</div>
                            <div class="evaluation-feedback">{{ interviewState.evaluations[question.id]?.feedback ||
                                '无评估反馈' }}
                            </div>

                            <div class="evaluation-details">
                                <div v-for="(detail, i) in interviewState.evaluations[question.id]?.details || []"
                                    :key="i" class="detail-item">
                                    <div class="detail-aspect">{{ detail.aspect }}:</div>
                                    <el-progress :percentage="detail.score || 0"
                                        :status="getProgressStatus(detail.score || 0)" :stroke-width="10" />
                                    <div class="detail-description">{{ detail.description || '' }}</div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="result-evaluation">
                            <div class="evaluation-header">评估反馈:</div>
                            <div class="evaluation-feedback">此题未完成评估</div>
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

        <!-- 音频设备检查对话框 -->
        <el-dialog v-model="audioDeviceState.showDeviceCheckDialog" title="音频设备检查" width="400px">
            <div class="audio-check-dialog">
                <div v-if="audioDeviceState.isChecking" class="checking-status">
                    <el-icon>
                        <Loading />
                    </el-icon>
                    正在检测麦克风或耳机设备...
                </div>
                <div v-else-if="!audioDeviceState.isDeviceConnected" class="error-status">
                    <el-icon>
                        <WarningFilled />
                    </el-icon>
                    <div class="error-message">{{ audioDeviceState.errorMessage || '未检测到麦克风设备' }}</div>
                    <div class="device-tips">
                        <p>提示：</p>
                        <ul>
                            <li>确保您的耳机或麦克风已正确连接到电脑</li>
                            <li>检查设备是否被其他应用程序占用</li>
                            <li>在浏览器设置中允许麦克风访问权限</li>
                            <li>重新连接设备后点击"重新检测"按钮</li>
                        </ul>
                    </div>
                </div>
                <div v-else class="success-status">
                    <el-icon>
                        <CircleCheckFilled />
                    </el-icon>
                    麦克风设备已连接，可以开始语音输入了！
                </div>
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="checkAudioDevice" :loading="audioDeviceState.isChecking">
                        重新检测
                    </el-button>
                    <el-button @click="handleDeviceCheckResult(false)" type="info">
                        切换到文本输入
                    </el-button>
                    <el-button @click="handleDeviceCheckResult(true)" type="primary"
                        :disabled="!audioDeviceState.isDeviceConnected">
                        继续使用语音输入
                    </el-button>
                </div>
            </template>
        </el-dialog>
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
.interview-content {
    max-width: 800px;
    margin: 0 auto;
}

.question-container {
    margin-bottom: 20px;
}

.progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    background-color: #f5f7fa;
    padding: 10px 15px;
    border-radius: 6px;
}

.progress-text {
    font-size: 0.95rem;
    color: #606266;
}

.timer {
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

.question-header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.category-tag {
    margin-right: 10px;
}

.question-title {
    font-size: 1.3rem;
    color: #303133;
    margin-bottom: 25px;
    line-height: 1.4;
}

.answer-method {
    margin-bottom: 20px;
}

.answer-input {
    margin-bottom: 20px;
}

.answer-actions {
    display: flex;
    justify-content: flex-end;
}

.result-display {
    margin-top: 20px;
}

.score-display {
    margin-bottom: 20px;
}

.feedback {
    margin-bottom: 20px;
}

.model-answer {
    margin-bottom: 20px;
}

.result-actions {
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

.device-check-info {
    margin-top: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.device-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 15px;
    border-radius: 4px;
}

.device-status.success {
    color: #67C23A;
    background-color: #f0f9eb;
}

.device-status.error {
    color: #F56C6C;
    background-color: #fef0f0;
}

.info-icon {
    color: #909399;
    margin-left: 5px;
    cursor: help;
}

.audio-check-dialog {
    padding: 10px;
    min-height: 150px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.checking-status,
.error-status,
.success-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    text-align: center;
}

.error-status {
    color: #F56C6C;
}

.error-message {
    font-size: 1.1rem;
    margin-bottom: 10px;
}

.success-status {
    color: #67C23A;
    font-size: 1.1rem;
}

.device-tips {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    width: 100%;
    text-align: left;
    margin-top: 5px;
}

.device-tips p {
    font-weight: bold;
    margin-bottom: 8px;
    color: #303133;
}

.device-tips ul {
    padding-left: 20px;
    margin: 0;
}

.device-tips li {
    margin-bottom: 8px;
    color: #606266;
    font-size: 0.9rem;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
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