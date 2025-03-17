<script setup>
import { ref, onMounted, watch } from 'vue'
import { getPoints } from '@/utils/PointsManager'

const props = defineProps({
    refreshTrigger: {
        type: Number,
        default: 0
    }
})

const points = ref(0)

// 更新积分显示
const updatePoints = () => {
    points.value = getPoints()
}

// 监听积分刷新触发器
watch(() => props.refreshTrigger, () => {
    updatePoints()
})

// 组件挂载时获取积分
onMounted(() => {
    updatePoints()
})
</script>

<template>
    <div class="points-card">
        <div class="points-header">
            <el-icon>
                <Coin />
            </el-icon>
            <span>我的积分</span>
        </div>

        <div class="points-content">
            <div class="points-value">{{ points }}</div>
            <div class="points-label">可用积分</div>
        </div>

        <div class="points-info">
            <h4>获取积分方式：</h4>
            <ul>
                <li><el-tag size="small" type="success">每日签到</el-tag> 20积分</li>
                <li><el-tag size="small" type="warning">模拟面试</el-tag> 每题10积分</li>
                <li><el-tag size="small" type="primary">编辑题目</el-tag> 20积分</li>
                <li><el-tag size="small" type="primary">添加题目</el-tag> 20积分</li>
                <li><el-tag size="small" type="danger">幸运老虎机</el-tag> 赢取更多积分</li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.points-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 15px;
    margin-bottom: 20px;
}

.points-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 15px;
    font-size: 1.1rem;
    font-weight: bold;
    color: #409EFF;
}

.points-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.points-value {
    font-size: 2.5rem;
    font-weight: bold;
    color: #F56C6C;
    margin-bottom: 5px;
}

.points-label {
    font-size: 0.9rem;
    color: #909399;
}

.points-info {
    margin-top: 15px;
    border-top: 1px dashed #EBEEF5;
    padding-top: 15px;
}

.points-info h4 {
    font-size: 0.9rem;
    color: #606266;
    margin-bottom: 10px;
}

.points-info ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

.points-info li {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 0.85rem;
    color: #606266;
}
</style>