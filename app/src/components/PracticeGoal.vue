<template>
  <div class="practice-goal">
    <!-- In-App Notification Toast -->
    <Transition name="slide-fade">
      <div v-if="showNotification" class="notification-toast" :class="notificationType">
        <span class="notification-icon">{{ getNotificationIcon() }}</span>
        <span class="notification-text">{{ notificationMessage }}</span>
        <button class="notification-close" @click="showNotification = false">&times;</button>
      </div>
    </Transition>

    <!-- Goal Progress Cards -->
    <div class="goal-cards">
      <!-- Daily Goal Card -->
      <div class="goal-card daily" :class="{ achieved: dailyGoalAchieved }">
        <div class="goal-header">
          <span class="goal-icon">&#127942;</span>
          <span class="goal-title">今日目标</span>
        </div>
        <div class="goal-progress-ring">
          <svg viewBox="0 0 100 100">
            <circle class="ring-bg" cx="50" cy="50" r="42" />
            <circle
              class="ring-progress"
              cx="50" cy="50" r="42"
              :stroke-dasharray="`${dailyProgress * 2.64} 264`"
              :class="{ complete: dailyGoalAchieved }"
            />
          </svg>
          <div class="ring-text">
            <span class="ring-current">{{ todayCount }}</span>
            <span class="ring-separator">/</span>
            <span class="ring-target">{{ goals.dailyGoal }}</span>
          </div>
        </div>
        <div class="goal-label">
          <span v-if="dailyGoalAchieved" class="achieved-text">已达成！</span>
          <span v-else class="remaining-text">还差 {{ goals.dailyGoal - todayCount }} 题</span>
        </div>
      </div>

      <!-- Weekly Goal Card -->
      <div class="goal-card weekly" :class="{ achieved: weeklyGoalAchieved }">
        <div class="goal-header">
          <span class="goal-icon">&#128200;</span>
          <span class="goal-title">本周目标</span>
        </div>
        <div class="goal-progress-ring">
          <svg viewBox="0 0 100 100">
            <circle class="ring-bg" cx="50" cy="50" r="42" />
            <circle
              class="ring-progress weekly"
              cx="50" cy="50" r="42"
              :stroke-dasharray="`${weeklyProgress * 2.64} 264`"
              :class="{ complete: weeklyGoalAchieved }"
            />
          </svg>
          <div class="ring-text">
            <span class="ring-current">{{ weekCount }}</span>
            <span class="ring-separator">/</span>
            <span class="ring-target">{{ goals.weeklyGoal }}</span>
          </div>
        </div>
        <div class="goal-label">
          <span v-if="weeklyGoalAchieved" class="achieved-text">已达成！</span>
          <span v-else class="remaining-text">还差 {{ goals.weeklyGoal - weekCount }} 题</span>
        </div>
      </div>

      <!-- Streak Card -->
      <div class="goal-card streak" :class="{ 'has-streak': currentStreak > 0 }">
        <div class="goal-header">
          <span class="goal-icon">&#128293;</span>
          <span class="goal-title">连续刷题</span>
        </div>
        <div class="streak-display">
          <span class="streak-count">{{ currentStreak }}</span>
          <span class="streak-label">天</span>
        </div>
        <div class="streak-best" v-if="longestStreak > 0">
          最佳: {{ longestStreak }} 天
        </div>
        <div class="streak-encouragement" v-else>
          开始你的连续刷题之旅！
        </div>
      </div>
    </div>

    <!-- Quick Week Breakdown -->
    <div class="week-breakdown">
      <h4 class="breakdown-title">本周进度</h4>
      <div class="breakdown-days">
        <div
          v-for="day in weekBreakdown"
          :key="day.date"
          class="breakdown-day"
          :class="{ today: day.isToday, practiced: day.count > 0 }"
        >
          <span class="day-name">{{ day.dayName }}</span>
          <span class="day-count">{{ day.count || '-' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePracticeGoal } from '../composables/usePracticeGoal.js'

const {
  goals,
  showNotification,
  notificationMessage,
  notificationType,
  todayCount,
  weekCount,
  dailyProgress,
  weeklyProgress,
  dailyGoalAchieved,
  weeklyGoalAchieved,
  currentStreak,
  longestStreak,
  getWeekBreakdown
} = usePracticeGoal()

const weekBreakdown = computed(() => getWeekBreakdown())

function getNotificationIcon() {
  switch (notificationType) {
    case 'success': return '🎉'
    case 'warning': return '⏰'
    default: return 'ℹ️'
  }
}
</script>

<style scoped>
.practice-goal {
  position: relative;
}

/* Notification Toast */
.notification-toast {
  position: fixed;
  top: 80px;
  right: 20px;
  background: var(--bg-panel);
  border: 1px solid var(--neon-primary);
  color: var(--text-primary);
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(0, 243, 255, 0.3);
  z-index: 1000;
  font-family: 'Ubuntu Mono', monospace;
  max-width: 320px;
}
.notification-toast.success {
  border-color: #1ec864;
  box-shadow: 0 4px 20px rgba(30, 200, 100, 0.3);
}
.notification-toast.warning {
  border-color: var(--neon-yellow);
  box-shadow: 0 4px 20px rgba(255, 230, 0, 0.3);
}
.notification-icon {
  font-size: 1.2em;
}
.notification-text {
  flex: 1;
  font-size: 0.85em;
}
.notification-close {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 1.2em;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}
.notification-close:hover {
  color: var(--text-primary);
}
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100px);
  opacity: 0;
}

