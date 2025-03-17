<script setup>
import { ref, reactive, computed } from 'vue'
import { SlotMachine as SlotMachineGame, getPoints } from '@/utils/PointsManager'
import { ElMessage } from 'element-plus'

const props = defineProps({
    onPointsChange: Function
})

// 游戏状态
const gameState = reactive({
    spinning: false,
    result: ['❓', '❓', '❓'],
    reward: 0,
    message: ''
})

// 下注金额
const betAmount = ref(10)
const betOptions = [5, 10, 20, 50, 100]

// 当前积分
const currentPoints = computed(() => getPoints())

// 播放动画的定时器
let spinTimer = null
let spinCounter = 0
const maxSpins = 20

// 开始游戏
const startGame = () => {
    if (gameState.spinning) return

    // 检查积分是否足够
    if (currentPoints.value < betAmount.value) {
        ElMessage.error('积分不足，无法下注')
        return
    }

    // 重置游戏状态
    gameState.spinning = true
    gameState.result = ['❓', '❓', '❓']
    gameState.reward = 0
    gameState.message = ''

    // 开始旋转动画
    spinCounter = 0
    clearInterval(spinTimer)
    spinTimer = setInterval(updateSpinAnimation, 100)
}

// 更新旋转动画
const updateSpinAnimation = () => {
    spinCounter++

    // 随机生成符号
    gameState.result = Array(3).fill().map(() =>
        SlotMachineGame.symbols[Math.floor(Math.random() * SlotMachineGame.symbols.length)]
    )

    // 动画结束后显示结果
    if (spinCounter >= maxSpins) {
        clearInterval(spinTimer)
        showResult()
    }
}

// 显示游戏结果
const showResult = () => {
    // 调用游戏逻辑
    const result = SlotMachineGame.play(betAmount.value)

    if (!result.success) {
        gameState.spinning = false
        ElMessage.error(result.message)
        return
    }

    // 更新游戏状态
    gameState.result = result.result
    gameState.reward = result.reward
    gameState.message = result.message
    gameState.spinning = false

    // 显示结果消息
    if (result.reward > 0) {
        ElMessage.success(result.message)
    } else {
        ElMessage.info(result.message)
    }

    // 通知积分变化
    if (props.onPointsChange) {
        props.onPointsChange()
    }
}

// 获取奖励说明
const getRewardDescription = (key) => {
    const descriptions = {
        '💰💰💰': '三个钱袋 (50倍)',
        '🎰🎰🎰': '三个老虎机 (30倍)',
        '⭐⭐⭐': '三个星星 (20倍)',
        'same': '三个相同符号 (10倍)',
        'pair': '两个相同符号 (2倍)'
    }
    return descriptions[key] || ''
}
</script>

<template>
    <div class="slot-machine-container">
        <h3 class="slot-title">
            <el-icon>
                <Trophy />
            </el-icon>
            幸运老虎机
        </h3>

        <div class="slot-display">
            <div v-for="(symbol, index) in gameState.result" :key="index" class="slot-reel"
                :class="{ 'spinning': gameState.spinning }">
                {{ symbol }}
            </div>
        </div>

        <div class="game-result" v-if="gameState.message && !gameState.spinning">
            <div class="result-message" :class="{ 'win': gameState.reward > 0 }">
                {{ gameState.message }}
            </div>
        </div>

        <div class="game-controls">
            <div class="bet-controls">
                <span class="bet-label">下注:</span>
                <el-radio-group v-model="betAmount" size="small">
                    <el-radio-button v-for="option in betOptions" :key="option" :label="option"
                        :disabled="gameState.spinning || currentPoints < option">
                        {{ option }}
                    </el-radio-button>
                </el-radio-group>
            </div>

            <el-button type="danger" @click="startGame" :disabled="gameState.spinning || currentPoints < betAmount"
                :loading="gameState.spinning" size="large" class="spin-button">
                <el-icon v-if="!gameState.spinning">
                    <VideoPlay />
                </el-icon>
                <span>{{ gameState.spinning ? '旋转中...' : '开始游戏' }}</span>
            </el-button>
        </div>

        <div class="reward-info">
            <h4>奖励规则:</h4>
            <ul class="reward-list">
                <li v-for="(multiplier, key) in SlotMachineGame.rewards" :key="key" v-if="key !== 'none'">
                    {{ getRewardDescription(key) }}
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.slot-machine-container {
    background-color: #1e1e2d;
    border-radius: 10px;
    padding: 20px;
    color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    max-width: 400px;
    margin: 0 auto;
}

.slot-title {
    text-align: center;
    margin-bottom: 15px;
    color: #f1c40f;
    font-size: 1.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.slot-display {
    display: flex;
    justify-content: space-between;
    background-color: #2c2c3e;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
}

.slot-reel {
    width: 70px;
    height: 70px;
    background-color: #fff;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: transform 0.1s;
}

.slot-reel.spinning {
    animation: spin 0.2s infinite;
}

@keyframes spin {
    0% {
        transform: translateY(-2px);
    }

    50% {
        transform: translateY(2px);
    }

    100% {
        transform: translateY(-2px);
    }
}

.game-result {
    text-align: center;
    margin-bottom: 20px;
    min-height: 24px;
}

.result-message {
    font-size: 1.1rem;
    color: #e74c3c;
}

.result-message.win {
    color: #2ecc71;
    font-weight: bold;
}

.game-controls {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
}

.bet-controls {
    display: flex;
    align-items: center;
    gap: 10px;
}

.bet-label {
    font-size: 0.9rem;
    color: #bdc3c7;
}

.spin-button {
    width: 100%;
    font-size: 1.1rem;
}

.reward-info {
    background-color: #2c2c3e;
    border-radius: 8px;
    padding: 15px;
    margin-top: 20px;
}

.reward-info h4 {
    color: #f1c40f;
    margin-bottom: 10px;
    font-size: 1rem;
}

.reward-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
    font-size: 0.9rem;
    color: #bdc3c7;
}

.reward-list li {
    margin-bottom: 5px;
}
</style>