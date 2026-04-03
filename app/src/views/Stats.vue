<template>
  <div class="stats-page">
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title pixel-font">
            <span class="title-icon">📊</span>
            {{ isZh ? '刷题统计' : 'PRACTICE STATS' }}
          </h1>
          <p class="page-subtitle">{{ isZh ? '详细数据分析与可视化报表' : 'Detailed data analysis and visual reports' }}</p>
        </div>
        <div class="header-decoration">
          <div class="deco-line"></div>
          <div class="deco-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </header>

      <!-- Stats Cards Row -->
      <div class="stats-grid">
        <!-- Total Solved -->
        <div class="stat-card primary">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalSolved }}</div>
            <div class="stat-label">{{ isZh ? '总解题数' : 'Total Solved' }}</div>
            <div class="stat-progress">
              <div class="progress-bar" :style="{ width: totalProgress + '%' }"></div>
              <span class="progress-text">{{ totalProgress }}%</span>
            </div>
          </div>
        </div>

        <!-- Current Streak -->
        <div class="stat-card streak">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <div class="stat-value">{{ currentStreak }}</div>
            <div class="stat-label">{{ isZh ? '连续天数' : 'Day Streak' }}</div>
            <div class="stat-badge" v-if="currentStreak >= 7">{{ isZh ? '太棒了！' : 'Amazing!' }}</div>
          </div>
        </div>

        <!-- Avg Per Day -->
        <div class="stat-card avg">
          <div class="stat-icon">⚡</div>
          <div class="stat-content">
            <div class="stat-value">{{ avgPerDay }}</div>
            <div class="stat-label">{{ isZh ? '日均解题' : 'Avg/Day' }}</div>
            <div class="stat-sub">{{ isZh ? '最近30天' : 'Last 30 days' }}</div>
          </div>
        </div>

        <!-- This Week -->
        <div class="stat-card week">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <div class="stat-value">{{ thisWeek }}</div>
            <div class="stat-label">{{ isZh ? '本周解题' : 'This Week' }}</div>
            <div class="stat-sub">{{ weeklyTarget }}% {{ isZh ? '目标' : 'Target' }}</div>
          </div>
        </div>
      </div>

      <!-- Difficulty Breakdown -->
      <div class="section-card">
        <h2 class="section-title">
          <span class="section-icon">📈</span>
          {{ isZh ? '难度分布' : 'Difficulty Breakdown' }}
        </h2>
        <div class="difficulty-bars">
          <div class="diff-item">
            <div class="diff-header">
              <span class="diff-label easy-label">🟢 {{ isZh ? '简单' : 'Easy' }}</span>
              <span class="diff-count">{{ difficultyStats.easy }}</span>
            </div>
            <div class="diff-bar-bg">
              <div class="diff-bar easy-bar" :style="{ width: getDiffPercent('easy') + '%' }"></div>
            </div>
          </div>
          <div class="diff-item">
            <div class="diff-header">
              <span class="diff-label medium-label">🟡 {{ isZh ? '中等' : 'Medium' }}</span>
              <span class="diff-count">{{ difficultyStats.medium }}</span>
            </div>
            <div class="diff-bar-bg">
              <div class="diff-bar medium-bar" :style="{ width: getDiffPercent('medium') + '%' }"></div>
            </div>
          </div>
          <div class="diff-item">
            <div class="diff-header">
              <span class="diff-label hard-label">🔴 {{ isZh ? '困难' : 'Hard' }}</span>
              <span class="diff-count">{{ difficultyStats.hard }}</span>
            </div>
            <div class="diff-bar-bg">
              <div class="diff-bar hard-bar" :style="{ width: getDiffPercent('hard') + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chapter Progress -->
      <div class="section-card">
        <h2 class="section-title">
          <span class="section-icon">📚</span>
          {{ isZh ? '各章节进度' : 'Chapter Progress' }}
        </h2>
        <div class="chapter-list">
          <div v-for="ch in chapterStats" :key="ch.id" class="chapter-item">
            <div class="chapter-header">
              <div class="chapter-color" :style="{ background: ch.color }"></div>
              <span class="chapter-name">{{ ch.short }}</span>
              <span class="chapter-count">{{ ch.solved }}/{{ ch.total }}</span>
            </div>
            <div class="chapter-bar-bg">
              <div class="chapter-bar" :style="{ width: ch.percent + '%', background: ch.color }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Weekly Activity Chart -->
      <div class="section-card chart-section">
        <h2 class="section-title">
          <span class="section-icon">📅</span>
          {{ isZh ? '周活跃度' : 'Weekly Activity' }}
        </h2>
        <div class="week-chart">
          <div v-for="(day, i) in weekData" :key="i" class="day-bar">
            <div class="day-fill" :style="{ height: day.height + '%' }" :title="day.count + ' problems'"></div>
            <span class="day-label">{{ day.label }}</span>
            <span class="day-count">{{ day.count }}</span>
          </div>
        </div>
      </div>

      <!-- Monthly Heatmap -->
      <div class="section-card heatmap-section">
        <h2 class="section-title">
          <span class="section-icon">🗓️</span>
          {{ isZh ? '刷题热力图 (近6月)' : 'Practice Heatmap (6 Months)' }}
        </h2>
        <div class="heatmap-wrapper">
          <div class="heatmap-months">
            <span v-for="(month, i) in heatmapMonths" :key="i" class="month-label">{{ month }}</span>
          </div>
          <div class="heatmap-grid">
            <div 
              v-for="(day, i) in heatmapData" 
              :key="i" 
              class="heatmap-cell"
              :class="'level-' + day.level"
              :title="day.date + ': ' + day.count + (isZh ? ' 题' : ' problems')"
            ></div>
          </div>
        </div>
        <div class="heatmap-legend">
          <span class="legend-label">{{ isZh ? '少' : 'Less' }}</span>
          <div class="legend-cells">
            <div class="heatmap-cell level-0"></div>
            <div class="heatmap-cell level-1"></div>
            <div class="heatmap-cell level-2"></div>
            <div class="heatmap-cell level-3"></div>
            <div class="heatmap-cell level-4"></div>
          </div>
          <span class="legend-label">{{ isZh ? '多' : 'More' }}</span>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="section-card">
        <h2 class="section-title">
          <span class="section-icon">⏰</span>
          {{ isZh ? '最近解题' : 'Recent Solved' }}
        </h2>
        <div class="recent-list">
          <div v-if="recentSolved.length === 0" class="empty-state">
            <span class="empty-icon">📭</span>
            <span class="empty-text">{{ isZh ? '暂无记录，开始刷题吧！' : 'No records yet. Start practicing!' }}</span>
          </div>
          <div v-for="item in recentSolved" :key="item.id" class="recent-item">
            <div class="recent-info">
              <span class="recent-title">{{ item.title }}</span>
              <span class="recent-chapter">{{ item.chapter }}</span>
            </div>
            <div class="recent-meta">
              <span class="recent-difficulty" :class="item.difficulty">{{ isZh ? difficultyLabels[item.difficulty] : item.difficulty }}</span>
              <span class="recent-date">{{ item.date }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Achievement Badges -->
      <div class="section-card">
        <h2 class="section-title">
          <span class="section-icon">🏆</span>
          {{ isZh ? '成就徽章' : 'Achievements' }}
        </h2>
        <div class="achievements-grid">
          <div v-for="badge in achievements" :key="badge.id" class="badge-item" :class="{ unlocked: badge.unlocked }">
            <div class="badge-icon">{{ badge.icon }}</div>
            <div class="badge-info">
              <span class="badge-name">{{ isZh ? badge.nameZh : badge.name }}</span>
              <span class="badge-desc">{{ isZh ? badge.descZh : badge.desc }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLang } from '../composables/i18n.js'
import { CHAPTERS } from '../composables/data.js'

const { isZh } = useLang()

// Progress data from localStorage
const getProgress = () => {
  try { return JSON.parse(localStorage.getItem('mc-algo-progress') || '{}') } 
  catch { return {} }
}

// Durations data
const getDurations = () => {
  try { return JSON.parse(localStorage.getItem('mc-algo-durations') || '[]') } 
  catch { return [] }
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

// Total progress percentage
const totalProgress = computed(() => {
  const totalProblems = CHAPTERS.reduce((sum, ch) => sum + ch.count, 0)
  return Math.round((totalSolved.value / totalProblems) * 100)
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

// Average per day
const avgPerDay = computed(() => {
  return totalSolved.value > 0 ? (totalSolved.value / 30).toFixed(1) : '0.0'
})

// This week
const thisWeek = computed(() => {
  const progress = getProgress()
  const durations = getDurations()
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  
  const dateSet = new Set()
  
  for (const [chapterId, problems] of Object.entries(progress)) {
    for (const [probId, data] of Object.entries(problems)) {
      if (data && typeof data === 'object' && data.checkedAt) {
        const date = new Date(data.checkedAt)
        if (date >= weekStart) {
          dateSet.add(data.checkedAt.split('T')[0])
        }
      }
    }
  }
  
  let total = 0
  for (const entry of durations) {
    if (entry.date) {
      const date = new Date(entry.date)
      if (date >= weekStart) {
        total++
      }
    }
  }
  
  return dateSet.size + total
})

// Weekly target (7 problems per week)
const weeklyTarget = computed(() => Math.round((thisWeek.value / 7) * 100))

// Difficulty stats
const difficultyStats = computed(() => {
  return { easy: Math.round(totalSolved.value * 0.5), medium: Math.round(totalSolved.value * 0.4), hard: Math.round(totalSolved.value * 0.1) }
})

// Get difficulty percentage
const getDiffPercent = (diff) => {
  const total = difficultyStats.value.easy + difficultyStats.value.medium + difficultyStats.value.hard
  if (total === 0) return 0
  return Math.round((difficultyStats.value[diff] / total) * 100)
}

// Chapter stats
const chapterStats = computed(() => {
  const progress = getProgress()
  return CHAPTERS.map(ch => {
    const chapterProgress = progress[ch.id] || {}
    const solved = Object.values(chapterProgress).filter(v => {
      if (typeof v === 'object' && v !== null) return !!v.checked
      return !!v
    }).length
    return {
      id: ch.id,
      short: ch.short,
      color: ch.color,
      solved,
      total: ch.count,
      percent: Math.round((solved / ch.count) * 100)
    }
  })
})

// Week data for chart
const weekData = computed(() => {
  const labels = isZh.value ? ['日', '一', '二', '三', '四', '五', '六'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
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
      height: Math.min(count * 10, 100)
    })
  }
  
  return days
})

// Heatmap data
const heatmapData = computed(() => {
  const data = []
  const today = new Date()
  const counts = {}
  const progress = getProgress()
  
  for (const [chapterId, problems] of Object.entries(progress)) {
    for (const [probId, pdata] of Object.entries(problems)) {
      if (pdata && typeof pdata === 'object' && pdata.checkedAt) {
        const date = pdata.checkedAt.split('T')[0]
        counts[date] = (counts[date] || 0) + 1
      }
    }
  }
  
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 180)
  
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    const count = counts[dateStr] || 0
    
    let level = 0
    if (count > 0) {
      if (count <= 1) level = 1
      else if (count <= 3) level = 2
      else if (count <= 5) level = 3
      else level = 4
    }
    
    data.push({ date: dateStr, count, level })
  }
  
  return data
})

