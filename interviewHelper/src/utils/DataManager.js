/**
 * 数据管理工具
 * 用于导出和导入面试题数据
 */
import { defaultCategories, defaultInterviewQuestions } from '@/data/interviewData'
import { ElMessage } from 'element-plus'

// 本地存储键
const STORAGE_KEY = 'interview-helper-data'

/**
 * 初始化数据管理器
 */
export function initDataManager() {
    // 检查localStorage中是否已有数据
    const storedData = localStorage.getItem(STORAGE_KEY)
    if (!storedData) {
        // 如果没有，初始化为默认数据
        saveCustomData({
            categories: defaultCategories,
            interviewQuestions: defaultInterviewQuestions
        })
        console.log('数据管理器已初始化为默认数据')
    } else {
        console.log('数据管理器已加载本地存储数据')
    }
}

/**
 * 获取当前题库数据
 * @returns {Object} 包含分类和面试题的对象
 */
export function getCurrentData() {
    try {
        // 获取localStorage中可能存在的自定义数据
        const customData = getCustomData()

        // 确保每个属性都有默认值
        const result = {
            categories: Array.isArray(customData.categories) ? customData.categories : [...defaultCategories],
            interviewQuestions: typeof customData.interviewQuestions === 'object' ? customData.interviewQuestions : { ...defaultInterviewQuestions }
        }

        // 确保interviewQuestions有值，防止null/undefined访问错误
        if (!result.interviewQuestions) {
            result.interviewQuestions = { ...defaultInterviewQuestions }
        }

        // 如果categories为空但是有默认分类，使用默认分类
        if (!result.categories || result.categories.length === 0) {
            result.categories = [...defaultCategories]
        }

        return result
    } catch (error) {
        console.error('获取当前数据时出错:', error)
        // 出错时返回默认数据
        return {
            categories: [...defaultCategories],
            interviewQuestions: { ...defaultInterviewQuestions }
        }
    }
}

/**
 * 从localStorage获取自定义数据
 * @returns {Object} 自定义数据对象
 */
function getCustomData() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY)
        if (!storedData) {
            return {
                categories: [...defaultCategories],
                interviewQuestions: { ...defaultInterviewQuestions }
            }
        }
        return JSON.parse(storedData)
    } catch (error) {
        console.error('从本地存储获取数据失败:', error)
        return {
            categories: [...defaultCategories],
            interviewQuestions: { ...defaultInterviewQuestions }
        }
    }
}

/**
 * 保存自定义数据到localStorage
 * @param {Object} data 要保存的数据对象
 */
export function saveCustomData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        return true
    } catch (error) {
        console.error('保存数据到本地存储失败:', error)
        ElMessage.error('保存数据失败，可能是由于存储空间限制。')
        return false
    }
}

/**
 * 导出数据为JSON文件
 */
export function exportData() {
    try {
        // 获取当前数据
        const data = getCurrentData()

        // 创建Blob对象
        const jsonData = JSON.stringify(data, null, 2)
        const blob = new Blob([jsonData], { type: 'application/json' })

        // 创建下载链接
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)

        // 设置文件名（使用当前日期作为文件名一部分）
        const date = new Date()
        const fileName = `interview-data-${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}.json`
        link.download = fileName

        // 触发下载
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        ElMessage.success('数据导出成功')
        return true
    } catch (error) {
        console.error('导出数据失败:', error)
        ElMessage.error('导出数据失败: ' + error.message)
        return false
    }
}

/**
 * 导入数据
 * @param {File} file 包含题库数据的JSON文件
 * @returns {Promise<boolean>} 导入是否成功
 */
