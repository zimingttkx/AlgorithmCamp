<template>
  <div class="stats-page">
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title pixel-font glow-cyan">
            {{ isZh ? '刷题统计' : 'PRACTICE STATS' }}
          </h1>
          <p class="page-subtitle">
            {{ isZh ? '详细数据分析与可视化报表' : 'Detailed data analysis and visual reports' }}
          </p>
        </div>
        <div class="header-decoration">
          <div class="deco-line"></div>
          <div class="deco-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </header>

      <!-- Stats Panel -->
      <StatsPanel />

      <!-- Quick Summary -->
      <div class="quick-summary">
        <div class="summary-card">
          <div class="summary-icon">📊</div>
          <div class="summary-content">
            <div class="summary-value">{{ totalSolved }}</div>
            <div class="summary-label">{{ isZh ? '总解题数' : 'Total Solved' }}</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon">🔥</div>
          <div class="summary-content">
            <div class="summary-value">{{ currentStreak }}</div>
            <div class="summary-label">{{ isZh ? '当前连续' : 'Current Streak' }}</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon">⚡</div>
          <div class="summary-content">
            <div class="summary-value">{{ avgPerDay }}</div>
            <div class="summary-label">{{ isZh ? '日均解题' : 'Avg/Day' }}</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon">🎯</div>
          <div class="summary-content">
            <div class="summary-value">{{ thisWeek }}</div>
            <div class="summary-label">{{ isZh ? '本周解题' : 'This Week' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLang } from '../composables/i18n.js'
import { CHAPTERS } from '../composables/data.js'
import StatsPanel from '../components/StatsPanel.vue'

const { isZh } = useLang()

// Progress data from localStorage
const progress = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('mc-algo-progress') || '{}')
  } catch {
    return {}
  }
})

// Durations data
const durationsData = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('mc-algo-durations') || '[]')
  } catch {
    return []
  }
})

// Total solved count
const totalSolved = computed(() => {
  let total = 0
  for (const ch of CHAPTERS) {
    const chapterProgress = progress.value[ch.id] || {}
    total += Object.values(chapterProgress).filter(v => {
      if (typeof v === 'object' && v !== null) return !!v.checked
      return !!v
    }).length
  }
  return total
})

// Current streak calculation
const currentStreak = computed(() => {
  const dateMap = new Set()

  // Collect dates from progress
  for (const [chapterId, problems] of Object.entries(progress.value)) {
    for (const [probId, data] of Object.entries(problems)) {
      if (data && typeof data === 'object' && data.checkedAt) {
        dateMap.add(data.checkedAt.split('T')[0])
      }
    }
  }

  // Collect dates from durations
  for (const entry of durationsData.value) {
    if (entry.date) {
      dateMap.add(entry.date.split('T')[0])
    }
  }

  if (dateMap.size === 0) return 0

  const sortedDates = Array.from(dateMap).sort().reverse()
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) return 0

  let streak = 0
  let checkDate = new Date(sortedDates[0])

  while (dateMap.has(checkDate.toISOString().split('T')[0])) {
    streak++
    checkDate.setDate(checkDate.getDate() - 1)
  }

  return streak
})

// Average problems per day (last 30 days)
const avgPerDay = computed(() => {
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)

  const dateMap = new Map()

  // Collect dates from progress
  for (const [chapterId, problems] of Object.entries(progress.value)) {
    for (const [probId, data] of Object.entries(problems)) {
      if (data && typeof data === 'object' && data.checkedAt) {
        const date = data.checkedAt.split('T')[0]
        dateMap.set(date, (dateMap.get(date) || 0) + 1)
      }
    }
  }

  // Collect dates from durations
  for (const entry of durationsData.value) {
    if (entry.date) {
      const date = entry.date.split('T')[0]
      dateMap.set(date, (dateMap.get(date) || 0) + 1)
    }
  }

  let totalInPeriod = 0
  for (const [date, count] of dateMap) {
    if (new Date(date) >= thirtyDaysAgo) {
      totalInPeriod += count
    }
  }

  return (totalInPeriod / 30).toFixed(1)
})

// This week problems
const thisWeek = computed(() => {
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())

  let total = 0
  const dateMap = new Map()

  // Collect dates from progress
  for (const [chapterId, problems] of Object.entries(progress.value)) {
    for (const [probId, data] of Object.entries(problems)) {
      if (data && typeof data === 'object' && data.checkedAt) {
        const date = data.checkedAt.split('T')[0]
        dateMap.set(date, (dateMap.get(date) || 0) + 1)
      }
    }
  }

  // Collect dates from durations
  for (const entry of durationsData.value) {
    if (entry.date) {
      const date = entry.date.split('T')[0]
      dateMap.set(date, (dateMap.get(date) || 0) + 1)
    }
  }

  for (const [date, count] of dateMap) {
    if (new Date(date) >= weekStart) {
      total += count
    }
  }

  return total
})
</script>

<style scoped>
.stats-page {
  min-height: 100vh;
  padding-top: 80px;
  padding-bottom: 60px;
  background: var(--bg-dark);
}

/* Page Header */
.page-header {
  padding: 40px 0 30px;
  text-align: center;
  position: relative;
}

.header-content {
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 700;
  margin: 0 0 12px;
  letter-spacing: 0.05em;
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

/* Quick Summary */
.quick-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 24px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(10, 14, 26, 0.9);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.summary-card:hover {
  border-color: rgba(0, 240, 255, 0.5);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.1);
  transform: translateY(-2px);
}

.summary-icon {
  font-size: 1.5rem;
}

.summary-content {
  display: flex;
  flex-direction: column;
}

.summary-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--neon-cyan);
  text-shadow: 0 0 10px var(--glow-primary);
}

.summary-label {
  font-size: 0.7rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Responsive */
@media (max-width: 768px) {
  .quick-summary {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .quick-summary {
    grid-template-columns: 1fr;
  }
}
</style>
