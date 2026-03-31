<template>
  <div class="level-card pixel-card">
    <!-- 等级头部 -->
    <div class="lc-header">
      <div class="lc-icon">{{ info.icon }}</div>
      <div class="lc-info">
        <div class="lc-title">LV.{{ info.level }}</div>
        <div class="lc-sub">{{ isZh ? info.title : info.titleEn }}</div>
      </div>
      <div class="lc-xp-badge">{{ info.totalXP }} XP</div>
    </div>

    <!-- 经验值进度条 -->
    <div class="lc-bar-wrap">
      <div class="lc-bar-outer">
        <div class="lc-bar-inner" :style="{ width: info.progress + '%' }"></div>
      </div>
      <div class="lc-bar-label">
        <span>{{ info.xpInLevel }} / {{ info.xpNeeded }} XP</span>
        <span v-if="!info.isMaxLevel">Next: LV.{{ info.level + 1 }}</span>
        <span v-else>MAX LEVEL</span>
      </div>
    </div>

    <!-- 统计数据 -->
    <div class="lc-stats">
      <div class="lc-stat">
        <div class="lc-stat-val">{{ totalCommits }}</div>
        <div class="lc-stat-label">{{ isZh ? '总提交' : 'Commits' }}</div>
      </div>
      <div class="lc-stat">
        <div class="lc-stat-val lc-streak">{{ streak.current }}</div>
        <div class="lc-stat-label">{{ isZh ? '连续天数' : 'Streak' }} 🔥</div>
      </div>
      <div class="lc-stat">
        <div class="lc-stat-val">{{ streak.longest }}</div>
        <div class="lc-stat-label">{{ isZh ? '最长连续' : 'Longest' }}</div>
      </div>
    </div>

    <!-- 升级提示 -->
    <div v-if="showLevelUp" class="lc-levelup active">
      <span class="lc-levelup-text">LEVEL UP!</span>
      <span class="lc-levelup-level">LV.{{ info.level }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { calcLevel, calcStreak, CONFIG } from '../composables/stats.js'
import { useLang } from '../composables/i18n.js'

const props = defineProps({
  totalCommits: { type: Number, default: 0 },
  calendar: { type: Object, default: () => ({}) }
})

const { isZh } = useLang()
const showLevelUp = ref(false)
let prevLevel = 0

const info = ref(calcLevel(0))
const streak = ref({ current: 0, longest: 0 })

function updateInfo() {
  const xp = props.totalCommits * CONFIG.xpPerCommit
  info.value = calcLevel(xp)
  streak.value = calcStreak(props.calendar)
  if (prevLevel > 0 && info.value.level > prevLevel) {
    showLevelUp.value = true
    setTimeout(() => { showLevelUp.value = false }, 3000)
  }
  prevLevel = info.value.level
}

watch(() => props.totalCommits, updateInfo)
onMounted(updateInfo)
</script>

<style scoped>
.level-card {
  padding: 20px 24px;
  position: relative;
  overflow: hidden;
}
.lc-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.lc-icon {
  font-size: 1.4rem;
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--neon-blue);
  color: var(--neon-blue);
  text-shadow: 0 0 8px var(--neon-blue);
  flex-shrink: 0;
}
.lc-info { flex: 1; }
.lc-title {
  font-size: 1.2rem; font-weight: 700;
  color: var(--neon-cyan);
  text-shadow: 0 0 6px var(--neon-cyan);
}
.lc-sub { font-size: 0.85rem; color: var(--text-dim); }
.lc-xp-badge {
  font-size: 0.85rem; font-weight: 600;
  padding: 4px 12px;
  border: 1px solid var(--mc-gold);
  color: var(--mc-gold);
  white-space: nowrap;
}
.lc-bar-wrap { margin-bottom: 16px; }
.lc-bar-outer {
  width: 100%; height: 10px;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--border-pixel);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}
.lc-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, var(--neon-blue), var(--neon-cyan));
  box-shadow: 0 0 8px var(--neon-cyan);
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 2px;
}
.lc-bar-label {
  display: flex; justify-content: space-between;
  font-size: 0.75rem; color: var(--text-dim);
}
.lc-stats { display: flex; gap: 16px; }
.lc-stat {
  flex: 1; text-align: center;
  padding: 8px 4px;
  border: 1px solid var(--border-pixel);
  background: rgba(0,0,0,0.15);
}
.lc-stat-val {
  font-size: 1.1rem; font-weight: 700;
  color: var(--text-main);
}
.lc-streak {
  color: #f59e0b;
  text-shadow: 0 0 6px rgba(245,158,11,0.5);
}
.lc-stat-label {
  font-size: 0.75rem; color: var(--text-dim); margin-top: 2px;
}
.lc-levelup {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  background: rgba(0,0,0,0.85);
  opacity: 0; pointer-events: none;
  transition: opacity 0.3s;
}
.lc-levelup.active {
  opacity: 1;
  animation: levelUpGlow 0.6s ease;
}
.lc-levelup-text {
  font-size: 1.4rem; font-weight: 700;
  color: var(--mc-gold);
  text-shadow: 0 0 16px var(--mc-gold);
  letter-spacing: 0.2em;
}
.lc-levelup-level {
  font-size: 2rem; font-weight: 700;
  color: var(--neon-cyan);
  text-shadow: 0 0 20px var(--neon-cyan);
  margin-top: 8px;
}
@keyframes levelUpGlow {
  0% { opacity: 0; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style>
