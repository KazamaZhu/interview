/**
 * 积分管理工具类
 * 用于处理用户积分的获取、消耗和存储
 */

// 本地存储键名
const STORAGE_KEYS = {
    POINTS: 'interview_helper_points',
    LAST_SIGN_IN: 'interview_helper_last_sign_in',
    SIGN_IN_STREAK: 'interview_helper_sign_in_streak'
}

/**
 * 获取用户当前积分
 * @returns {number} 用户积分
 */
export function getPoints() {
    const points = localStorage.getItem(STORAGE_KEYS.POINTS)
    return points ? parseInt(points) : 0
}

/**
 * 增加用户积分
 * @param {number} amount - 增加的积分数量
 * @returns {number} 增加后的总积分
 */
export function addPoints(amount) {
    const currentPoints = getPoints()
    const newPoints = currentPoints + amount
    localStorage.setItem(STORAGE_KEYS.POINTS, newPoints.toString())
    return newPoints
}

/**
 * 设置用户积分（直接设置为指定值）
 * @param {number} amount - 要设置的积分数量
 * @returns {number} 设置后的积分
 */
export function setPoints(amount) {
    if (isNaN(amount) || amount < 0) {
        return getPoints() // 如果输入无效，返回当前积分
    }

    localStorage.setItem(STORAGE_KEYS.POINTS, amount.toString())
    return amount
}

/**
 * 消费用户积分
 * @param {number} amount - 消费的积分数量
 * @returns {boolean} 是否消费成功
 */
export function spendPoints(amount) {
    const currentPoints = getPoints()
    if (currentPoints < amount) {
        return false
    }

    const newPoints = currentPoints - amount
    localStorage.setItem(STORAGE_KEYS.POINTS, newPoints.toString())
    return true
}

/**
 * 检查用户是否可以签到
 * @returns {boolean} 是否可以签到
 */
export function canSignIn() {
    const lastSignIn = localStorage.getItem(STORAGE_KEYS.LAST_SIGN_IN)
    if (!lastSignIn) {
        return true
    }

    const lastDate = new Date(parseInt(lastSignIn))
    const today = new Date()

    return !isSameDay(lastDate, today)
}

/**
 * 执行签到操作
 * @returns {Object} 签到结果，包含获得的积分、连续签到天数等信息
 */
export function signIn() {
    if (!canSignIn()) {
        return {
            success: false,
            message: '今天已经签到过了'
        }
    }

    // 获取连续签到天数
    let streak = parseInt(localStorage.getItem(STORAGE_KEYS.SIGN_IN_STREAK) || '0')
    const lastSignIn = localStorage.getItem(STORAGE_KEYS.LAST_SIGN_IN)

    if (lastSignIn) {
        const lastDate = new Date(parseInt(lastSignIn))
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        // 如果上次签到不是昨天，重置连续签到
        if (!isSameDay(lastDate, yesterday)) {
            streak = 0
        }
    }

    // 增加连续签到天数
    streak += 1

    // 固定奖励20积分
    const totalReward = 20

    // 更新积分和签到记录
    addPoints(totalReward)
    localStorage.setItem(STORAGE_KEYS.LAST_SIGN_IN, Date.now().toString())
    localStorage.setItem(STORAGE_KEYS.SIGN_IN_STREAK, streak.toString())

    return {
        success: true,
        points: totalReward,
        streak: streak,
        message: `签到成功！获得${totalReward}积分`
    }
}

/**
 * 获取连续签到天数
 * @returns {number} 连续签到天数
 */
export function getSignInStreak() {
    return parseInt(localStorage.getItem(STORAGE_KEYS.SIGN_IN_STREAK) || '0')
}

/**
 * 获取上次签到时间
 * @returns {Date|null} 上次签到时间
 */
export function getLastSignInTime() {
    const lastSignIn = localStorage.getItem(STORAGE_KEYS.LAST_SIGN_IN)
    return lastSignIn ? new Date(parseInt(lastSignIn)) : null
}

/**
 * 判断两个日期是否是同一天
 * @param {Date} date1 - 第一个日期
 * @param {Date} date2 - 第二个日期
 * @returns {boolean} 是否是同一天
 */
function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
}

/**
 * 老虎机游戏
 */
export const SlotMachine = {
    // 老虎机符号
    symbols: ['🍎', '🍋', '🍒', '🍇', '🍉', '💰', '🎰', '⭐'],

    // 不同组合的奖励倍数
    rewards: {
        '💰💰💰': 50,  // 三个钱袋符号
        '🎰🎰🎰': 30,  // 三个老虎机符号
        '⭐⭐⭐': 20,   // 三个星星符号
        'same': 10,    // 三个相同的其他符号
        'pair': 2,     // 两个相同的符号
        'none': 0      // 没有匹配
    },

    /**
     * 玩老虎机游戏
     * @param {number} bet - 下注积分
     * @returns {Object} 游戏结果
     */
    play(bet) {
        // 随机生成三个符号
        const result = Array(3).fill().map(() =>
            this.symbols[Math.floor(Math.random() * this.symbols.length)]
        )

        // 计算奖励
        let reward = 0
        let type = 'none'

        // 检查是否有三个相同符号
        if (result[0] === result[1] && result[1] === result[2]) {
            if (result[0] === '💰') {
                type = '💰💰💰'
            } else if (result[0] === '🎰') {
                type = '🎰🎰🎰'
            } else if (result[0] === '⭐') {
                type = '⭐⭐⭐'
            } else {
                type = 'same'
            }
            reward = bet * this.rewards[type]
        }
        // 检查是否有两个相同符号
        else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
            type = 'pair'
            reward = bet * this.rewards.pair
        }

        // 扣除下注积分
        const success = spendPoints(bet)
        if (!success) {
            return {
                success: false,
                message: '积分不足'
            }
        }

        // 添加奖励积分
        if (reward > 0) {
            addPoints(reward)
        }

        return {
            success: true,
            result: result,
            reward: reward,
            type: type,
            message: reward > 0 ? `恭喜获得${reward}积分！` : '很遗憾，没有获奖'
        }
    }
} 