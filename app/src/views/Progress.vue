<template>
  <div class="progress-page">
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title pixel-font glow-cyan">
            {{ isZh ? '进度可视化' : 'PROGRESS DASHBOARD' }}
          </h1>
          <p class="page-subtitle">
            {{ isZh ? '全面掌控你的刷题进度与能力成长' : 'Track your practice progress and ability growth' }}
          </p>
        </div>
        <div class="header-decoration">
          <div class="deco-line"></div>
          <div class="deco-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </header>

      <!-- Main visualizations grid -->
      <div class="viz-grid viz-grid-3col">
        <div class="viz-card viz-card-globe">
          <ProgressGlobe />
        </div>
        <div class="viz-card viz-card-radar">
          <AbilityRadar />
        </div>
        <div class="viz-card viz-card-chart">
          <ProgressChart />
        </div>
      </div>

      <!-- Quick stats bar -->
      <div class="quick-stats">
        <div class="quick-stat-item">
          <div class="qs-icon">📚</div>
          <div class="qs-content">
            <div class="qs-value">{{ doneTotal }}</div>
            <div class="qs-label">{{ isZh ? '已解题数' : 'Solved' }}</div>
          </div>
        </div>
        <div class="qs-divider"></div>
        <div class="quick-stat-item">
          <div class="qs-icon">🎯</div>
          <div class="qs-content">
            <div class="qs-value">{{ targetProblems }}</div>
            <div class="qs-label">{{ isZh ? '目标题目' : 'Target' }}</div>
          </div>
        </div>
        <div class="qs-divider"></div>
        <div class="quick-stat-item">
          <div class="qs-icon">⚡</div>
          <div class="qs-content">
            <div class="qs-value">{{ efficiencyRate }}%</div>
            <div class="qs-label">{{ isZh ? '完成效率' : 'Efficiency' }}</div>
          </div>
        </div>
        <div class="qs-divider"></div>
        <div class="quick-stat-item">
          <div class="qs-icon">🏆</div>
          <div class="qs-content">
            <div class="qs-value">{{ chaptersCleared }}/12</div>
            <div class="qs-label">{{ isZh ? '通关章节' : 'Chapters' }}</div>
          </div>
        </div>
      </div>

      <!-- Tips section -->
      <div class="tips-section pixel-card">
        <div class="tips-header">
          <span class="tips-icon">💡</span>
          <span class="tips-title">{{ isZh ? '提升建议' : 'Improvement Tips' }}</span>
        </div>
        <div class="tips-content">
          <ul class="tips-list">
            <li v-for="(tip, i) in improvementTips" :key="i" class="tip-item">
              <span class="tip-marker">{{ tip.icon }}</span>
              <span class="tip-text">{{ tip.text }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useLang } from '../composables/i18n.js'
import { CHAPTERS } from '../composables/data.js'
import { useProgress } from '../composables/progress.js'
import { useAuth } from '../composables/auth.js'
import { useProgressSync } from '../composables/progressSync.js'
import ProgressGlobe from '../components/ProgressGlobe.vue'
import AbilityRadar from '../components/AbilityRadar.vue'
import ProgressChart from '../components/ProgressChart.vue'

const { isZh } = useLang()
const { isLoggedIn } = useAuth()
const { loadFromServer } = useProgressSync()

// 使用共享的 progress store
const { progressData, doneTotal, totalProblems } = useProgress()

// 实际显示的总数（基于 progressData 计算）
const displayDoneTotal = computed(() => {
  let done = 0
  for (const ch of CHAPTERS) {
    const chapter = progressData.value[ch.id] || {}
    for (const prob in chapter) {
      const item = chapter[prob]
      if (item && (item.checked || item)) {
        done++
      }
    }
  }
  return done
})

// 监听登录状态，加载服务器数据
// 注意：loadFromServer() 内部已经会调用 setProgress() 更新共享 store
watch(() => isLoggedIn(), (loggedIn) => {
  if (loggedIn) {
    loadFromServer()
  }
}, { immediate: true })

// Load totals
const totals = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('_chapterTotals') || '{}')
  } catch {
    return {}
  }
})

// Target problems (total from loaded data)
const targetProblems = computed(() => {
  let total = 0
  for (const ch of CHAPTERS) {
    total += totals.value[ch.id] || 0
  }
  return total || totalProblems.value
})

// Efficiency rate
const efficiencyRate = computed(() => {
  if (targetProblems.value === 0) return 0
  return Math.round((displayDoneTotal.value / targetProblems.value) * 100)
})

// Chapters cleared
const chaptersCleared = computed(() => {
  let cleared = 0
  for (const ch of CHAPTERS) {
    const chapterProgress = progressData.value[ch.id] || {}
    const total = totals.value[ch.id] || ch.count || Object.keys(chapterProgress).length || 1
    const done = Object.values(chapterProgress).filter(v => {
      if (typeof v === 'object' && v !== null) return !!v.checked
      return !!v
    }).length
    if (total > 0 && done >= total) cleared++
  }
  return cleared
})

