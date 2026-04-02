<template>
  <div class="duration-stats-container">
    <div class="duration-header">
      <h3 class="duration-title">{{ isZh ? '解题时长统计' : 'DURATION STATS' }}</h3>
      <div class="session-controls">
        <button
          class="timer-btn"
          :class="{ active: isTimerRunning }"
          @click="toggleTimer"
        >
          {{ isTimerRunning ? '⏸ ' + formatTime(currentDuration) : '▶ ' + (isZh ? '开始计时' : 'Start') }}
        </button>
        <button
          v-if="currentDuration > 0"
          class="timer-btn timer-btn-reset"
          @click="resetTimer"
        >
          ↺
        </button>
      </div>
    </div>

    <!-- Current session -->
    <div class="current-session" v-if="isTimerRunning || currentDuration > 0">
      <div class="session-display">
        <div class="session-icon">{{ currentProblem ? '⏱' : '⏸' }}</div>
        <div class="session-info">
          <div class="session-label">{{ isZh ? '当前题目' : 'Current Problem' }}</div>
          <div class="session-problem">{{ currentProblem || (isZh ? '无' : 'None') }}</div>
        </div>
        <div class="session-time" :class="{ pulse: isTimerRunning }">
          {{ formatTime(currentDuration) }}
        </div>
      </div>
    </div>

    <!-- Stats grid -->
    <div class="stats-grid">
      <div class="stat-card pixel-card">
        <div class="stat-icon">📊</div>
        <div class="stat-value">{{ totalTimeFormatted }}</div>
        <div class="stat-label">{{ isZh ? '总学习时长' : 'Total Time' }}</div>
      </div>

      <div class="stat-card pixel-card">
        <div class="stat-icon">📈</div>
        <div class="stat-value">{{ avgTimePerProblem }}</div>
        <div class="stat-label">{{ isZh ? '平均每题' : 'Avg/Problem' }}</div>
      </div>

      <div class="stat-card pixel-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-value">{{ todayCount }}</div>
        <div class="stat-label">{{ isZh ? '今日已做' : 'Today' }}</div>
      </div>

      <div class="stat-card pixel-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-value">{{ bestStreak }}</div>
        <div class="stat-label">{{ isZh ? '最佳连续' : 'Best Streak' }}</div>
      </div>
    </div>

    <!-- Time distribution chart -->
    <div class="time-distribution">
      <h4 class="dist-title">{{ isZh ? '时长分布' : 'Time Distribution' }}</h4>
      <div class="dist-bars">
        <div
          v-for="(bar, i) in timeDistribution"
          :key="i"
          class="dist-bar-item"
        >
          <div class="bar-label">{{ bar.label }}</div>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{ height: bar.pct + '%', background: bar.color }"
            ></div>
          </div>
          <div class="bar-value">{{ bar.count }}</div>
        </div>
      </div>
    </div>

    <!-- Recent sessions -->
    <div class="recent-sessions">
      <h4 class="recent-title">{{ isZh ? '最近解题' : 'Recent Sessions' }}</h4>
      <div class="session-list">
        <div
          v-for="session in recentSessions"
          :key="session.id"
          class="session-item"
        >
          <div class="session-item-icon">{{ session.chapterIcon }}</div>
          <div class="session-item-info">
            <div class="session-item-title">{{ session.problemTitle }}</div>
            <div class="session-item-meta">
              <span class="session-item-chapter">{{ session.chapter }}</span>
              <span class="session-item-date">{{ session.dateStr }}</span>
            </div>
          </div>
          <div class="session-item-duration" :style="{ color: session.durationColor }">
            {{ formatTime(session.duration) }}
          </div>
        </div>

        <div v-if="recentSessions.length === 0" class="empty-sessions">
          {{ isZh ? '暂无记录，开始刷题吧！' : 'No records yet. Start practicing!' }}
        </div>
      </div>
    </div>

    <!-- Add problem input -->
    <div class="add-problem">
      <input
        v-model="problemInput"
        type="text"
        class="problem-input"
        :placeholder="isZh ? '输入当前题目...' : 'Enter current problem...'"
        @keyup.enter="setCurrentProblem"
      />
      <button class="set-problem-btn" @click="setCurrentProblem">
        {{ isZh ? '设置' : 'Set' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useLang } from '../composables/i18n.js'
import { CHAPTERS } from '../composables/data.js'

const { isZh } = useLang()

const STORAGE_KEY = 'mc-algo-durations'
const CURRENT_KEY = 'mc-algo-current-session'

// Timer state
const isTimerRunning = ref(false)
const currentDuration = ref(0)
const currentProblem = ref('')
const problemInput = ref('')
let timerInterval = null

// Load duration history
const durationHistory = ref([])

function loadHistory() {
  try {
    durationHistory.value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    durationHistory.value = []
  }
}

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(durationHistory.value))
}

