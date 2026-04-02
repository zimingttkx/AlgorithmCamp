<template>
  <div class="ability-radar-container">
    <div class="radar-header">
      <h3 class="radar-title">{{ isZh ? '能力雷达图' : 'ABILITY RADAR' }}</h3>
      <div class="skill-level-badge" :style="{ borderColor: skillLevelColor, color: skillLevelColor }">
        {{ skillLevelLabel }}
      </div>
    </div>

    <div class="radar-canvas-wrapper">
      <canvas ref="canvas" :width="canvasSize" :height="canvasSize"></canvas>

      <!-- Center stats -->
      <div class="radar-center">
        <div class="center-value">{{ skillScore }}</div>
        <div class="center-label">{{ isZh ? '综合分' : 'Score' }}</div>
      </div>
    </div>

    <!-- Legend -->
    <div class="radar-legend">
      <div
        v-for="(item, i) in abilityData"
        :key="i"
        class="legend-item"
      >
        <div class="legend-marker" :style="{ background: item.color }"></div>
        <span class="legend-text">{{ item.label }}</span>
        <span class="legend-value" :style="{ color: item.color }">{{ item.value }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useLang } from '../composables/i18n.js'
import { CHAPTERS } from '../composables/data.js'

const { isZh } = useLang()
const canvas = ref(null)
const canvasSize = 280

// Animation visibility control
const isVisible = ref(true)
let visibilityObserver = null
let animFrame = null

// Load progress data
const progress = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('mc-algo-progress') || '{}')
  } catch {
    return {}
  }
})

const totals = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('_chapterTotals') || '{}')
  } catch {
    return {}
  }
})

// Calculate ability data for each chapter category
const abilityData = computed(() => {
  return CHAPTERS.map(ch => {
    const chapterProgress = progress.value[ch.id] || {}
    const total = totals.value[ch.id] || Object.keys(chapterProgress).length || 1
    const done = Object.values(chapterProgress).filter(v => {
      if (typeof v === 'object' && v !== null) return !!v.checked
      return !!v
    }).length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0

    return {
      label: ch.short,
      value: pct,
      color: ch.light,
      done,
      total
    }
  })
})

// Calculate overall skill score
const skillScore = computed(() => {
  const totalDone = abilityData.value.reduce((sum, item) => sum + item.done, 0)
  const totalProblems = abilityData.value.reduce((sum, item) => sum + item.total, 0)
  return totalProblems > 0 ? Math.round((totalDone / totalProblems) * 100) : 0
})

// Calculate skill level label
const skillLevelLabel = computed(() => {
  const score = skillScore.value
  if (score >= 90) return isZh.value ? '大师' : 'Master'
  if (score >= 70) return isZh.value ? '专家' : 'Expert'
  if (score >= 50) return isZh.value ? '熟练' : 'Skilled'
  if (score >= 30) return isZh.value ? '入门' : 'Intermediate'
  return isZh.value ? '初学' : 'Beginner'
})

const skillLevelColor = computed(() => {
  const score = skillScore.value
  if (score >= 90) return '#ffd700'
  if (score >= 70) return '#ff6b6b'
  if (score >= 50) return '#00f0ff'
  if (score >= 30) return '#50fa7b'
  return '#ff79c6'
})

// Draw radar chart
function drawRadar() {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return

  const center = canvasSize / 2
  const maxRadius = center - 40
  const categories = abilityData.value
  const numCategories = categories.length
  const angleStep = (Math.PI * 2) / numCategories

  // Clear canvas
  ctx.clearRect(0, 0, canvasSize, canvasSize)

  // Draw background rings
  const ringLevels = [0.2, 0.4, 0.6, 0.8, 1.0]
  ringLevels.forEach(level => {
    ctx.beginPath()
    for (let i = 0; i <= numCategories; i++) {
      const angle = i * angleStep - Math.PI / 2
      const x = center + maxRadius * level * Math.cos(angle)
      const y = center + maxRadius * level * Math.sin(angle)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.strokeStyle = `rgba(0, 240, 255, ${0.1 + level * 0.1})`
    ctx.lineWidth = 1
    ctx.stroke()
  })

  // Draw axis lines
  categories.forEach((cat, i) => {
    const angle = i * angleStep - Math.PI / 2
    const x = center + maxRadius * Math.cos(angle)
    const y = center + maxRadius * Math.sin(angle)

    ctx.beginPath()
    ctx.moveTo(center, center)
    ctx.lineTo(x, y)
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw labels
    const labelRadius = maxRadius + 20
    const labelX = center + labelRadius * Math.cos(angle)
    const labelY = center + labelRadius * Math.sin(angle)

    ctx.fillStyle = cat.color
    ctx.font = '10px "JetBrains Mono", monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(cat.label, labelX, labelY)
  })

  // Draw data polygon
  ctx.beginPath()
  categories.forEach((cat, i) => {
    const angle = i * angleStep - Math.PI / 2
    const value = cat.value / 100
    const x = center + maxRadius * value * Math.cos(angle)
    const y = center + maxRadius * value * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.closePath()

  // Fill gradient
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, maxRadius)
  gradient.addColorStop(0, 'rgba(0, 240, 255, 0.3)')
  gradient.addColorStop(1, 'rgba(0, 240, 255, 0.05)')
  ctx.fillStyle = gradient
  ctx.fill()

  // Stroke
  ctx.strokeStyle = '#00f0ff'
  ctx.lineWidth = 2
  ctx.stroke()

  // Draw data points
  categories.forEach((cat, i) => {
    const angle = i * angleStep - Math.PI / 2
    const value = cat.value / 100
    const x = center + maxRadius * value * Math.cos(angle)
    const y = center + maxRadius * value * Math.sin(angle)

    // Outer glow
    ctx.beginPath()
    ctx.arc(x, y, 8, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0, 240, 255, 0.2)'
    ctx.fill()

    // Inner point
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fillStyle = cat.color
    ctx.fill()

    // Point shadow
    ctx.shadowColor = cat.color
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  })
}

// Visibility-based animation control
function startAnimation() {
  if (animFrame) return
  function loop() {
    if (isVisible.value) {
      animFrame = requestAnimationFrame(loop)
    }
  }
  loop()
}

function stopAnimation() {
  if (animFrame) {
    cancelAnimationFrame(animFrame)
    animFrame = null
  }
}

function initVisibilityObserver() {
  if (!canvas.value) return

  visibilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isVisible.value = entry.isIntersecting
        if (entry.isIntersecting) {
          startAnimation()
        } else {
          stopAnimation()
        }
      })
    },
    { threshold: 0.1 }
  )

  visibilityObserver.observe(canvas.value)
}

onMounted(() => {
  initVisibilityObserver()
  startAnimation()
})

onUnmounted(() => {
  stopAnimation()
  if (visibilityObserver) {
    visibilityObserver.disconnect()
  }
})

watch(progress, () => {
  drawRadar()
}, { deep: true })
</script>

<style scoped>
.ability-radar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(10, 14, 26, 0.6);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 16px;
}

.radar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.radar-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.1em;
  margin: 0;
}

.skill-level-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 12px;
  border: 1px solid;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.radar-canvas-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radar-canvas-wrapper canvas {
  display: block;
}

.radar-center {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.center-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 2rem;
  font-weight: 700;
  color: var(--neon-cyan);
  text-shadow: 0 0 16px var(--glow-primary);
}

.center-label {
  font-size: 0.7rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.radar-legend {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  width: 100%;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
}

.legend-marker {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-text {
  color: var(--text-secondary);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.legend-value {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
}

@media (max-width: 480px) {
  .radar-legend {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
