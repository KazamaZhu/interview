<script setup>
import { ref } from 'vue'
import { exportData, importData, resetData } from '@/utils/DataManager'
import { ElMessageBox, ElMessage } from 'element-plus'

// 文件输入引用
const fileInput = ref(null)

// 处理导出数据
const handleExport = () => {
    exportData()
}

// 触发文件选择对话框
const triggerFileSelection = () => {
    fileInput.value.click()
}

// 处理文件选择
const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (!file) {
        console.log('没有选择文件')
        return
    }

    console.log('选择文件:', file.name, 'type:', file.type, 'size:', file.size)

    // 检查文件类型
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        ElMessage.warning('请选择JSON格式的文件')
        event.target.value = ''
        return
    }

    // 检查文件大小
    if (file.size > 10 * 1024 * 1024) { // 10MB限制
        ElMessage.warning('文件过大，请选择小于10MB的文件')
        event.target.value = ''
        return
    }

    try {
        const success = await importData(file)
        if (success) {
            // 导入成功，可能需要刷新页面
            ElMessageBox.confirm(
                '数据导入成功，是否刷新页面以应用新数据？',
                '导入成功',
                {
                    confirmButtonText: '刷新页面',
                    cancelButtonText: '稍后手动刷新',
                    type: 'success'
                }
            ).then(() => {
                // 刷新页面
                console.log('用户选择刷新页面')
                window.location.reload()
            }).catch(() => {
                // 用户选择不刷新
                console.log('用户选择不刷新页面')
            })
        } else {
            console.error('importData函数返回失败')
        }
    } catch (error) {
        console.error('文件导入过程中出错:', error)
        ElMessage.error('导入过程中出错: ' + error.message)
    } finally {
        // 重置文件输入，以便下次选择同一文件时仍然触发事件
        event.target.value = ''
    }
}

// 处理重置数据
const handleReset = () => {
    ElMessageBox.confirm(
        '确定要重置所有数据到默认状态吗？这将清除所有自定义的题目和分类。',
        '警告',
        {
            confirmButtonText: '确定重置',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(() => {
        const success = resetData()
        if (success) {
            ElMessageBox.confirm(
                '数据已重置，是否刷新页面以应用默认数据？',
                '重置成功',
                {
                    confirmButtonText: '刷新页面',
                    cancelButtonText: '稍后手动刷新',
                    type: 'success'
                }
            ).then(() => {
                // 刷新页面
                window.location.reload()
            }).catch(() => {
                // 用户选择不刷新
            })
        }
    }).catch(() => {
        // 用户取消重置
    })
}
</script>

<template>
    <div class="data-manager">
        <div class="manager-header">
            <el-icon class="header-icon">
                <DataLine />
            </el-icon>
            <span>数据管理</span>
        </div>

        <div class="actions">
            <el-button type="primary" @click="handleExport">
                <el-icon>
                    <Download />
                </el-icon>
                导出数据
            </el-button>

            <el-button type="success" @click="triggerFileSelection">
                <el-icon>
                    <Upload />
                </el-icon>
                导入数据
            </el-button>

            <input ref="fileInput" type="file" accept="application/json" @change="handleFileChange"
                style="display: none" />

            <el-button type="danger" @click="handleReset">
                <el-icon>
                    <RefreshRight />
                </el-icon>
                重置数据
            </el-button>
        </div>

        <div class="description">
            <h4>数据迁移说明：</h4>
            <ul>
                <li>导出数据：将当前题库导出为JSON文件，包含您添加或编辑的所有题目</li>
                <li>导入数据：从您之前导出的JSON文件中导入题库数据</li>
                <li>重置数据：清除所有自定义数据，恢复到默认题库</li>
            </ul>
            <div class="warning">
                <el-icon>
                    <Warning />
                </el-icon>
                <span>注意：数据导入后需要刷新页面才能生效</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.data-manager {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 15px;
    margin-bottom: 20px;
}

.manager-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 15px;
    font-size: 1.1rem;
    font-weight: bold;
    color: #409EFF;
}

.header-icon {
    font-size: 1.2rem;
}

.actions {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    flex-wrap: wrap;
}

.description {
    background-color: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
    font-size: 0.9rem;
}

.description h4 {
    margin-top: 0;
    margin-bottom: 8px;
    color: #606266;
}

.description ul {
    margin: 0;
    padding-left: 20px;
    color: #606266;
}

.description li {
    margin-bottom: 4px;
}

.warning {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 10px;
    color: #E6A23C;
    font-size: 0.85rem;
}

@media (max-width: 768px) {
    .actions {
        flex-direction: column;
    }
}
</style>