// Load current session
function loadCurrentSession() {
  try {
    const session = JSON.parse(localStorage.getItem(CURRENT_KEY) || '{}')
    if (session.problem) {
      currentProblem.value = session.problem
      currentDuration.value = session.duration || 0
      if (session.startTime) {
        const elapsed = Math.floor((Date.now() - session.startTime) / 1000)
        currentDuration.value = session.duration + elapsed
      }
    }
  } catch {}
}

function saveCurrentSession() {
  const session = {
    problem: currentProblem.value,
    duration: currentDuration.value,
    startTime: isTimerRunning.value ? Date.now() : null
  }
  localStorage.setItem(CURRENT_KEY, JSON.stringify(session))
}

// Timer controls
function toggleTimer() {
  if (isTimerRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

function startTimer() {
  isTimerRunning.value = true
  timerInterval = setInterval(() => {
    currentDuration.value++
  }, 1000)
  saveCurrentSession()
}

function pauseTimer() {
  isTimerRunning.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  saveCurrentSession()
}

function resetTimer() {
  pauseTimer()
  if (currentDuration.value > 0 && currentProblem.value) {
    // Save to history
    const session = {
      id: Date.now(),
      problem: currentProblem.value,
      duration: currentDuration.value,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    }
    durationHistory.value.unshift(session)
    if (durationHistory.value.length > 50) {
      durationHistory.value = durationHistory.value.slice(0, 50)
    }
    saveHistory()
  }
  currentDuration.value = 0
  currentProblem.value = ''
  problemInput.value = ''
  localStorage.removeItem(CURRENT_KEY)
}

function setCurrentProblem() {
  if (problemInput.value.trim()) {
    currentProblem.value = problemInput.value.trim()
    problemInput.value = ''
    saveCurrentSession()
  }
}

// Format seconds to MM:SS or HH:MM:SS
function formatTime(seconds) {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins < 60) {
    return `${mins}m ${secs}s`
  }
  const hours = Math.floor(mins / 60)
  const remainingMins = mins % 60
  return `${hours}h ${remainingMins}m`
}

// Computed stats
const totalTimeFormatted = computed(() => {
  const total = durationHistory.value.reduce((sum, s) => sum + s.duration, 0) + currentDuration.value
  return formatTime(total)
})

const avgTimePerProblem = computed(() => {
  if (durationHistory.value.length === 0) return '—'
  const total = durationHistory.value.reduce((sum, s) => sum + s.duration, 0)
  const avg = Math.round(total / durationHistory.value.length)
  return formatTime(avg)
})

const todayCount = computed(() => {
  const today = new Date().toDateString()
  return durationHistory.value.filter(s =>
    new Date(s.timestamp).toDateString() === today
  ).length
})

const bestStreak = computed(() => {
  if (durationHistory.value.length === 0) return 0

  let best = 1
  let current = 1
  const dates = [...new Set(durationHistory.value.map(s =>
    new Date(s.timestamp).toDateString()
  ))].sort((a, b) => new Date(b) - new Date(a))

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diffDays = Math.floor((prev - curr) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      current++
      best = Math.max(best, current)
    } else {
      current = 1
    }
  }

  return best
})

// Time distribution
const timeDistribution = computed(() => {
  const buckets = [
    { label: '<5m', min: 0, max: 300, color: '#50fa7b' },
    { label: '5-15m', min: 300, max: 900, color: '#00f0ff' },
    { label: '15-30m', min: 900, max: 1800, color: '#f1fa8c' },
    { label: '30-60m', min: 1800, max: 3600, color: '#ffb86c' },
    { label: '>1h', min: 3600, max: Infinity, color: '#ff5555' }
  ]

  const counts = buckets.map(b => ({
    ...b,
    count: 0
  }))

  durationHistory.value.forEach(s => {
    const bucket = counts.find(b => s.duration >= b.min && s.duration < b.max)
    if (bucket) bucket.count++
  })

  const maxCount = Math.max(...counts.map(b => b.count), 1)
  counts.forEach(b => {
    b.pct = (b.count / maxCount) * 100
  })

  return counts
})