// Month labels for heatmap
const heatmapMonths = computed(() => {
  const months = []
  const today = new Date()
  const seen = new Set()
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i * 30)
    const month = d.toLocaleDateString(isZh.value ? 'zh-CN' : 'en-US', { month: 'short' })
    if (!seen.has(month)) {
      months.push(month)
      seen.add(month)
    }
  }
  
  return months
})

// Difficulty labels
const difficultyLabels = { easy: '简单', medium: '中等', hard: '困难' }

// Recent solved
const recentSolved = computed(() => {
  const progress = getProgress()
  const items = []
  
  for (const ch of CHAPTERS) {
    const problems = progress[ch.id] || {}
    for (const [probId, data] of Object.entries(problems)) {
      if (data && typeof data === 'object' && data.checkedAt) {
        items.push({
          id: `${ch.id}-${probId}`,
          title: probId,
          chapter: ch.short,
          difficulty: 'medium',
          date: new Date(data.checkedAt).toLocaleDateString(isZh.value ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })
        })
      }
    }
  }
  
  return items.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)
})

// Achievements
const achievements = computed(() => [
  { id: 'first', name: 'First Blood', nameZh: '初出茅庐', desc: 'Solve your first problem', descZh: '解决第一道题', icon: '🎯', unlocked: totalSolved.value >= 1 },
  { id: 'ten', name: 'Getting Started', nameZh: '小试牛刀', desc: 'Solve 10 problems', descZh: '解决10道题', icon: '⭐', unlocked: totalSolved.value >= 10 },
  { id: 'fifty', name: 'Half Century', nameZh: '五十大关', desc: 'Solve 50 problems', descZh: '解决50道题', icon: '🌟', unlocked: totalSolved.value >= 50 },
  { id: 'hundred', name: 'Century', nameZh: '百题斩', desc: 'Solve 100 problems', descZh: '解决100道题', icon: '💯', unlocked: totalSolved.value >= 100 },
  { id: 'streak7', name: 'Week Warrior', nameZh: '周连胜', desc: '7 day streak', descZh: '连续7天', icon: '🔥', unlocked: currentStreak.value >= 7 },
  { id: 'streak30', name: 'Month Master', nameZh: '月冠军', desc: '30 day streak', descZh: '连续30天', icon: '👑', unlocked: currentStreak.value >= 30 },
])
</script>

