<template>
  <div class="goal-page">
    <div class="page-header">
      <h1 class="page-title">
        <span class="title-icon">&#127942;</span>
        刷题目标
      </h1>
      <p class="page-desc">设定目标，追踪进度，保持刷题动力</p>
    </div>

    <!-- Goal Component -->
    <PracticeGoal />

    <!-- Goal Settings Section -->
    <div class="settings-section">
      <h3 class="section-title">目标设置</h3>

      <!-- Daily Goal Setting -->
      <div class="setting-card">
        <div class="setting-header">
          <span class="setting-icon">&#128198;</span>
          <div class="setting-info">
            <span class="setting-title">每日目标</span>
            <span class="setting-desc">每天计划完成的题目数量</span>
          </div>
        </div>
        <div class="setting-control">
          <button class="adjust-btn" @click="adjustDailyGoal(-1)" :disabled="goals.dailyGoal <= 1">-</button>
          <input
            type="number"
            class="goal-input"
            v-model.number="localDailyGoal"
            @change="applyDailyGoal"
            min="1"
            max="100"
          />
          <button class="adjust-btn" @click="adjustDailyGoal(1)" :disabled="goals.dailyGoal >= 100">+</button>
        </div>
        <div class="quick-presets">
          <button
            v-for="preset in dailyPresets"
            :key="preset"
            class="preset-btn"
            :class="{ active: localDailyGoal === preset }"
            @click="setDailyGoal(preset)"
          >
            {{ preset }}
          </button>
        </div>
      </div>

      <!-- Weekly Goal Setting -->
      <div class="setting-card">
        <div class="setting-header">
          <span class="setting-icon">&#128200;</span>
          <div class="setting-info">
            <span class="setting-title">每周目标</span>
            <span class="setting-desc">每周计划完成的题目数量</span>
          </div>
        </div>
        <div class="setting-control">
          <button class="adjust-btn" @click="adjustWeeklyGoal(-1)" :disabled="goals.weeklyGoal <= 7">-</button>
          <input
            type="number"
            class="goal-input"
            v-model.number="localWeeklyGoal"
            @change="applyWeeklyGoal"
            min="7"
            max="500"
          />
          <button class="adjust-btn" @click="adjustWeeklyGoal(1)" :disabled="goals.weeklyGoal >= 500">+</button>
        </div>
        <div class="quick-presets">
          <button
            v-for="preset in weeklyPresets"
            :key="preset"
            class="preset-btn"
            :class="{ active: localWeeklyGoal === preset }"
            @click="setWeeklyGoal(preset)"
          >
            {{ preset }}
          </button>
        </div>
      </div>

      <!-- Reminder Settings -->
      <div class="setting-card reminder-settings">
        <div class="setting-header">
          <span class="setting-icon">&#128276;</span>
          <div class="setting-info">
            <span class="setting-title">提醒设置</span>
            <span class="setting-desc">目标达成和连续刷题提醒</span>
          </div>
        </div>
        <div class="toggle-group">
          <label class="toggle-item">
            <span>目标达成提醒</span>
            <input type="checkbox" v-model="localReminderEnabled" @change="applyReminderSettings" />
            <span class="toggle-switch"></span>
          </label>
          <label class="toggle-item">
            <span>连续刷题提醒</span>
            <input type="checkbox" v-model="localStreakReminderEnabled" @change="applyStreakReminderSettings" />
            <span class="toggle-switch"></span>
          </label>
        </div>
      </div>
    </div>

    <!-- Statistics Section -->
    <div class="stats-section">
      <h3 class="section-title">刷题统计</h3>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">{{ stats.totalProblems }}</span>
          <span class="stat-label">总解题数</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.totalDays }}</span>
          <span class="stat-label">活跃天数</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.avgPerDay }}</span>
          <span class="stat-label">日均解题</span>
        </div>
        <div class="stat-card highlight">
          <span class="stat-value streak">{{ stats.currentStreak }}</span>
          <span class="stat-label">当前连续</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.longestStreak }}</span>
          <span class="stat-label">最长连续</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.avgLast7 }}</span>
          <span class="stat-label">近7日日均</span>
        </div>
      </div>

      <!-- Recent History Chart -->
      <div class="history-chart">
        <h4 class="chart-title">近7天刷题记录</h4>
        <div class="chart-bars">
          <div
            v-for="day in recentHistory"
            :key="day.date"
            class="chart-bar-container"
          >
            <div
              class="chart-bar"
              :style="{ height: getBarHeight(day.count) + '%' }"
              :class="{ practiced: day.count > 0 }"
            >
              <span class="bar-tooltip">{{ day.count }}题</span>
            </div>
            <span class="chart-label">{{ formatDate(day.date) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Achievement Section -->
    <div class="achievement-section" v-if="stats.totalProblems > 0">
      <h3 class="section-title">成就里程碑</h3>
      <div class="achievements">
        <div
          v-for="achievement in achievements"
          :key="achievement.id"
          class="achievement-item"
          :class="{ unlocked: achievement.unlocked }"
        >
          <span class="achievement-icon">{{ achievement.icon }}</span>
          <span class="achievement-name">{{ achievement.name }}</span>
          <span class="achievement-desc">{{ achievement.desc }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePracticeGoal } from '../composables/usePracticeGoal.js'
import PracticeGoalComponent from '../components/PracticeGoal.vue'

const PracticeGoal = PracticeGoalComponent

const {
  goals,
  stats,
  recentHistory,
  setDailyGoal,
  setWeeklyGoal,
  setReminderEnabled,
  setStreakReminderEnabled
} = usePracticeGoal()

// Local state for editing
const localDailyGoal = ref(goals.value.dailyGoal)
const localWeeklyGoal = ref(goals.value.weeklyGoal)
const localReminderEnabled = ref(goals.value.reminderEnabled)
const localStreakReminderEnabled = ref(goals.value.streakReminderEnabled)

// Presets
const dailyPresets = [1, 3, 5, 10]
const weeklyPresets = [7, 15, 21, 35]

// Achievements definition
const achievements = computed(() => [
  {
    id: 'first',
    icon: '🎯',
    name: '初出茅庐',
    desc: '完成第一题',
    unlocked: stats.value.totalProblems >= 1
  },
  {
    id: 'week',
    icon: '🔥',
    name: '连续7天',
    desc: '保持7天连续刷题',
    unlocked: stats.value.longestStreak >= 7
  },
  {
    id: 'month',
    icon: '⚡',
    name: '月度刷题',
    desc: '累计完成100题',
    unlocked: stats.value.totalProblems >= 100
  },
  {
    id: 'dedication',
    icon: '💎',
    name: '坚持不懈',
    desc: '保持30天连续刷题',
    unlocked: stats.value.longestStreak >= 30
  },
  {
    id: 'master',
    icon: '👑',
    name: '刷题大师',
    desc: '累计完成500题',
    unlocked: stats.value.totalProblems >= 500
  },
  {
    id: 'legend',
    icon: '🌟',
    name: '刷题传奇',
    desc: '保持365天连续刷题',
    unlocked: stats.value.longestStreak >= 365
  }
])

// Methods
function adjustDailyGoal(delta) {
  const newValue = Math.max(1, Math.min(100, localDailyGoal.value + delta))
  localDailyGoal.value = newValue
  setDailyGoal(newValue)
}

function applyDailyGoal() {
  const value = Math.max(1, Math.min(100, localDailyGoal.value))
  localDailyGoal.value = value
  setDailyGoal(value)
}

function adjustWeeklyGoal(delta) {
  const newValue = Math.max(7, Math.min(500, localWeeklyGoal.value + delta))
  localWeeklyGoal.value = newValue
  setWeeklyGoal(newValue)
}

function applyWeeklyGoal() {
  const value = Math.max(7, Math.min(500, localWeeklyGoal.value))
  localWeeklyGoal.value = value
  setWeeklyGoal(value)
}

function applyReminderSettings() {
  setReminderEnabled(localReminderEnabled.value)
}

function applyStreakReminderSettings() {
  setStreakReminderEnabled(localStreakReminderEnabled.value)
}

function getBarHeight(count) {
  if (count === 0) return 5 // Minimum height for visibility
  const maxCount = Math.max(...recentHistory.value.map(d => d.count), 1)
  return Math.max(5, (count / maxCount) * 100)
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// Sync local state when goals change
onMounted(() => {
  localDailyGoal.value = goals.value.dailyGoal
  localWeeklyGoal.value = goals.value.weeklyGoal
  localReminderEnabled.value = goals.value.reminderEnabled
  localStreakReminderEnabled.value = goals.value.streakReminderEnabled
})
</script>

<style scoped>
.goal-page {
  min-height: 100vh;
  padding-top: 80px;
  padding-bottom: 40px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  padding: 40px 20px;
}

.page-title {
  font-family: 'Ubuntu Mono', Consolas, Monaco, monospace;
  font-size: 2.5em;
  margin: 0 0 16px 0;
  color: var(--neon-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.title-icon {
  font-size: 1em;
}

.page-desc {
  color: var(--text-dim);
  font-size: 1.1em;
  margin: 0;
}

/* Settings Section */
.settings-section,
.stats-section,
.achievement-section {
  margin: 24px 20px;
}

.section-title {
  font-family: 'Ubuntu Mono', Consolas, Monaco, monospace;
  font-size: 1.2em;
  color: var(--neon-primary);
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.setting-card {
  background: var(--bg-panel);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.setting-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.setting-icon {
  font-size: 1.5em;
}

.setting-info {
  flex: 1;
}

.setting-title {
  display: block;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.setting-desc {
  font-size: 0.85em;
  color: var(--text-dim);
}

.setting-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.adjust-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: transparent;
  color: var(--neon-primary);
  font-size: 1.2em;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Ubuntu Mono', monospace;
}

.adjust-btn:hover:not(:disabled) {
  background: var(--neon-primary);
  color: #000;
}

.adjust-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.goal-input {
  width: 80px;
  height: 36px;
  text-align: center;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1.1em;
  font-family: 'Ubuntu Mono', monospace;
}

.goal-input:focus {
  outline: none;
  border-color: var(--neon-primary);
}

.quick-presets {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.preset-btn {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: transparent;
  color: var(--text-dim);
  font-size: 0.85em;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Ubuntu Mono', monospace;
}

.preset-btn:hover {
  border-color: var(--neon-primary);
  color: var(--neon-primary);
}

.preset-btn.active {
  background: var(--neon-primary);
  border-color: var(--neon-primary);
  color: #000;
}

/* Toggle Settings */
.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.toggle-item span:first-child {
  color: var(--text-primary);
}

.toggle-item input {
  display: none;
}

.toggle-switch {
  width: 44px;
  height: 24px;
  background: var(--bg-secondary);
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  background: var(--text-dim);
  border-radius: 50%;
  top: 3px;
  left: 3px;
  transition: all 0.3s ease;
}

.toggle-item input:checked + .toggle-switch {
  background: var(--neon-primary);
}

.toggle-item input:checked + .toggle-switch::after {
  left: 23px;
  background: #000;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-card {
  background: var(--bg-panel);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.stat-card.highlight {
  border-color: var(--neon-yellow);
  background: linear-gradient(135deg, rgba(255, 230, 0, 0.1), transparent);
}

.stat-value {
  display: block;
  font-size: 1.8em;
  font-weight: bold;
  font-family: 'Ubuntu Mono', monospace;
  color: var(--neon-primary);
}

.stat-value.streak {
  color: var(--neon-yellow);
}

.stat-label {
  font-size: 0.75em;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* History Chart */
.history-chart {
  background: var(--bg-panel);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
}

.chart-title {
  margin: 0 0 16px 0;
  font-size: 0.9em;
  color: var(--text-dim);
  font-family: 'Ubuntu Mono', monospace;
}

.chart-bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 120px;
  gap: 8px;
}

.chart-bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.chart-bar {
  width: 100%;
  max-width: 40px;
  background: var(--bg-secondary);
  border-radius: 4px 4px 0 0;
  min-height: 5px;
  transition: height 0.3s ease;
  position: relative;
  margin-top: auto;
}

.chart-bar.practiced {
  background: linear-gradient(to top, var(--neon-primary), var(--neon-secondary));
}

.chart-bar:hover .bar-tooltip {
  opacity: 1;
}

.bar-tooltip {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7em;
  color: var(--text-primary);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s ease;
  font-family: 'Ubuntu Mono', monospace;
}

.chart-label {
  font-size: 0.7em;
  color: var(--text-dim);
  margin-top: 8px;
  font-family: 'Ubuntu Mono', monospace;
}

/* Achievements */
.achievements {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.achievement-item {
  background: var(--bg-panel);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  opacity: 0.4;
  filter: grayscale(1);
  transition: all 0.3s ease;
}

.achievement-item.unlocked {
  opacity: 1;
  filter: grayscale(0);
  border-color: var(--neon-yellow);
  background: linear-gradient(135deg, rgba(255, 230, 0, 0.1), transparent);
}

.achievement-icon {
  font-size: 2em;
  margin-bottom: 8px;
}

.achievement-name {
  font-weight: bold;
  color: var(--text-primary);
  font-size: 0.9em;
  margin-bottom: 4px;
}

.achievement-desc {
  font-size: 0.75em;
  color: var(--text-dim);
}

/* Responsive */
@media (max-width: 600px) {
  .page-title {
    font-size: 1.8em;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .achievements {
    grid-template-columns: 1fr;
  }
}
</style>