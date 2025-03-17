<script setup>
import { ref } from 'vue'
import { setPoints, getPoints } from '@/utils/PointsManager'
import { ElMessage } from 'element-plus'

const props = defineProps({
    onPointsChange: Function
})

const emit = defineEmits(['points-changed'])

const inputPoints = ref('')

// 设置积分
const handleSetPoints = () => {
    const points = parseInt(inputPoints.value)

    if (isNaN(points) || points < 0) {
        ElMessage.error('请输入有效的积分数值')
        return
    }

    setPoints(points)
    ElMessage.success(`积分已设置为 ${points}`)

    // 清空输入框
    inputPoints.value = ''

    // 通知父组件积分已更改
    emit('points-changed')
}

// 获取当前积分
const getCurrentPoints = () => {
    const currentPoints = getPoints()
    inputPoints.value = currentPoints.toString()
    ElMessage.info(`当前积分: ${currentPoints}`)
}
</script>

<template>
    <div class="points-input-container">
        <div class="input-section">
            <el-input v-model="inputPoints" type="number" placeholder="输入积分数值" min="0">
                <template #prepend>积分</template>
            </el-input>
        </div>

        <div class="action-buttons">
            <el-button type="primary" @click="handleSetPoints">
                设置积分
            </el-button>
            <el-button @click="getCurrentPoints">
                获取当前积分
            </el-button>
        </div>

        <div class="tips">
            <p>提示: 此功能用于恢复您之前的积分数据</p>
            <p>您可以通过以下方式获得积分:</p>
            <ul>
                <li>每日签到: 20积分</li>
                <li>回答模拟面试题: 每题10积分</li>
                <li>编辑题目: 20积分</li>
                <li>添加题目: 20积分</li>
                <li>幸运老虎机: 有机会赢取更多积分</li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.points-input-container {
    padding: 10px;
}

.input-section {
    margin-bottom: 15px;
}

.action-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.tips {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    margin-top: 15px;
}

.tips p {
    margin: 5px 0;
    color: #606266;
}

.tips ul {
    margin: 5px 0;
    padding-left: 20px;
    color: #606266;
}

.tips li {
    margin: 3px 0;
}
</style>