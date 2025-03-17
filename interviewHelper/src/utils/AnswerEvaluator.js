/**
 * 答案评估工具类
 * 用于分析用户的答案并给出评分和反馈
 */

// 评分标准
const SCORE_CRITERIA = {
    EXCELLENT: { min: 90, max: 100, label: '优秀', description: '回答全面准确，包含所有关键点，表述清晰' },
    GOOD: { min: 75, max: 89, label: '良好', description: '回答基本准确，包含大部分关键点，表述较清晰' },
    AVERAGE: { min: 60, max: 74, label: '一般', description: '回答部分准确，包含部分关键点，表述基本清晰' },
    POOR: { min: 40, max: 59, label: '较差', description: '回答不够准确，缺少多数关键点，表述不够清晰' },
    VERY_POOR: { min: 0, max: 39, label: '差', description: '回答不准确，几乎没有关键点，表述混乱' }
}

/**
 * 评估答案
 * @param {string} userAnswer - 用户的答案
 * @param {string} referenceAnswer - 参考答案
 * @returns {Object} 评估结果，包含分数、等级和反馈
 */
export function evaluateAnswer(userAnswer, referenceAnswer) {
    if (!userAnswer || userAnswer.trim() === '') {
        return {
            score: 0,
            grade: SCORE_CRITERIA.VERY_POOR.label,
            feedback: '未提供答案',
            details: []
        }
    }

    // 提取参考答案中的关键点
    const keyPoints = extractKeyPoints(referenceAnswer)

    // 计算用户答案中包含的关键点
    const matchedPoints = keyPoints.filter(point =>
        userAnswer.toLowerCase().includes(point.toLowerCase())
    )

    // 计算关键点覆盖率
    const coverage = matchedPoints.length / keyPoints.length

    // 基础分数 (基于关键点覆盖率)
    let baseScore = Math.round(coverage * 100)

    // 分析答案的完整性和清晰度
    const completenessScore = analyzeCompleteness(userAnswer, referenceAnswer)
    const clarityScore = analyzeClarity(userAnswer)

    // 最终分数 (关键点覆盖60%权重，完整性30%权重，清晰度10%权重)
    const finalScore = Math.round(baseScore * 0.6 + completenessScore * 0.3 + clarityScore * 0.1)

    // 确定评分等级
    const grade = determineGrade(finalScore)

    // 生成反馈
    const feedback = generateFeedback(finalScore, matchedPoints, keyPoints)

    // 详细分析
    const details = [
        { aspect: '关键点覆盖', score: baseScore, description: `包含了${matchedPoints.length}/${keyPoints.length}个关键点` },
        { aspect: '答案完整性', score: completenessScore, description: getCompletenessDescription(completenessScore) },
        { aspect: '表述清晰度', score: clarityScore, description: getClarityDescription(clarityScore) }
    ]

    return {
        score: finalScore,
        grade,
        feedback,
        details
    }
}

/**
 * 从参考答案中提取关键点
 * @param {string} referenceAnswer - 参考答案
 * @returns {Array} 关键点列表
 */
function extractKeyPoints(referenceAnswer) {
    // 简单实现：按行分割，并过滤掉空行和数字编号
    const lines = referenceAnswer.split('\n')

    // 过滤出可能的关键点
    const keyPoints = []

    lines.forEach(line => {
        // 去除前导数字和符号
        const cleanLine = line.trim().replace(/^[\d\.\-\*]+\s*/, '')

        // 如果行不为空且长度适中，认为是关键点
        if (cleanLine && cleanLine.length > 5 && cleanLine.length < 100) {
            // 进一步分割可能包含多个关键点的行
            const subPoints = cleanLine.split(/[,;，；]/)
            subPoints.forEach(subPoint => {
                const trimmedPoint = subPoint.trim()
                if (trimmedPoint && trimmedPoint.length > 5) {
                    keyPoints.push(trimmedPoint)
                }
            })
        }
    })

    // 如果提取的关键点太少，尝试使用整段作为关键点
    if (keyPoints.length < 3) {
        return referenceAnswer
            .split(/[.。!！?？]/)
            .map(s => s.trim())
            .filter(s => s.length > 5)
    }

    return keyPoints
}

/**
 * 分析答案的完整性
 * @param {string} userAnswer - 用户答案
 * @param {string} referenceAnswer - 参考答案
 * @returns {number} 完整性得分 (0-100)
 */