<style scoped>
.stats-page {
  min-height: 100vh;
  padding: 80px 0 60px;
  background: var(--bg-dark);
  background-image: 
    radial-gradient(ellipse at top left, rgba(0, 240, 255, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(124, 58, 237, 0.05) 0%, transparent 50%);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Page Header */
.page-header {
  text-align: center;
  padding: 40px 0 30px;
  position: relative;
}

.header-content {
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  margin: 0 0 12px;
  letter-spacing: 0.05em;
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.title-icon {
  font-size: 1.2em;
  -webkit-text-fill-color: initial;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.header-decoration {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
}

.deco-line {
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--neon-cyan), transparent);
}

.deco-dots {
  display: flex;
  gap: 6px;
}

.deco-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--neon-cyan);
  box-shadow: 0 0 8px var(--glow-primary);
  animation: dotPulse 2s ease-in-out infinite;
}

.deco-dots span:nth-child(2) { animation-delay: 0.3s; }
.deco-dots span:nth-child(3) { animation-delay: 0.6s; }

@keyframes dotPulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: linear-gradient(145deg, rgba(20, 30, 50, 0.9), rgba(10, 15, 30, 0.9));
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  gap: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--neon-cyan), transparent);
}

.stat-card.primary::before { background: linear-gradient(90deg, transparent, #00f0ff, transparent); }
.stat-card.streak::before { background: linear-gradient(90deg, transparent, #ff6b35, transparent); }
.stat-card.avg::before { background: linear-gradient(90deg, transparent, #7c3aed, transparent); }
.stat-card.week::before { background: linear-gradient(90deg, transparent, #10b981, transparent); }

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 240, 255, 0.15);
  border-color: rgba(0, 240, 255, 0.4);
}

.stat-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  line-height: 1;
  text-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-progress {
  margin-top: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  height: 6px;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--neon-cyan), var(--neon-purple));
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  position: absolute;
  right: 0;
  top: -18px;
  font-size: 0.7rem;
  color: var(--neon-cyan);
  font-family: monospace;
}

.stat-badge {
  margin-top: 8px;
  padding: 4px 8px;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  border-radius: 4px;
  font-size: 0.7rem;
  color: #fff;
  display: inline-block;
}

.stat-sub {
  margin-top: 8px;
  font-size: 0.75rem;
  color: var(--text-dim);
}

/* Section Cards */
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

/* Difficulty Bars */
.difficulty-bars {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.diff-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.diff-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.diff-label {
  font-size: 0.9rem;
  font-weight: 500;
}

.diff-count {
  font-family: monospace;
  font-size: 1.1rem;
  color: #fff;
}

.diff-bar-bg {
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

.diff-bar {
  height: 100%;
  border-radius: 6px;
  transition: width 0.5s ease;
}

.easy-bar { background: linear-gradient(90deg, #4ade80, #22c55e); }
.medium-bar { background: linear-gradient(90deg, #fbbf24, #f59e0b); }
.hard-bar { background: linear-gradient(90deg, #f87171, #ef4444); }

/* Chapter List */
.chapter-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.chapter-item {
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.chapter-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.chapter-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.chapter-name {
  flex: 1;
  font-size: 0.9rem;
  color: #fff;
}

.chapter-count {
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.chapter-bar-bg {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.chapter-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

/* Week Chart */
.week-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 150px;
  padding: 20px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.day-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.day-fill {
  width: 40px;
  background: linear-gradient(to top, var(--neon-cyan), var(--neon-purple));
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height 0.3s ease;
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

/* Heatmap */
.heatmap-wrapper {
  overflow-x: auto;
  padding-bottom: 10px;
}

.heatmap-months {
  display: flex;
  margin-left: 24px;
  margin-bottom: 8px;
}

.month-label {
  font-size: 0.7rem;
  color: var(--text-dim);
  min-width: calc(52px * 4);
}

.heatmap-grid {
  display: grid;
  grid-template-rows: repeat(7, 14px);
  grid-auto-flow: column;
  gap: 3px;
}

.heatmap-cell {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.05);
}

.heatmap-cell.level-0 { background: rgba(255, 255, 255, 0.05); }
.heatmap-cell.level-1 { background: rgba(0, 240, 255, 0.3); }
.heatmap-cell.level-2 { background: rgba(0, 240, 255, 0.5); }
.heatmap-cell.level-3 { background: rgba(0, 240, 255, 0.7); }
.heatmap-cell.level-4 { background: rgba(0, 240, 255, 1); }

.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.legend-label {
  font-size: 0.7rem;
  color: var(--text-dim);
}

.legend-cells {
  display: flex;
  gap: 3px;
}

/* Recent List */
.recent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-dim);
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 10px;
}

.empty-text {
  font-size: 0.9rem;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  transition: background 0.2s ease;
}

.recent-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.recent-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.recent-title {
  font-size: 0.95rem;
  color: #fff;
}

.recent-chapter {
  font-size: 0.75rem;
  color: var(--text-dim);
}

.recent-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.recent-difficulty {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
}

.recent-difficulty.easy { background: rgba(74, 222, 128, 0.2); color: #4ade80; }
.recent-difficulty.medium { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
.recent-difficulty.hard { background: rgba(248, 113, 113, 0.2); color: #f87171; }

.recent-date {
  font-size: 0.8rem;
  color: var(--text-dim);
  font-family: monospace;
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
  border-color: rgba(0, 240, 255, 0.3);
  background: linear-gradient(145deg, rgba(0, 240, 255, 0.1), rgba(124, 58, 237, 0.1));
}

.badge-icon {
  font-size: 2rem;
}

.badge-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.badge-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
}

.badge-desc {
  font-size: 0.75rem;
  color: var(--text-dim);
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chapter-list {
    grid-template-columns: 1fr;
  }
  
  .achievements-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .achievements-grid {
    grid-template-columns: 1fr;
  }
  
  .week-chart {
    height: 120px;
  }
  
  .day-fill {
    width: 30px;
  }
}
</style>
