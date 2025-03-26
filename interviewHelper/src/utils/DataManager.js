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
        console.log('开始导出数据');
        // 获取当前数据
        const rawData = getCurrentData();

        // 标准化数据格式，确保导出格式正确
        const exportData = {
            categories: [...rawData.categories],
            interviewQuestions: {}
        };

        // 处理问题数据
        for (const category of exportData.categories) {
            // 确保每个分类都有问题数组
            const questions = rawData.interviewQuestions[category] || [];

            // 标准化每个问题对象
            exportData.interviewQuestions[category] = questions.map((q, index) => {
                // 确保每个问题对象包含必要的字段
                return {
                    question: q.question || `问题 ${index + 1}`,
                    answer: q.answer || '暂无答案',
                    // 保留其他可能的属性
                    ...(q.id ? { id: q.id } : {})
                };
            });
        }

        console.log('准备导出的数据:', exportData);

        // 创建Blob对象
        const jsonData = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });

        // 创建下载链接
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);

        // 设置文件名（使用当前日期作为文件名一部分）
        const date = new Date();
        const fileName = `interview-data-${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}.json`;
        link.download = fileName;

        // 触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('数据导出成功');
        ElMessage.success('数据导出成功');
        return true;
    } catch (error) {
        console.error('导出数据失败:', error);
        ElMessage.error('导出数据失败: ' + error.message);
        return false;
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
            console.log('开始导入数据', file.name);

            // 创建文件读取器
            const reader = new FileReader();

            // 设置读取完成回调
            reader.onload = (event) => {
                try {
                    // 解析JSON数据
                    const fileContent = event.target.result;
                    console.log('文件内容长度:', fileContent.length);

                    try {
                        const data = JSON.parse(fileContent);
                        console.log('JSON解析成功:', data);

                        // 尝试修复数据格式问题
                        const fixedData = fixDataFormat(data);

                        // 验证数据格式
                        if (!validateData(fixedData)) {
                            console.error('数据验证失败');
                            ElMessage.error('导入的数据格式不正确，请确保使用本应用导出的数据文件');
                            resolve(false);
                            return;
                        }

                        // 保存数据到localStorage
                        const success = saveCustomData(fixedData);
                        if (success) {
                            console.log('数据保存成功');
                            ElMessage.success('数据导入成功');
                            resolve(true);
                        } else {
                            console.error('数据保存失败');
                            resolve(false);
                        }
                    } catch (parseError) {
                        console.error('JSON解析失败:', parseError);
                        ElMessage.error('导入失败: 文件不是有效的JSON格式');
                        resolve(false);
                    }
                } catch (error) {
                    console.error('文件读取回调中出错:', error);
                    ElMessage.error('处理文件内容时出错: ' + error.message);
                    resolve(false);
                }
            };

            // 设置读取错误回调
            reader.onerror = (error) => {
                console.error('文件读取错误:', error);
                ElMessage.error('读取文件失败');
                resolve(false);
            };

            // 读取文件
            reader.readAsText(file);
        } catch (error) {
            console.error('导入数据过程中出错:', error);
            ElMessage.error('导入数据失败: ' + error.message);
            resolve(false);
        }
    });
}

/**
 * 修复数据格式问题
 * @param {Object} data 原始数据对象
 * @returns {Object} 修复后的数据对象
 */
function fixDataFormat(data) {
    // 如果没有基本结构，则返回默认数据
    if (!data || typeof data !== 'object') {
        console.warn('数据不是对象，使用默认数据');
        return {
            categories: [...defaultCategories],
            interviewQuestions: { ...defaultInterviewQuestions }
        };
    }

    // 创建一个新对象以避免修改原始对象
    const result = {
        categories: Array.isArray(data.categories) ? [...data.categories] : [...defaultCategories],
        interviewQuestions: (data.interviewQuestions && typeof data.interviewQuestions === 'object')
            ? { ...data.interviewQuestions }
            : { ...defaultInterviewQuestions }
    };

    // 确保每个分类都有相应的问题数组
    for (const category of result.categories) {
        if (!result.interviewQuestions[category]) {
            console.warn(`为分类 "${category}" 创建空问题数组`);
            result.interviewQuestions[category] = [];
        }
    }

    // 确保interviewQuestions中的每个分类也在categories中
    for (const category in result.interviewQuestions) {
        if (!result.categories.includes(category)) {
            console.warn(`将缺失的分类 "${category}" 添加到categories数组`);
            result.categories.push(category);
        }
    }

    // 确保每个问题对象都有必要的属性
    for (const category in result.interviewQuestions) {
        const questions = result.interviewQuestions[category];
        if (Array.isArray(questions)) {
            for (let i = 0; i < questions.length; i++) {
                const question = questions[i];
                if (question && typeof question === 'object') {
                    // 确保question属性存在
                    if (!question.question || typeof question.question !== 'string') {
                        question.question = question.question || `问题 ${i + 1}`;
                    }

                    // 确保answer属性存在
                    if (!question.answer || typeof question.answer !== 'string') {
                        question.answer = question.answer || '暂无答案';
                    }
                } else {
                    // 替换无效的问题对象
                    questions[i] = {
                        question: `问题 ${i + 1}`,
                        answer: '暂无答案'
                    };
                }
            }
        } else {
            // 如果不是数组，则创建一个空数组
            result.interviewQuestions[category] = [];
        }
    }

    console.log('数据格式修复完成:', result);
    return result;
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
    console.log('开始验证导入的数据格式:', data);

    // 检查基本结构
    if (!data || typeof data !== 'object') {
        console.error('验证失败: 数据必须是一个对象');
        return false;
    }

    // 检查categories是否为数组
    if (!Array.isArray(data.categories)) {
        console.error('验证失败: categories必须是一个数组');
        return false;
    }

    // 检查interviewQuestions是否为对象
    if (!data.interviewQuestions || typeof data.interviewQuestions !== 'object') {
        console.error('验证失败: interviewQuestions必须是一个对象');
        return false;
    }

    // 检查分类中是否有非字符串值
    for (const category of data.categories) {
        if (typeof category !== 'string') {
            console.error('验证失败: 分类名称必须是字符串:', category);
            return false;
        }
    }

    // 检查问题对象的格式，但更加宽松
    for (const category in data.interviewQuestions) {
        const questions = data.interviewQuestions[category];

        // 跳过不是数组的问题集合
        if (!Array.isArray(questions)) {
            console.warn(`警告: 分类"${category}"的问题不是数组格式，但会继续验证其他分类`);
            continue;
        }

        // 检查问题对象
        for (const question of questions) {
            // 只检查问题对象是否存在，不再严格要求question和answer属性
            if (!question || typeof question !== 'object') {
                console.error(`验证失败: 分类"${category}"中存在无效的问题对象:`, question);
                return false;
            }
        }
    }

    console.log('数据验证通过');
    return true;
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