function analyzeCompleteness(userAnswer, referenceAnswer) {
    // 简单实现：基于长度比例和结构相似性
    const userLength = userAnswer.length
    const refLength = referenceAnswer.length

    // 长度比例得分
    const lengthRatio = Math.min(userLength / refLength, 1.5) // 最高150%
    const lengthScore = Math.min(Math.round(lengthRatio * 100), 100)

    // 结构相似性 (检查是否包含类似的段落结构)
    const userParagraphs = userAnswer.split(/\n+/).length
    const refParagraphs = referenceAnswer.split(/\n+/).length
    const structureScore = Math.min(Math.round((userParagraphs / refParagraphs) * 100), 100)

    // 综合得分
    return Math.round((lengthScore * 0.7) + (structureScore * 0.3))
}

/**
 * 分析答案的清晰度
 * @param {string} userAnswer - 用户答案
 * @returns {number} 清晰度得分 (0-100)
 */
function analyzeClarity(userAnswer) {
    // 简单实现：基于句子长度、标点符号使用等

    // 检查平均句子长度 (理想的句子长度在15-25个字之间)
    const sentences = userAnswer.split(/[.。!！?？]/).filter(s => s.trim().length > 0)
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / (sentences.length || 1)

    // 句子长度得分 (太长或太短都不理想)
    let sentenceLengthScore = 100
    if (avgSentenceLength > 40) {
        sentenceLengthScore = Math.max(100 - (avgSentenceLength - 40) * 2, 0)
    } else if (avgSentenceLength < 10) {
        sentenceLengthScore = Math.max(avgSentenceLength * 10, 0)
    }

    // 标点符号使用
    const punctuationCount = (userAnswer.match(/[,.;:，。；：!！?？]/g) || []).length
    const idealPunctuationRatio = 1 / 15 // 理想情况下每15个字符有1个标点
    const actualPunctuationRatio = punctuationCount / userAnswer.length
    const punctuationScore = Math.max(100 - Math.abs(actualPunctuationRatio - idealPunctuationRatio) * 1000, 0)

    // 综合得分
    return Math.round((sentenceLengthScore * 0.7) + (punctuationScore * 0.3))
}

/**
 * 根据分数确定评分等级
 * @param {number} score - 分数
 * @returns {string} 评分等级
 */
function determineGrade(score) {
    if (score >= SCORE_CRITERIA.EXCELLENT.min) return SCORE_CRITERIA.EXCELLENT.label
    if (score >= SCORE_CRITERIA.GOOD.min) return SCORE_CRITERIA.GOOD.label
    if (score >= SCORE_CRITERIA.AVERAGE.min) return SCORE_CRITERIA.AVERAGE.label
    if (score >= SCORE_CRITERIA.POOR.min) return SCORE_CRITERIA.POOR.label
    return SCORE_CRITERIA.VERY_POOR.label
}

/**
 * 生成反馈信息
 * @param {number} score - 分数
 * @param {Array} matchedPoints - 匹配的关键点
 * @param {Array} keyPoints - 所有关键点
 * @returns {string} 反馈信息
 */
function generateFeedback(score, matchedPoints, keyPoints) {
    let feedback = ''

    // 根据分数生成总体评价
    if (score >= SCORE_CRITERIA.EXCELLENT.min) {
        feedback = '您的回答非常出色！'
    } else if (score >= SCORE_CRITERIA.GOOD.min) {
        feedback = '您的回答很好！'
    } else if (score >= SCORE_CRITERIA.AVERAGE.min) {
        feedback = '您的回答基本合格。'
    } else if (score >= SCORE_CRITERIA.POOR.min) {
        feedback = '您的回答需要改进。'
    } else {
        feedback = '您的回答有较大改进空间。'
    }

    // 添加关键点覆盖情况
    const missingPoints = keyPoints.filter(point =>
        !matchedPoints.includes(point)
    )

    if (missingPoints.length > 0) {
        feedback += ` 您可以考虑补充以下关键点：${missingPoints.length > 3
            ? missingPoints.slice(0, 3).join('、') + '等'
            : missingPoints.join('、')}。`
    } else {
        feedback += ' 您已覆盖所有关键点！'
    }

    return feedback
}

/**
 * 获取完整性描述
 * @param {number} score - 完整性得分
 * @returns {string} 描述
 */
function getCompletenessDescription(score) {
    if (score >= 90) return '回答非常完整'
    if (score >= 75) return '回答比较完整'
    if (score >= 60) return '回答基本完整'
    if (score >= 40) return '回答不够完整'
    return '回答严重不完整'
}

/**
 * 获取清晰度描述
 * @param {number} score - 清晰度得分
 * @returns {string} 描述
 */
function getClarityDescription(score) {
    if (score >= 90) return '表述非常清晰'
    if (score >= 75) return '表述比较清晰'
    if (score >= 60) return '表述基本清晰'
    if (score >= 40) return '表述不够清晰'
    return '表述混乱'
} 