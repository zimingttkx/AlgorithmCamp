<template>
  <div class="goal-page">
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <h1 class="page-title">
          <span class="title-icon">🎯</span>
          {{ isZh ? '刷题目标' : 'Practice Goals' }}
        </h1>
        <p class="page-subtitle">{{ isZh ? '设定目标，追踪进度，保持刷题动力' : 'Set goals, track progress, stay motivated' }}</p>
      </header>

      <!-- Goal Progress Cards -->
      <div class="goal-cards">
        <!-- Daily Goal -->
        <div class="goal-card daily">
          <div class="goal-card-header">
            <span class="goal-icon">📅</span>
            <span class="goal-label">{{ isZh ? '每日目标' : 'Daily Goal' }}</span>
          </div>
          <div class="goal-progress-ring">
            <svg viewBox="0 0 120 120">
              <circle class="ring-bg" cx="60" cy="60" r="54" />
              <circle 
                class="ring-progress" 
                cx="60" cy="60" r="54"
                :stroke-dasharray="340"
                :stroke-dashoffset="340 - (340 * dailyProgress / 100)"
              />
            </svg>
            <div class="ring-content">
              <span class="ring-value">{{ todaySolved }}/{{ goals.dailyGoal }}</span>
              <span class="ring-label">{{ isZh ? '今日' : 'Today' }}</span>
            </div>
          </div>
          <div class="goal-actions">
            <button class="action-btn minus" @click="adjustGoal('daily', -1)">−</button>
            <button class="action-btn plus" @click="adjustGoal('daily', 1)">+</button>
          </div>
        </div>

        <!-- Weekly Goal -->
        <div class="goal-card weekly">
          <div class="goal-card-header">
            <span class="goal-icon">📊</span>
            <span class="goal-label">{{ isZh ? '每周目标' : 'Weekly Goal' }}</span>
          </div>
          <div class="goal-progress-ring">
            <svg viewBox="0 0 120 120">
              <circle class="ring-bg" cx="60" cy="60" r="54" />
              <circle 
                class="ring-progress weekly-ring" 
                cx="60" cy="60" r="54"
                :stroke-dasharray="340"
                :stroke-dashoffset="340 - (340 * weeklyProgress / 100)"
              />
            </svg>
            <div class="ring-content">
              <span class="ring-value">{{ weekSolved }}/{{ goals.weeklyGoal }}</span>
              <span class="ring-label">{{ isZh ? '本周' : 'This Week' }}</span>
            </div>
          </div>
          <div class="goal-actions">
            <button class="action-btn minus" @click="adjustGoal('weekly', -7)">−</button>
            <button class="action-btn plus" @click="adjustGoal('weekly', 7)">+</button>
          </div>
        </div>

        <!-- Current Streak -->
        <div class="goal-card streak">
          <div class="goal-card-header">
            <span class="goal-icon">🔥</span>
            <span class="goal-label">{{ isZh ? '连续刷题' : 'Streak' }}</span>
          </div>
          <div class="streak-display">
            <span class="streak-number">{{ currentStreak }}</span>
            <span class="streak-unit">{{ isZh ? '天' : 'days' }}</span>
          </div>
          <div class="streak-status" :class="streakStatusClass">
            {{ streakStatusText }}
          </div>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="section-card">
        <h2 class="section-title">
          <span class="section-icon">📈</span>
          {{ isZh ? '数据总览' : 'Statistics Overview' }}
        </h2>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-icon">🏆</span>
            <span class="stat-value">{{ totalSolved }}</span>
            <span class="stat-label">{{ isZh ? '总解题' : 'Total Solved' }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">⭐</span>
            <span class="stat-value">{{ longestStreak }}</span>
            <span class="stat-label">{{ isZh ? '最长连续' : 'Best Streak' }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">📊</span>
            <span class="stat-value">{{ avgPerDay }}</span>
            <span class="stat-label">{{ isZh ? '日均' : 'Avg/Day' }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">🎯</span>
            <span class="stat-value">{{ totalActiveDays }}</span>
            <span class="stat-label">{{ isZh ? '活跃天数' : 'Active Days' }}</span>
          </div>
        </div>
      </div>

      <!-- Weekly Activity -->
      <div class="section-card">
        <h2 class="section-title">
          <span class="section-icon">📅</span>
          {{ isZh ? '本周活动' : 'Weekly Activity' }}
        </h2>
        <div class="week-chart">
          <div v-for="(day, i) in weekData" :key="i" class="day-column">
            <div class="day-bar-wrapper">
              <div 
                class="day-bar" 
                :style="{ height: day.percent + '%' }"
                :class="{ completed: day.count >= goals.dailyGoal }"
              ></div>
            </div>
            <span class="day-label">{{ day.label }}</span>
            <span class="day-count">{{ day.count }}</span>
          </div>
        </div>
        <div class="week-summary">
          <span>{{ isZh ? '本周完成' : 'This week' }}: {{ weekSolved }} {{ isZh ? '题' : 'problems' }}</span>
          <span class="week-percent">{{ weeklyProgress }}%</span>
        </div>
      </div>

      <!-- Daily Goals Presets -->
      <div class="section-card">
        <h2 class="section-title">
          <span class="section-icon">⚡</span>
          {{ isZh ? '快速设置' : 'Quick Settings' }}
        </h2>
        <div class="presets-section">
          <div class="preset-group">
            <span class="preset-label">{{ isZh ? '每日目标预设' : 'Daily Goal Presets' }}</span>
            <div class="preset-buttons">
              <button 
                v-for="preset in dailyPresets" 
                :key="preset"
                class="preset-btn"
                :class="{ active: goals.dailyGoal === preset }"
                @click="setDailyGoal(preset)"
              >
                {{ preset }}
              </button>
            </div>
          </div>
          <div class="preset-group">
            <span class="preset-label">{{ isZh ? '每周目标预设' : 'Weekly Goal Presets' }}</span>
            <div class="preset-buttons">
              <button 
                v-for="preset in weeklyPresets" 
                :key="preset"
                class="preset-btn"
                :class="{ active: goals.weeklyGoal === preset }"
                @click="setWeeklyGoal(preset)"
              >
                {{ preset }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Achievements -->
      <div class="section-card achievements-section">
        <h2 class="section-title">
          <span class="section-icon">🏅</span>
          {{ isZh ? '成就徽章' : 'Achievements' }}
        </h2>
        <div class="achievements-grid">
          <div 
            v-for="badge in achievements" 
            :key="badge.id" 
            class="badge-item"
            :class="{ unlocked: badge.unlocked }"
          >
            <div class="badge-icon">{{ badge.icon }}</div>
            <div class="badge-info">
              <span class="badge-name">{{ isZh ? badge.nameZh : badge.name }}</span>
              <span class="badge-desc">{{ isZh ? badge.descZh : badge.desc }}</span>
            </div>
            <div class="badge-progress" v-if="!badge.unlocked">
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: badge.progress + '%' }"></div>
              </div>
              <span class="progress-text">{{ badge.current }}/{{ badge.target }}</span>
            </div>
            <div class="badge-check" v-else>✓</div>
          </div>
        </div>
      </div>

      <!-- Motivation Quote -->
      <div class="motivation-card" v-if="totalSolved > 0">
        <p class="motivation-text">{{ currentQuote }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLang } from '../composables/i18n.js'
import { usePracticeGoal } from '../composables/usePracticeGoal.js'
import { CHAPTERS } from '../composables/data.js'

const { isZh } = useLang()
const { goals, setDailyGoal, setWeeklyGoal } = usePracticeGoal()

// Get progress from localStorage
const getProgress = () => {
  try { return JSON.parse(localStorage.getItem('mc-algo-progress') || '{}') } 
  catch { return {} }
}

// Total solved count
const totalSolved = computed(() => {
  const progress = getProgress()
  let total = 0
  for (const ch of CHAPTERS) {
    const problems = progress[ch.id] || {}
    total += Object.values(problems).filter(v => {
      if (typeof v === 'object' && v !== null) return !!v.checked
      return !!v
    }).length
  }
  return total
})

// Today's solved count
const todaySolved = computed(() => {
  const progress = getProgress()
  const today = new Date().toISOString().split('T')[0]
  let count = 0
  
  for (const ch of CHAPTERS) {
    const problems = progress[ch.id] || {}
    for (const data of Object.values(problems)) {
      if (data && typeof data === 'object' && data.checkedAt && data.checkedAt.startsWith(today)) {
        count++
      }
    }
  }
  
  return count
})

// Daily progress percentage
const dailyProgress = computed(() => {
  if (goals.value.dailyGoal === 0) return 0
  return Math.min(100, Math.round((todaySolved.value / goals.value.dailyGoal) * 100))
})

// This week's solved count
const weekSolved = computed(() => {
  const progress = getProgress()
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  weekStart.setHours(0, 0, 0, 0)
  
  let count = 0
  
  for (const ch of CHAPTERS) {
    const problems = progress[ch.id] || {}
    for (const data of Object.values(problems)) {
      if (data && typeof data === 'object' && data.checkedAt) {
        const checkDate = new Date(data.checkedAt)
        if (checkDate >= weekStart) {
          count++
        }
      }
    }
  }
  
  return count
})

// Weekly progress percentage
const weeklyProgress = computed(() => {
  if (goals.value.weeklyGoal === 0) return 0
  return Math.min(100, Math.round((weekSolved.value / goals.value.weeklyGoal) * 100))
})

// Current streak
const currentStreak = computed(() => {
  const progress = getProgress()
  const dates = new Set()
  
  for (const ch of CHAPTERS) {
    const problems = progress[ch.id] || {}
    for (const data of Object.values(problems)) {
      if (data && typeof data === 'object' && data.checkedAt) {
        dates.add(data.checkedAt.split('T')[0])
      }
    }
  }
  
  if (dates.size === 0) return 0
  
  const sorted = Array.from(dates).sort()
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  
  if (sorted[sorted.length - 1] !== today && sorted[sorted.length - 1] !== yesterday) return 0
  
  return sorted.length
})

// Longest streak
const longestStreak = computed(() => {
  const progress = getProgress()
  const dates = new Set()
  
  for (const ch of CHAPTERS) {
    const problems = progress[ch.id] || {}
    for (const data of Object.values(problems)) {
      if (data && typeof data === 'object' && data.checkedAt) {
        dates.add(data.checkedAt.split('T')[0])
      }
    }
  }
  
  if (dates.size === 0) return 0
  
  const sorted = Array.from(dates).sort()
  let maxStreak = 1
  let currentStreak = 1
  
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diff = (curr - prev) / (1000 * 60 * 60 * 24)
    
    if (diff === 1) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }
  
  return maxStreak
})

// Active days
const totalActiveDays = computed(() => {
  const progress = getProgress()
  const dates = new Set()
  
  for (const ch of CHAPTERS) {
    const problems = progress[ch.id] || {}
    for (const data of Object.values(problems)) {
      if (data && typeof data === 'object' && data.checkedAt) {
        dates.add(data.checkedAt.split('T')[0])
      }
    }
  }
  
  return dates.size
})

// Average per day
const avgPerDay = computed(() => {
  if (totalActiveDays.value === 0) return '0.0'
  return (totalSolved.value / totalActiveDays.value).toFixed(1)
})

// Week data for chart
const weekData = computed(() => {
  const labels = isZh.value ? ['日', '一', '二', '三', '四', '五', '六'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const today = new Date()
  const days = []
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dayOfWeek = d.getDay()
    
    let count = 0
    const progress = getProgress()
    for (const [chapterId, problems] of Object.entries(progress)) {
      for (const [probId, data] of Object.entries(problems)) {
        if (data && typeof data === 'object' && data.checkedAt && data.checkedAt.startsWith(dateStr)) {
          count++
        }
      }
    }
    
    days.push({
      label: labels[dayOfWeek],
      count,
      percent: goals.value.dailyGoal > 0 ? Math.min(100, (count / goals.value.dailyGoal) * 100) : 0
    })
  }
  
  return days
})

// Streak status
const streakStatusClass = computed(() => {
  if (currentStreak.value >= 30) return 'legendary'
  if (currentStreak.value >= 7) return 'great'
  if (currentStreak.value >= 3) return 'good'
  return 'normal'
})

const streakStatusText = computed(() => {
  if (currentStreak.value >= 30) return isZh.value ? '太厉害了！传说级！' : 'Legendary!'
  if (currentStreak.value >= 7) return isZh.value ? '太棒了！' : 'Amazing!'
  if (currentStreak.value >= 3) return isZh.value ? '继续保持！' : 'Keep going!'
  if (currentStreak.value >= 1) return isZh.value ? '开始连续了！' : 'Starting streak!'
  return isZh.value ? '开始刷题吧' : 'Start today!'
})

// Presets
const dailyPresets = [1, 2, 3, 5, 10]
const weeklyPresets = [7, 14, 21, 35, 50]

// Achievements
const achievements = computed(() => [
  { 
    id: 'first', 
    name: 'First Blood', nameZh: '初出茅庐', 
    desc: 'Solve your first problem', descZh: '解决第一道题', 
    icon: '🎯', target: 1, current: totalSolved.value,
    unlocked: totalSolved.value >= 1
  },
  { 
    id: 'ten', 
    name: 'Getting Started', nameZh: '小试牛刀', 
    desc: 'Solve 10 problems', descZh: '解决10道题', 
    icon: '⭐', target: 10, current: totalSolved.value,
    unlocked: totalSolved.value >= 10
  },
  { 
    id: 'fifty', 
    name: 'Half Century', nameZh: '五十大关', 
    desc: 'Solve 50 problems', descZh: '解决50道题', 
    icon: '🌟', target: 50, current: totalSolved.value,
    unlocked: totalSolved.value >= 50
  },
  { 
    id: 'hundred', 
    name: 'Century', nameZh: '百题斩', 
    desc: 'Solve 100 problems', descZh: '解决100道题', 
    icon: '💯', target: 100, current: totalSolved.value,
    unlocked: totalSolved.value >= 100
  },
  { 
    id: 'streak7', 
    name: 'Week Warrior', nameZh: '周连胜', 
    desc: '7 day streak', descZh: '连续7天', 
    icon: '🔥', target: 7, current: currentStreak.value,
    unlocked: currentStreak.value >= 7
  },
  { 
    id: 'streak30', 
    name: 'Month Master', nameZh: '月冠军', 
    desc: '30 day streak', descZh: '连续30天', 
    icon: '👑', target: 30, current: currentStreak.value,
    unlocked: currentStreak.value >= 30
  },
].map(a => ({
  ...a,
  progress: Math.min(100, Math.round((a.current / a.target) * 100))
})))

// Motivation quotes
const quotes = [
  { zh: '坚持就是胜利！', en: 'Persistence is victory!' },
  { zh: '每天进步一点点！', en: 'Make progress every day!' },
  { zh: '刷题使我快乐！', en: 'Coding makes me happy!' },
  { zh: '越努力越幸运！', en: 'Hard work pays off!' },
  { zh: '加油，冲鸭！', en: 'Keep pushing!' },
]

const currentQuote = computed(() => {
  const q = quotes[Math.floor(Math.random() * quotes.length)]
  return isZh.value ? q.zh : q.en
})

// Actions
function adjustGoal(type, delta) {
  if (type === 'daily') {
    const newValue = Math.max(1, Math.min(50, goals.value.dailyGoal + delta))
    setDailyGoal(newValue)
  } else {
    const newValue = Math.max(7, Math.min(200, goals.value.weeklyGoal + delta))
    setWeeklyGoal(newValue)
  }
}
</script>

<style scoped>
.goal-page {
  min-height: 100vh;
  padding: 80px 0 60px;
  background: var(--bg-dark);
  background-image: 
    radial-gradient(ellipse at top left, rgba(0, 240, 255, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(124, 58, 237, 0.05) 0%, transparent 50%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Page Header */
.page-header {
  text-align: center;
  padding: 40px 0;
}

.page-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-icon {
  -webkit-text-fill-color: initial;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Goal Cards */
.goal-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.goal-card {
  background: linear-gradient(145deg, rgba(20, 30, 50, 0.9), rgba(10, 15, 30, 0.9));
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 20px;
  padding: 24px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.goal-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.goal-card.daily::before { background: linear-gradient(90deg, #00f0ff, #0080ff); }
.goal-card.weekly::before { background: linear-gradient(90deg, #7c3aed, #a855f7); }
.goal-card.streak::before { background: linear-gradient(90deg, #ff6b35, #f7931e); }

.goal-card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.goal-icon {
  font-size: 1.5rem;
}

.goal-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Progress Ring */
.goal-progress-ring {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
}

.goal-progress-ring svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.ring-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 8;
}

.ring-progress {
  fill: none;
  stroke: url(#cyan-gradient);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
}

.weekly-ring {
  stroke: url(#purple-gradient);
}

.ring-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.ring-value {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
}

.ring-label {
  font-size: 0.7rem;
  color: var(--text-dim);
  text-transform: uppercase;
}

/* Goal Actions */
.goal-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(0, 240, 255, 0.3);
  background: transparent;
  color: var(--neon-cyan);
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: var(--neon-cyan);
  color: #0a0e1a;
  transform: scale(1.1);
}

/* Streak Display */
.streak-display {
  margin-bottom: 16px;
}

.streak-number {
  font-family: 'JetBrains Mono', monospace;
  font-size: 4rem;
  font-weight: 700;
  color: #fff;
  line-height: 1;
  text-shadow: 0 0 30px rgba(255, 107, 53, 0.5);
}

.streak-unit {
  font-size: 1rem;
  color: var(--text-dim);
  margin-left: 4px;
}

.streak-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  display: inline-block;
}

.streak-status.normal { background: rgba(255, 255, 255, 0.1); color: var(--text-dim); }
.streak-status.good { background: rgba(74, 222, 128, 0.2); color: #4ade80; }
.streak-status.great { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
.streak-status.legendary { background: linear-gradient(135deg, rgba(255, 107, 53, 0.3), rgba(247, 147, 30, 0.3)); color: #ff6b35; }

/* Section Card */
.section-card {
  background: linear-gradient(145deg, rgba(20, 30, 50, 0.9), rgba(10, 15, 30, 0.9));
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon {
  font-size: 1.4rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
}

.stat-icon {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 8px;
}

.stat-value {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 2rem;
  font-weight: 700;
  color: var(--neon-cyan);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Week Chart */
.week-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 150px;
  padding: 20px 0;
}

.day-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.day-bar-wrapper {
  height: 100px;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.day-bar {
  width: 36px;
  background: linear-gradient(to top, var(--neon-cyan), rgba(0, 240, 255, 0.5));
  border-radius: 6px 6px 0 0;
  min-height: 4px;
  transition: height 0.3s ease;
}

.day-bar.completed {
  background: linear-gradient(to top, #4ade80, rgba(74, 222, 128, 0.5));
}

.day-label {
  font-size: 0.75rem;
  color: var(--text-dim);
}

.day-count {
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--neon-cyan);
}

.week-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.week-percent {
  font-family: monospace;
  font-size: 1.2rem;
  color: var(--neon-cyan);
  font-weight: 600;
}

/* Presets */
.presets-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preset-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preset-label {
  font-size: 0.85rem;
  color: var(--text-dim);
}

.preset-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.preset-btn {
  padding: 10px 20px;
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-btn:hover {
  border-color: var(--neon-cyan);
  color: var(--neon-cyan);
}

.preset-btn.active {
  background: var(--neon-cyan);
  border-color: var(--neon-cyan);
  color: #0a0e1a;
  font-weight: 600;
}

/* Achievements */
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.badge-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  opacity: 0.5;
  transition: all 0.3s ease;
}

.badge-item.unlocked {
  opacity: 1;
  border-color: rgba(251, 191, 36, 0.3);
  background: linear-gradient(145deg, rgba(251, 191, 36, 0.1), rgba(124, 58, 237, 0.05));
}

.badge-icon {
  font-size: 2rem;
}

.badge-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.badge-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
}

.badge-desc {
  font-size: 0.7rem;
  color: var(--text-dim);
}

.badge-progress {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.progress-track {
  width: 60px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.progress-fill {
  height: 100%;
  background: var(--neon-cyan);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.7rem;
  color: var(--text-dim);
  font-family: monospace;
}

.badge-check {
  width: 24px;
  height: 24px;
  background: #4ade80;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0a0e1a;
  font-weight: bold;
  font-size: 0.8rem;
}

/* Motivation */
.motivation-card {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(124, 58, 237, 0.1));
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  margin-top: 24px;
}

.motivation-text {
  font-size: 1.2rem;
  color: var(--neon-cyan);
  margin: 0;
  font-style: italic;
}

/* Responsive */
@media (max-width: 1024px) {
  .goal-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .achievements-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .goal-cards {
    grid-template-columns: 1fr;
  }
  
  .week-chart {
    height: 120px;
  }
  
  .day-bar {
    width: 28px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .achievements-grid {
    grid-template-columns: 1fr;
  }
  
  .preset-buttons {
    justify-content: center;
  }
}
</style>
