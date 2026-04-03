/**
 * Practice Goal Composable
 * Manages daily/weekly practice goals, streaks, and reminders
 *
 * Features:
 * - Daily practice goal setting and tracking
 * - Weekly practice goal setting and tracking
 * - Goal achievement reminders
 * - Consecutive days (streak) tracking
 */

import { ref, computed } from 'vue'

const GOAL_KEY = 'mc-algo-practice-goals'
const HISTORY_KEY = 'mc-algo-practice-history'
const STREAK_KEY = 'mc-algo-streak'

// Default goals
const DEFAULT_DAILY_GOAL = 3
const DEFAULT_WEEKLY_GOAL = 15

/**
 * Load goals from localStorage
 */
function loadGoals() {
  try {
    const saved = localStorage.getItem(GOAL_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch {}
  return {
    dailyGoal: DEFAULT_DAILY_GOAL,
    weeklyGoal: DEFAULT_WEEKLY_GOAL,
    reminderEnabled: true,
    streakReminderEnabled: true
  }
}

/**
 * Save goals to localStorage
 */
function saveGoals(goals) {
  localStorage.setItem(GOAL_KEY, JSON.stringify(goals))
}

/**
 * Load practice history from localStorage
 * Structure: { 'YYYY-MM-DD': { count: number, problems: string[] } }
 */
function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}')
  } catch {
    return {}
  }
}

/**
 * Save practice history to localStorage
 */
function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

/**
 * Load streak data from localStorage
 */
function loadStreak() {
  try {
    return JSON.parse(localStorage.getItem(STREAK_KEY) || '{}')
  } catch {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: null
    }
  }
}

/**
 * Save streak data to localStorage
 */
function saveStreak(streak) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(streak))
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
function getTodayStr() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

/**
 * Get date string for n days ago
 */
function getDateStrDaysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * Get week start date string (Monday)
 */
function getWeekStartStr() {
  const now = new Date()
  const dayOfWeek = now.getDay() || 7 // Convert 0 (Sunday) to 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - dayOfWeek + 1)
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
}

/**
 * Check if two date strings represent consecutive days
 */
function areConsecutive(prevDate, currentDate) {
  const prev = new Date(prevDate)
  const curr = new Date(currentDate)
  const diffTime = curr - prev
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  return diffDays === 1
}

/**
 * Check if two date strings represent the same day
 */
function isSameDay(dateStr1, dateStr2) {
  return dateStr1 === dateStr2
}

