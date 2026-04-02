<template>
  <div class="progress-globe-container">
    <div class="globe-wrapper">
      <!-- 3D Globe -->
      <div class="globe" :class="{ rotating: isRotating }">
        <div class="globe-sphere">
          <div class="globe-outer-ring"></div>
          <div class="globe-inner">
            <!-- Progress arc layers -->
            <svg class="globe-svg" viewBox="0 0 200 200">
              <!-- Background circle -->
              <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="8"/>
              <!-- Progress arcs -->
              <circle
                v-for="(arc, i) in progressArcs"
                :key="i"
                cx="100" cy="100" r="80"
                fill="none"
                :stroke="arc.color"
                stroke-width="6"
                stroke-linecap="round"
                :stroke-dasharray="arc.dashArray"
                :stroke-dashoffset="arc.dashOffset"
                :style="{ transform: `rotate(${arc.rotation}deg)`, transformOrigin: '100px 100px' }"
                class="progress-arc"
              />
              <!-- Chapter dots -->
              <circle
                v-for="(dot, i) in chapterDots"
                :key="'dot-'+i"
                :cx="dot.x"
                :cy="dot.y"
                :r="dot.active ? 5 : 3"
                :fill="dot.active ? dot.color : 'rgba(255,255,255,0.2)'"
                :style="{ filter: dot.active ? `drop-shadow(0 0 4px ${dot.color})` : 'none' }"
              />
            </svg>
          </div>
          <div class="globe-grid"></div>
          <div class="globe-glow"></div>
        </div>
        <!-- Orbit rings -->
        <div class="orbit-ring ring-1"></div>
        <div class="orbit-ring ring-2"></div>
        <div class="orbit-ring ring-3"></div>
      </div>

      <!-- Stats overlay -->
      <div class="globe-stats">
        <div class="stat-item">
          <div class="stat-value">{{ doneTotal }}</div>
          <div class="stat-label">{{ isZh ? '已解决' : 'Solved' }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ totalProblems }}</div>
          <div class="stat-label">{{ isZh ? '总题目' : 'Total' }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ donePct }}%</div>
          <div class="stat-label">{{ isZh ? '完成率' : 'Progress' }}</div>
        </div>
      </div>
    </div>

    <!-- Chapter progress legend -->
    <div class="globe-legend">
      <div
        v-for="ch in chapterProgress"
        :key="ch.id"
        class="legend-item"
      >
        <div class="legend-color" :style="{ background: ch.color }"></div>
        <div class="legend-text">
          <span class="legend-name">{{ ch.short }}</span>
          <span class="legend-pct" :style="{ color: ch.color }">{{ ch.pct }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLang } from '../composables/i18n.js'
import { CHAPTERS } from '../composables/data.js'
import { getProgress } from '../composables/progress.js'

const { isZh } = useLang()
const isRotating = ref(false)
const { doneTotal, totalProblems, donePct } = getProgress()

// Calculate chapter progress
const chapterProgress = computed(() => {
  const progress = JSON.parse(localStorage.getItem('mc-algo-progress') || '{}')
  const totals = JSON.parse(localStorage.getItem('_chapterTotals') || '{}')

  return CHAPTERS.map(ch => {
    const chapterProblems = progress[ch.id] || {}
    const done = Object.values(chapterProblems).filter(v => {
      if (typeof v === 'object' && v !== null) return !!v.checked
      return !!v
    }).length
    const total = totals[ch.id] || Object.keys(chapterProblems).length || 1
    const pct = Math.round((done / total) * 100)

    return {
      ...ch,
      done,
      total,
      pct
    }
  })
})

// Generate progress arcs for the globe
const progressArcs = computed(() => {
  const arcs = []
  let currentAngle = -90 // Start from top

  chapterProgress.value.forEach((ch, i) => {
    if (ch.pct > 0) {
      const arcLength = (ch.pct / 100) * 502.65 // 2 * PI * 80
      arcs.push({
        color: ch.light,
        dashArray: `${arcLength} ${502.65 - arcLength}`,
        dashOffset: 0,
        rotation: currentAngle
      })
      currentAngle += (ch.pct / 100) * 360
    }
  })

  return arcs
})

// Generate chapter dots around the globe
const chapterDots = computed(() => {
  const dots = []
  const totalChapters = 12
  const radius = 80

  for (let i = 0; i < totalChapters; i++) {
    const angle = (i / totalChapters) * 2 * Math.PI - Math.PI / 2
    const x = 100 + radius * Math.cos(angle)
    const y = 100 + radius * Math.sin(angle)
    const ch = chapterProgress.value[i]

    dots.push({
      x,
      y,
      active: ch && ch.pct > 0,
      color: ch ? ch.light : '#666'
    })
  }

  return dots
})

onMounted(() => {
  setTimeout(() => {
    isRotating.value = true
  }, 500)
})
</script>

<style scoped>
.progress-globe-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 20px;
}

.globe-wrapper {
  position: relative;
  width: 280px;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.globe {
  position: relative;
  width: 200px;
  height: 200px;
  transform-style: preserve-3d;
  perspective: 800px;
}

.globe.rotating .globe-sphere {
  animation: globeRotate 20s linear infinite;
}

.globe-sphere {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #1a3a5a 0%, #0a1520 60%, #050a10 100%);
  box-shadow:
    inset 0 0 60px rgba(0, 240, 255, 0.1),
    0 0 40px rgba(0, 240, 255, 0.2),
    0 0 80px rgba(0, 240, 255, 0.1);
  overflow: hidden;
}

.globe-outer-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid rgba(0, 240, 255, 0.3);
  animation: ringPulse 3s ease-in-out infinite;
}

.globe-inner {
  position: absolute;
  inset: 0;
  border-radius: 50%;
}

.globe-svg {
  width: 100%;
  height: 100%;
}

.progress-arc {
  transition: stroke-dasharray 1s ease-out;
}

.globe-grid {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background:
    linear-gradient(0deg, transparent 49%, rgba(0, 240, 255, 0.03) 50%, transparent 51%),
    linear-gradient(90deg, transparent 49%, rgba(0, 240, 255, 0.03) 50%, transparent 51%);
  background-size: 50% 50%;
  pointer-events: none;
}

.globe-glow {
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

/* Orbit rings */
.orbit-ring {
  position: absolute;
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 50%;
  pointer-events: none;
}

.ring-1 {
  inset: -20px;
  animation: orbitRotate 15s linear infinite;
}

.ring-2 {
  inset: -40px;
  animation: orbitRotate 25s linear infinite reverse;
}

.ring-3 {
  inset: -60px;
  animation: orbitRotate 35s linear infinite;
}

/* Stats overlay */
.globe-stats {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  padding: 12px 20px;
  background: rgba(10, 14, 26, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 12px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--neon-cyan);
  text-shadow: 0 0 8px var(--glow-primary);
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Legend */
.globe-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  max-width: 400px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(10, 14, 26, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}

.legend-color {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  box-shadow: 0 0 6px currentColor;
}

.legend-text {
  display: flex;
  gap: 8px;
  font-size: 0.75rem;
}

.legend-name {
  color: var(--text-secondary);
}

.legend-pct {
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
}

/* Animations */
@keyframes globeRotate {
  from { transform: rotateY(0deg); }
  to { transform: rotateY(360deg); }
}

@keyframes ringPulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.02); }
}

@keyframes orbitRotate {
  from { transform: rotateX(60deg) rotateZ(0deg); }
  to { transform: rotateX(60deg) rotateZ(360deg); }
}
</style>