// Improvement tips based on progress
const improvementTips = computed(() => {
  const tips = []

  // Analyze weak chapters
  const chapterStats = CHAPTERS.map(ch => {
    const chapterProgress = progressData.value[ch.id] || {}
    const total = totals.value[ch.id] || ch.count || Object.keys(chapterProgress).length || 1
    const done = Object.values(chapterProgress).filter(v => {
      if (typeof v === 'object' && v !== null) return !!v.checked
      return !!v
    }).length
    return { ...ch, done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
  })

  // Find weakest chapter
  const weakChapters = chapterStats
    .filter(ch => ch.pct < 50 && ch.total > 0)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 2)

  if (weakChapters.length > 0) {
    tips.push({
      icon: '📈',
      text: isZh.value
        ? `建议加强「${weakChapters[0].short}」章节，目前完成度仅 ${weakChapters[0].pct}%`
        : `Focus on "${weakChapters[0].short}" - only ${weakChapters[0].pct}% complete`
    })
  }

  // Check for chapters not started
  const notStarted = chapterStats.filter(ch => ch.done === 0 && ch.total > 0)
  if (notStarted.length > 0 && notStarted.length <= 3) {
    tips.push({
      icon: '🚀',
      text: isZh.value
        ? `还有「${notStarted.map(c => c.short).join('」「')}」章节尚未开始`
        : `Chapters not started: ${notStarted.map(c => c.short).join(', ')}`
    })
  }

  // General tips
  if (doneTotal.value === 0) {
    tips.push({
      icon: '🎮',
      text: isZh.value
        ? '开始你的刷题之旅吧！从第一章「滑动窗口」逐步进阶'
        : 'Start your practice journey! Begin with Chapter 1 "Sliding Window"'
    })
  } else if (doneTotal.value < 50) {
    tips.push({
      icon: '⚡',
      text: isZh.value
        ? '坚持刷题，保持连续性。建议每天至少完成 2-3 题'
        : 'Keep practicing consistently. Aim for 2-3 problems daily'
    })
  } else if (doneTotal.value >= 100) {
    tips.push({
      icon: '🏆',
      text: isZh.value
        ? '太棒了！你已经解决了 100+ 题目，继续挑战高难度问题'
        : 'Amazing! 100+ problems solved. Try challenging harder problems'
    })
  }

  // Add streak tip if applicable
  const streakData = JSON.parse(localStorage.getItem('mc-algo-durations') || '[]')
  if (streakData.length > 0) {
    tips.push({
      icon: '🔥',
      text: isZh.value
        ? '记录解题时长有助于分析效率，关注平均每题耗时'
        : 'Tracking solve duration helps analyze efficiency'
    })
  }

  return tips.slice(0, 4)
})
</script>

<style scoped>
.progress-page {
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

/* Visualization Grid */
.viz-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.viz-grid-3col {
  grid-template-columns: 1fr 1fr 1fr;
}

.viz-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.viz-card {
  background: rgba(10, 14, 26, 0.8);
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 16px;
  overflow: hidden;
}

/* Quick Stats Bar */
.quick-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 24px 32px;
  margin-bottom: 32px;
  background: rgba(10, 14, 26, 0.9);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(12px);
}

.quick-stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qs-icon {
  font-size: 1.5rem;
}

.qs-content {
  display: flex;
  flex-direction: column;
}

.qs-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--neon-cyan);
  text-shadow: 0 0 10px var(--glow-primary);
}

.qs-label {
  font-size: 0.7rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.qs-divider {
  width: 1px;
  height: 40px;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(0, 240, 255, 0.3),
    transparent
  );
}

/* Tips Section */
.tips-section {
  padding: 24px;
  background: rgba(10, 14, 26, 0.9) !important;
  border: 1px solid rgba(255, 215, 0, 0.2) !important;
  border-radius: 12px;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.tips-icon {
  font-size: 1.2rem;
}

.tips-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  font-weight: 600;
  color: #ffd700;
  letter-spacing: 0.05em;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: rgba(255, 215, 0, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.1);
  border-radius: 6px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.tip-marker {
  font-size: 1rem;
  flex-shrink: 0;
}

.tip-text {
  flex: 1;
}

/* Responsive */
@media (max-width: 1024px) {
  .viz-grid {
    grid-template-columns: 1fr;
  }
  .viz-grid-3col {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .viz-grid-3col {
    grid-template-columns: 1fr;
  }

  .quick-stats {
    flex-wrap: wrap;
    gap: 16px;
    padding: 16px;
  }

  .qs-divider {
    display: none;
  }

  .quick-stat-item {
    flex: 1 1 40%;
    justify-content: center;
  }
}
</style>