export function usePracticeGoal() {
  const goals = ref(loadGoals())
  const history = ref(loadHistory())
  const streak = ref(loadStreak())
  const showNotification = ref(false)
  const notificationMessage = ref('')
  const notificationType = ref('info') // 'info', 'success', 'warning'

  /**
   * Get today's practice count
   */
  const todayCount = computed(() => {
    const today = getTodayStr()
    return history.value[today]?.count || 0
  })

  /**
   * Get current week's practice count
   */
  const weekCount = computed(() => {
    const weekStart = getWeekStartStr()
    const today = getTodayStr()
    let count = 0
    for (const [dateStr, data] of Object.entries(history.value)) {
      if (dateStr >= weekStart && dateStr <= today) {
        count += data.count
      }
    }
    return count
  })

  /**
   * Get daily goal progress percentage
   */
  const dailyProgress = computed(() => {
    if (goals.value.dailyGoal === 0) return 100
    return Math.min(100, Math.round((todayCount.value / goals.value.dailyGoal) * 100))
  })

  /**
   * Get weekly goal progress percentage
   */
  const weeklyProgress = computed(() => {
    if (goals.value.weeklyGoal === 0) return 100
    return Math.min(100, Math.round((weekCount.value / goals.value.weeklyGoal) * 100))
  })

  /**
   * Check if daily goal is achieved
   */
  const dailyGoalAchieved = computed(() => todayCount.value >= goals.value.dailyGoal)

  /**
   * Check if weekly goal is achieved
   */
  const weeklyGoalAchieved = computed(() => weekCount.value >= goals.value.weeklyGoal)

  /**
   * Get current streak
   */
  const currentStreak = computed(() => streak.value.currentStreak || 0)

  /**
   * Get longest streak
   */
  const longestStreak = computed(() => streak.value.longestStreak || 0)

  /**
   * Record a problem as practiced
   */
  function recordPractice(problemId) {
    const today = getTodayStr()

    // Initialize today's entry if needed
    if (!history.value[today]) {
      history.value[today] = { count: 0, problems: [] }
    }

    // Add problem if not already recorded today
    if (!history.value[today].problems.includes(problemId)) {
      history.value[today].count++
      history.value[today].problems.push(problemId)
      saveHistory(history.value)
    }

    // Update streak
    updateStreak()

    // Check for goal achievement notifications
    checkGoalAchievement()

    return history.value[today].count
  }

  /**
   * Update streak based on practice history
   */
  function updateStreak() {
    const today = getTodayStr()
    const yesterday = getDateStrDaysAgo(1)

    // If already practiced today, streak already updated
    if (streak.value.lastPracticeDate === today) {
      return
    }

    // Check if practiced yesterday or today
    const practicedToday = history.value[today]?.count > 0
    const practicedYesterday = history.value[yesterday]?.count > 0

    if (!practicedToday && !practicedYesterday) {
      // No practice yesterday or today, don't change streak
      return
    }

    // If last practice was yesterday and practiced today, increment streak
    if (streak.value.lastPracticeDate === yesterday && practicedToday) {
      streak.value.currentStreak++
    } else if (streak.value.lastPracticeDate !== today) {
      // Either first practice ever, or streak was broken (gap > 1 day)
      // Start new streak
      streak.value.currentStreak = 1
    }
    // If last practice was today but we returned early, do nothing

    // Update longest streak if needed
    if (streak.value.currentStreak > streak.value.longestStreak) {
      streak.value.longestStreak = streak.value.currentStreak
    }

    streak.value.lastPracticeDate = today
    saveStreak(streak.value)
  }

  /**
   * Check and show goal achievement notifications
   */
  function checkGoalAchievement() {
    if (!goals.value.reminderEnabled) return

    // Daily goal achieved
    if (todayCount.value === goals.value.dailyGoal) {
      showGoalNotification('daily', goals.value.dailyGoal)
    }

    // Weekly goal achieved
    if (weekCount.value === goals.value.weeklyGoal) {
      showGoalNotification('weekly', goals.value.weeklyGoal)
    }

    // Streak milestone
    if (streak.value.currentStreak > 0 && streak.value.currentStreak % 7 === 0) {
      showStreakNotification(streak.value.currentStreak)
    }
  }

  /**
   * Show goal achievement notification
   */
  function showGoalNotification(type, goal) {
    notificationType.value = 'success'
    if (type === 'daily') {
      notificationMessage.value = `🎉 恭喜！今日完成 ${goal} 道题目，达到日目标！`
    } else {
      notificationMessage.value = `🎉 恭喜！本周完成 ${goal} 道题目，达到周目标！`
    }
    showNotification.value = true
    setTimeout(() => { showNotification.value = false }, 5000)
  }

  /**
   * Show streak milestone notification
   */
  function showStreakNotification(streakDays) {
    notificationType.value = 'info'
    notificationMessage.value = `🔥 连续刷题 ${streakDays} 天！保持好势头！`
    showNotification.value = true
    setTimeout(() => { showNotification.value = false }, 5000)
  }

  /**
   * Show reminder notification
   */
  function showReminderNotification(message) {
    notificationType.value = 'warning'
    notificationMessage.value = message
    showNotification.value = true
    setTimeout(() => { showNotification.value = false }, 5000)
  }

  /**
   * Update goal settings
   */
  function updateGoals(newGoals) {
    goals.value = { ...goals.value, ...newGoals }
    saveGoals(goals.value)
  }

  /**
   * Set daily goal
   */
  function setDailyGoal(count) {
    updateGoals({ dailyGoal: Math.max(0, Math.min(100, count)) })
  }

  /**
   * Set weekly goal
   */
  function setWeeklyGoal(count) {
    updateGoals({ weeklyGoal: Math.max(0, Math.min(500, count)) })
  }

  /**
   * Toggle reminder settings
   */
  function setReminderEnabled(enabled) {
    updateGoals({ reminderEnabled: enabled })
  }

  /**
   * Toggle streak reminder
   */
  function setStreakReminderEnabled(enabled) {
    updateGoals({ streakReminderEnabled: enabled })
  }

  /**
   * Get recent practice history (last n days)
   */
  function getRecentHistory(days = 7) {
    const result = []
    for (let i = 0; i < days; i++) {
      const dateStr = getDateStrDaysAgo(i)
      result.push({
        date: dateStr,
        count: history.value[dateStr]?.count || 0,
        problems: history.value[dateStr]?.problems || []
      })
    }
    return result.reverse()
  }

  /**
   * Get weekly breakdown for current week
   */
  function getWeekBreakdown() {
    const weekStart = new Date(getWeekStartStr())
    const result = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      result.push({
        date: dateStr,
        dayName: ['一', '二', '三', '四', '五', '六', '日'][i],
        count: history.value[dateStr]?.count || 0,
        isToday: isSameDay(dateStr, getTodayStr())
      })
    }
    return result
  }

  /**
   * Get practice statistics
   */
  function getPracticeStats() {
    const totalDays = Object.keys(history.value).length
    const totalProblems = Object.values(history.value).reduce((sum, day) => sum + day.count, 0)
    const avgPerDay = totalDays > 0 ? (totalProblems / totalDays).toFixed(1) : 0

    // Calculate average for last 7 days
    const last7Days = getRecentHistory(7)
    const last7Total = last7Days.reduce((sum, day) => sum + day.count, 0)
    const avgLast7 = (last7Total / 7).toFixed(1)

    // Calculate average for last 30 days
    const last30Days = getRecentHistory(30)
    const last30Total = last30Days.reduce((sum, day) => sum + day.count, 0)
    const avgLast30 = (last30Total / 30).toFixed(1)

    return {
      totalDays,
      totalProblems,
      avgPerDay,
      avgLast7,
      avgLast30,
      currentStreak: streak.value.currentStreak || 0,
      longestStreak: streak.value.longestStreak || 0
    }
  }

  /**
   * Reset today's progress (for testing)
   */
  function resetToday() {
    const today = getTodayStr()
    if (history.value[today]) {
      history.value[today] = { count: 0, problems: [] }
      saveHistory(history.value)
    }
  }

  return {
    // State
    goals,
    history,
    streak,
    showNotification,
    notificationMessage,
    notificationType,

    // Computed
    todayCount,
    weekCount,
    dailyProgress,
    weeklyProgress,
    dailyGoalAchieved,
    weeklyGoalAchieved,
    currentStreak,
    longestStreak,

    // Methods
    recordPractice,
    setDailyGoal,
    setWeeklyGoal,
    setReminderEnabled,
    setStreakReminderEnabled,
    getRecentHistory,
    getWeekBreakdown,
    getPracticeStats,
    showReminderNotification,
    resetToday
  }
}