// Recent sessions with chapter info
const recentSessions = computed(() => {
  return durationHistory.value.slice(0, 5).map(s => {
    // Try to find chapter info from problem title
    let chapterIcon = '📝'
    let chapter = ''
    let durationColor = '#00f0ff'

    if (s.duration < 300) durationColor = '#50fa7b'
    else if (s.duration < 900) durationColor = '#00f0ff'
    else if (s.duration < 1800) durationColor = '#f1fa8c'
    else durationColor = '#ffb86c'

    // Simple heuristic: first char or number
    if (s.problem && s.problem.match(/^\d/)) {
      chapterIcon = '🔢'
    }

    return {
      ...s,
      chapterIcon,
      chapter,
      durationColor
    }
  })
})

// Watch for tab visibility to handle background timing
function handleVisibility() {
  if (document.hidden && isTimerRunning.value) {
    pauseTimer()
  }
}

onMounted(() => {
  loadHistory()
  loadCurrentSession()
  document.addEventListener('visibilitychange', handleVisibility)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  document.removeEventListener('visibilitychange', handleVisibility)
  saveCurrentSession()
})
</script>

<style scoped>
.duration-stats-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: rgba(10, 14, 26, 0.6);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 16px;
}

.duration-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.duration-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.1em;
  margin: 0;
}

.session-controls {
  display: flex;
  gap: 8px;
}

.timer-btn {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  padding: 6px 14px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.3);
  color: var(--neon-cyan);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.timer-btn:hover {
  background: rgba(0, 240, 255, 0.2);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.3);
}

.timer-btn.active {
  background: rgba(0, 240, 255, 0.2);
  border-color: var(--neon-cyan);
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.4);
}

.timer-btn-reset {
  padding: 6px 10px;
  background: rgba(255, 85, 85, 0.1);
  border-color: rgba(255, 85, 85, 0.3);
  color: #ff5555;
}

.timer-btn-reset:hover {
  background: rgba(255, 85, 85, 0.2);
  box-shadow: 0 0 12px rgba(255, 85, 85, 0.3);
}

/* Current session display */
.current-session {
  padding: 16px;
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 8px;
}

.session-display {
  display: flex;
  align-items: center;
  gap: 16px;
}

.session-icon {
  font-size: 2rem;
}

.session-info {
  flex: 1;
}

.session-label {
  font-size: 0.7rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.session-problem {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 2px;
}

.session-time {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--neon-cyan);
  text-shadow: 0 0 12px var(--glow-primary);
}

.session-time.pulse {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-card {
  padding: 16px 12px;
  text-align: center;
  background: rgba(10, 14, 26, 0.8) !important;
  border: 1px solid rgba(0, 240, 255, 0.15) !important;
  border-radius: 8px;
}

.stat-icon {
  font-size: 1.2rem;
  margin-bottom: 8px;
}

.stat-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--neon-cyan);
  text-shadow: 0 0 8px var(--glow-primary);
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-dim);
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Time distribution */
.time-distribution {
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.dist-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
}

.dist-bars {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 80px;
}

.dist-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
}

.bar-label {
  font-size: 0.65rem;
  color: var(--text-dim);
}

.bar-track {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  width: 100%;
  border-radius: 4px;
  transition: height 0.6s ease;
  min-height: 2px;
}

.bar-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: var(--text-secondary);
}

/* Recent sessions */
.recent-sessions {
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.recent-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(10, 14, 26, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.session-item:hover {
  border-color: rgba(0, 240, 255, 0.2);
  background: rgba(0, 240, 255, 0.05);
}

.session-item-icon {
  font-size: 1.2rem;
}

.session-item-info {
  flex: 1;
}

.session-item-title {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-item-meta {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}

.session-item-chapter,
.session-item-date {
  font-size: 0.7rem;
  color: var(--text-dim);
}

.session-item-duration {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  font-weight: 600;
}

.empty-sessions {
  text-align: center;
  padding: 20px;
  color: var(--text-dim);
  font-size: 0.85rem;
}

/* Add problem input */
.add-problem {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.problem-input {
  flex: 1;
  padding: 10px 14px;
  background: rgba(10, 14, 26, 0.8);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 0.85rem;
  outline: none;
  transition: all 0.2s ease;
}

.problem-input:focus {
  border-color: rgba(0, 240, 255, 0.5);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.2);
}

.problem-input::placeholder {
  color: var(--text-dim);
}

.set-problem-btn {
  padding: 10px 20px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.3);
  color: var(--neon-cyan);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.set-problem-btn:hover {
  background: rgba(0, 240, 255, 0.2);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.3);
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