export async function importData(file) {
    return new Promise((resolve) => {
        try {
            // 创建文件读取器
            const reader = new FileReader()

            // 设置读取完成回调
            reader.onload = (event) => {
                try {
                    // 解析JSON数据
                    const data = JSON.parse(event.target.result)

                    // 验证数据格式
                    if (!validateData(data)) {
                        ElMessage.error('导入的数据格式不正确')
                        resolve(false)
                        return
                    }

                    // 保存数据到localStorage
                    const success = saveCustomData(data)
                    if (success) {
                        ElMessage.success('数据导入成功')
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                } catch (parseError) {
                    console.error('解析导入数据失败:', parseError)
                    ElMessage.error('导入失败: 文件不是有效的JSON格式')
                    resolve(false)
                }
            }

            // 设置读取错误回调
            reader.onerror = () => {
                ElMessage.error('读取文件失败')
                resolve(false)
            }

            // 读取文件
            reader.readAsText(file)
        } catch (error) {
            console.error('导入数据失败:', error)
            ElMessage.error('导入数据失败: ' + error.message)
            resolve(false)
        }
    })
}

/**
 * 重置数据到默认状态
 * @returns {boolean} 是否成功
 */
export function resetData() {
    try {
        // 移除本地存储中的数据
        localStorage.removeItem(STORAGE_KEY)

        // 重新初始化为默认数据
        initDataManager()

        ElMessage.success('数据已重置为默认状态')
        return true
    } catch (error) {
        console.error('重置数据失败:', error)
        ElMessage.error('重置数据失败: ' + error.message)
        return false
    }
}

/**
 * 验证导入的数据格式
 * @param {Object} data 导入的数据
 * @returns {boolean} 是否有效
 */
function validateData(data) {
    // 检查基本结构
    if (!data || typeof data !== 'object') return false

    // 检查categories是否为数组
    if (!Array.isArray(data.categories)) return false

    // 检查interviewQuestions是否为对象
    if (!data.interviewQuestions || typeof data.interviewQuestions !== 'object') return false

    // 简单检查每个分类是否在interviewQuestions中有对应的问题
    for (const category of data.categories) {
        if (typeof category !== 'string') return false

        // 检查是否有对应的问题数组
        const questions = data.interviewQuestions[category]
        if (!Array.isArray(questions)) return false

        // 检查每个问题的格式
        for (const question of questions) {
            if (!question.question || !question.answer) return false
        }
    }

    return true
}

/**
 * 添加新的面试题
 * @param {string} category 分类名称
 * @param {string} question 问题内容 
 * @param {string} answer 答案内容
 * @returns {boolean} 是否成功
 */
export function addInterviewQuestion(category, question, answer) {
    try {
        // 获取当前数据
        const data = getCurrentData()

        // 检查分类是否存在，不存在则添加
        if (!data.categories.includes(category)) {
            data.categories.push(category)
        }

        // 检查该分类的问题数组是否存在，不存在则创建
        if (!data.interviewQuestions[category]) {
            data.interviewQuestions[category] = []
        }

        // 添加新问题
        data.interviewQuestions[category].push({
            question,
            answer
        })

        // 保存数据
        const success = saveCustomData(data)
        if (success) {
            ElMessage.success('添加问题成功')
        }
        return success
    } catch (error) {
        console.error('添加问题失败:', error)
        ElMessage.error('添加问题失败: ' + error.message)
        return false
    }
}

/**
 * 更新面试题
 * @param {string} category 分类名称
 * @param {number} index 问题索引
 * @param {string} question 问题内容
 * @param {string} answer 答案内容
 * @returns {boolean} 是否成功
 */
export function updateInterviewQuestion(category, index, question, answer) {
    try {
        // 获取当前数据
        const data = getCurrentData()

        // 检查分类和索引是否有效
        if (!data.interviewQuestions[category] ||
            !data.interviewQuestions[category][index]) {
            ElMessage.error('无法找到要更新的问题')
            return false
        }

        // 更新问题
        data.interviewQuestions[category][index] = {
            question,
            answer
        }

        // 保存数据
        const success = saveCustomData(data)
        if (success) {
            ElMessage.success('更新问题成功')
        }
        return success
    } catch (error) {
        console.error('更新问题失败:', error)
        ElMessage.error('更新问题失败: ' + error.message)
        return false
    }
}

/**
 * 删除面试题
 * @param {string} category 分类名称
 * @param {number} index 问题索引
 * @returns {boolean} 是否成功
 */
export function deleteInterviewQuestion(category, index) {
    try {
        // 获取当前数据
        const data = getCurrentData()

        // 检查分类和索引是否有效
        if (!data.interviewQuestions[category] ||
            !data.interviewQuestions[category][index]) {
            ElMessage.error('无法找到要删除的问题')
            return false
        }

        // 删除问题
        data.interviewQuestions[category].splice(index, 1)

        // 如果该分类下没有问题了，考虑是否删除该分类
        if (data.interviewQuestions[category].length === 0) {
            delete data.interviewQuestions[category]

            // 从categories中也删除
            const categoryIndex = data.categories.indexOf(category)
            if (categoryIndex !== -1) {
                data.categories.splice(categoryIndex, 1)
            }
        }

        // 保存数据
        const success = saveCustomData(data)
        if (success) {
            ElMessage.success('删除问题成功')
        }
        return success
    } catch (error) {
        console.error('删除问题失败:', error)
        ElMessage.error('删除问题失败: ' + error.message)
        return false
    }
}

/**
 * 编辑分类名称
 * @param {string} oldCategoryName 旧分类名称
 * @param {string} newCategoryName 新分类名称
 * @returns {boolean} 是否成功
 */
export function editCategory(oldCategoryName, newCategoryName) {
    if (!oldCategoryName || !newCategoryName) {
        console.error('分类名称不能为空')
        return false
    }

    try {
        // 获取当前数据
        const data = getCurrentData()

        // 检查旧分类是否存在
        const categoryIndex = data.categories.indexOf(oldCategoryName)
        if (categoryIndex === -1) {
            console.error(`分类 "${oldCategoryName}" 不存在`)
            return false
        }

        // 检查新分类名是否已存在
        if (data.categories.includes(newCategoryName) && oldCategoryName !== newCategoryName) {
            console.error(`分类 "${newCategoryName}" 已存在`)
            return false
        }

        // 更新分类数组中的名称
        data.categories[categoryIndex] = newCategoryName

        // 复制问题到新分类名下
        if (data.interviewQuestions[oldCategoryName]) {
            data.interviewQuestions[newCategoryName] = [...data.interviewQuestions[oldCategoryName]]

            // 删除旧分类下的问题
            delete data.interviewQuestions[oldCategoryName]
        }

        // 保存数据
        return saveCustomData(data)
    } catch (error) {
        console.error('编辑分类失败:', error)
        return false
    }
} 