/* Goal Cards Grid */
.goal-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.goal-card {
  background: var(--bg-panel);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
}
.goal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}
.goal-card.achieved {
  border-color: #1ec864;
  background: linear-gradient(135deg, rgba(30, 200, 100, 0.1), transparent);
}

.goal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}
.goal-icon {
  font-size: 1.2em;
}
.goal-title {
  font-size: 0.85em;
  color: var(--text-dim);
  font-family: 'Ubuntu Mono', monospace;
}

/* Progress Ring */
.goal-progress-ring {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 12px;
}
.goal-progress-ring svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}
.ring-bg {
  fill: none;
  stroke: var(--bg-secondary);
  stroke-width: 8;
}
.ring-progress {
  fill: none;
  stroke: var(--neon-primary);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
}
.ring-progress.weekly {
  stroke: var(--neon-secondary);
}
.ring-progress.complete {
  stroke: #1ec864;
}
.ring-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: baseline;
  font-family: 'Ubuntu Mono', monospace;
}
.ring-current {
  font-size: 1.4em;
  font-weight: bold;
  color: var(--neon-primary);
}
.ring-progress.complete + .ring-text .ring-current {
  color: #1ec864;
}
.ring-separator {
  font-size: 0.9em;
  color: var(--text-dim);
  margin: 0 2px;
}
.ring-target {
  font-size: 0.9em;
  color: var(--text-dim);
}

.goal-label {
  font-size: 0.8em;
  font-family: 'Ubuntu Mono', monospace;
}
.achieved-text {
  color: #1ec864;
  font-weight: bold;
}
.remaining-text {
  color: var(--text-dim);
}

/* Streak Card */
.goal-card.streak {
  border-color: var(--neon-yellow);
  background: linear-gradient(135deg, rgba(255, 230, 0, 0.05), transparent);
}
.goal-card.streak.has-streak {
  background: linear-gradient(135deg, rgba(255, 140, 0, 0.1), transparent);
}
.streak-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  margin-bottom: 8px;
}
.streak-count {
  font-size: 2.5em;
  font-weight: bold;
  font-family: 'Ubuntu Mono', monospace;
  color: var(--neon-yellow);
  text-shadow: 0 0 20px rgba(255, 230, 0, 0.5);
}
.streak-label {
  font-size: 1em;
  color: var(--text-dim);
}
.streak-best {
  font-size: 0.75em;
  color: var(--text-dim);
  font-family: 'Ubuntu Mono', monospace;
}
.streak-encouragement {
  font-size: 0.75em;
  color: var(--neon-yellow);
  opacity: 0.7;
}

/* Week Breakdown */
.week-breakdown {
  background: var(--bg-panel);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
}
.breakdown-title {
  margin: 0 0 12px 0;
  font-size: 0.85em;
  color: var(--text-dim);
  font-family: 'Ubuntu Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.breakdown-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}
.breakdown-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  border-radius: 6px;
  background: var(--bg-secondary);
  transition: all 0.2s ease;
}
.breakdown-day.today {
  border: 1px solid var(--neon-primary);
}
.breakdown-day.practiced {
  background: rgba(0, 243, 255, 0.1);
}
.breakdown-day.practiced .day-count {
  color: var(--neon-primary);
  font-weight: bold;
}
.day-name {
  font-size: 0.7em;
  color: var(--text-dim);
  margin-bottom: 4px;
}
.day-count {
  font-size: 0.9em;
  font-family: 'Ubuntu Mono', monospace;
  color: var(--text-dim);
}

/* Responsive */
@media (max-width: 600px) {
  .goal-cards {
    grid-template-columns: 1fr;
  }
  .goal-progress-ring {
    width: 60px;
    height: 60px;
  }
  .streak-count {
    font-size: 2em;
  }
}
</style>