<template>
  <div class="practice-roadmap-container">
    <div class="roadmap-header">
      <h3 class="roadmap-title">{{ isZh ? '刷题路线图' : 'PRACTICE ROADMAP' }}</h3>
      <div class="roadmap-stats">
        <span class="stat-chip">
          <span class="chip-icon">🏆</span>
          {{ conqueredCount }} {{ isZh ? '关卡已通关' : 'Cleared' }}
        </span>
      </div>
    </div>

    <!-- Desktop: SVG Roadmap -->
    <div class="roadmap-svg-wrapper" v-if="!isMobile">
      <svg class="roadmap-svg" :viewBox="`0 0 ${svgWidth} ${svgHeight}`">
        <!-- Path connections -->
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.3"/>
            <stop offset="50%" stop-color="#00f0ff" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#ff00aa" stop-opacity="0.3"/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- Connection path -->
        <path
          :d="pathD"
          fill="none"
          stroke="url(#pathGradient)"
          stroke-width="3"
          stroke-linecap="round"
          filter="url(#glow)"
          class="connection-path"
        />

        <!-- Chapter nodes -->
        <g
          v-for="(node, i) in chapterNodes"
          :key="node.id"
          class="chapter-node"
          :class="{ locked: !node.unlocked, completed: node.completed, active: hoveredNode === i }"
          :transform="`translate(${node.x}, ${node.y})`"
          @mouseenter="hoveredNode = i"
          @mouseleave="hoveredNode = null"
          @click="handleNodeClick(node, i)"
        >
          <!-- Outer ring -->
          <circle
            r="32"
            :fill="node.unlocked ? 'rgba(10,14,26,0.9)' : 'rgba(20,20,40,0.9)'"
            :stroke="node.completed ? node.color : (node.unlocked ? 'rgba(0,240,255,0.5)' : 'rgba(100,100,120,0.3)')"
            stroke-width="2"
            class="node-outer"
          />

          <!-- Progress ring -->
          <circle
            v-if="node.unlocked && !node.completed"
            r="28"
            fill="none"
            :stroke="node.color"
            stroke-width="4"
            :stroke-dasharray="`${node.progress * 1.76} 176`"
            stroke-linecap="round"
            transform="rotate(-90)"
            :style="{ opacity: 0.6 + node.progress * 0.4 }"
          />

          <!-- Inner glow -->
          <circle
            v-if="node.unlocked"
            r="20"
            :fill="node.color"
            :style="{ opacity: 0.1 + node.progress * 0.15 }"
            class="node-glow"
          />

          <!-- Node content -->
          <g class="node-content">
            <!-- Lock icon -->
            <text
              v-if="!node.unlocked"
              x="0" y="0"
              text-anchor="middle"
              dominant-baseline="middle"
              font-size="16"
              fill="#555"
            >🔒</text>

            <!-- Number -->
            <text
              v-else
              x="0" y="-4"
              text-anchor="middle"
              dominant-baseline="middle"
              font-family="'JetBrains Mono', monospace"
              font-size="12"
              font-weight="bold"
              :fill="node.completed ? '#fff' : node.color"
            >{{ String(i + 1).padStart(2, '0') }}</text>

            <!-- Checkmark for completed -->
            <text
              v-if="node.completed"
              x="0" y="12"
              text-anchor="middle"
              dominant-baseline="middle"
              font-size="14"
            >✓</text>

            <!-- Short title -->
            <text
              v-if="!node.completed"
              x="0" y="12"
              text-anchor="middle"
              dominant-baseline="middle"
              font-size="7"
              fill="rgba(255,255,255,0.6)"
            >{{ node.short }}</text>
          </g>

          <!-- Flag for completed -->
          <g v-if="node.completed" :transform="`translate(20, -25)`">
            <rect x="0" y="0" width="2" height="16" fill="#ffd700"/>
            <polygon points="2,0 14,6 2,12" :fill="node.color"/>
          </g>
        </g>

        <!-- Hover tooltip -->
        <g v-if="hoveredNode !== null && chapterNodes[hoveredNode]" class="tooltip-group">
          <rect
            :x="tooltipX"
            :y="tooltipY - 50"
            width="140"
            height="60"
            rx="6"
            fill="rgba(10,14,26,0.95)"
            stroke="rgba(0,240,255,0.3)"
            stroke-width="1"
          />
          <text
            :x="tooltipX + 70"
            :y="tooltipY - 30"
            text-anchor="middle"
            font-size="11"
            font-weight="600"
            :fill="chapterNodes[hoveredNode].color"
          >{{ chapterNodes[hoveredNode].title }}</text>
          <text
            :x="tooltipX + 70"
            :y="tooltipY - 15"
            text-anchor="middle"
            font-size="9"
            fill="rgba(255,255,255,0.6)"
          >{{ chapterNodes[hoveredNode].done }} / {{ chapterNodes[hoveredNode].total }} {{ isZh ? '题' : 'problems' }}</text>
          <text
            :x="tooltipX + 70"
            :y="tooltipY"
            text-anchor="middle"
            font-size="12"
            font-weight="bold"
            :fill="chapterNodes[hoveredNode].color"
          >{{ chapterNodes[hoveredNode].pct }}%</text>
        </g>
      </svg>
    </div>

    <!-- Mobile: Card Grid -->
    <div class="roadmap-grid" v-else>
      <div
        v-for="(ch, i) in chapterData"
        :key="ch.id"
        class="roadmap-card pixel-card"
        :class="{ locked: !ch.unlocked, completed: ch.completed }"
        :style="{ borderColor: ch.unlocked ? ch.color : '#334' }"
      >
        <div class="card-num">{{ String(i + 1).padStart(2, '0') }}</div>
        <div class="card-title">{{ ch.short }}</div>
        <div class="card-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: ch.pct + '%', background: ch.unlocked ? ch.color : '#334' }"
            ></div>
          </div>
          <span class="progress-text" :style="{ color: ch.unlocked ? ch.color : '#555' }">
            {{ ch.pct }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLang } from '../composables/i18n.js'
import { CHAPTERS } from '../composables/data.js'

const { isZh } = useLang()
const isMobile = ref(false)
const hoveredNode = ref(null)

const svgWidth = 700
const svgHeight = 320

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

// Calculate chapter data
const chapterData = computed(() => {
  return CHAPTERS.map((ch, i) => {
    const chapterProgress = progress.value[ch.id] || {}
    const total = totals.value[ch.id] || Object.keys(chapterProgress).length || 1
    const done = Object.values(chapterProgress).filter(v => {
      if (typeof v === 'object' && v !== null) return !!v.checked
      return !!v
    }).length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0

    // Unlock logic: first chapter always unlocked, others need previous chapter completed
    let unlocked = i === 0
    if (i > 0) {
      const prevProgress = progress.value[CHAPTERS[i - 1].id] || {}
      const prevTotal = totals.value[CHAPTERS[i - 1].id] || Object.keys(prevProgress).length || 1
      const prevDone = Object.values(prevProgress).filter(v => {
        if (typeof v === 'object' && v !== null) return !!v.checked
        return !!v
      }).length
      unlocked = prevDone > 0
    }

    const completed = total > 0 && done >= total

    return {
      ...ch,
      done,
      total,
      pct,
      unlocked,
      completed
    }
  })
})

// Calculate conquered count
const conqueredCount = computed(() => {
  return chapterData.value.filter(ch => ch.completed).length
})

// Calculate node positions (serpentine path)
const chapterNodes = computed(() => {
  const nodes = []
  const cols = 4
  const startX = 80
  const startY = 260
  const gapX = 170
  const gapY = 100

  chapterData.value.forEach((ch, i) => {
    const row = Math.floor(i / cols)
    const col = row % 2 === 0 ? i % cols : (cols - 1 - (i % cols))
    const x = startX + col * gapX
    const y = startY - row * gapY

    nodes.push({
      ...ch,
      x,
      y
    })
  })

  return nodes
})

// Generate SVG path for connections
const pathD = computed(() => {
  const nodes = chapterNodes.value
  if (nodes.length === 0) return ''

  let d = `M ${nodes[0].x} ${nodes[0].y}`

  for (let i = 1; i < nodes.length; i++) {
    d += ` L ${nodes[i].x} ${nodes[i].y}`
  }

  return d
})

// Tooltip position
const tooltipX = computed(() => {
  if (hoveredNode.value === null) return 0
  return chapterNodes.value[hoveredNode.value].x
})

const tooltipY = computed(() => {
  if (hoveredNode.value === null) return 0
  return chapterNodes.value[hoveredNode.value].y
})

function handleNodeClick(node, index) {
  if (!node.unlocked) return
  // Could emit event to navigate to chapter
  console.log('Node clicked:', node.title)
}

function onResize() {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  onResize()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.practice-roadmap-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: rgba(10, 14, 26, 0.6);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 16px;
}

.roadmap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.roadmap-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.1em;
  margin: 0;
}

.roadmap-stats {
  display: flex;
  gap: 8px;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 4px;
  font-size: 0.75rem;
  color: #ffd700;
}

.chip-icon {
  font-size: 0.8rem;
}

/* SVG Roadmap */
.roadmap-svg-wrapper {
  width: 100%;
  overflow-x: auto;
}

.roadmap-svg {
  width: 100%;
  min-width: 600px;
  height: auto;
  min-height: 300px;
}

.chapter-node {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.chapter-node:hover {
  transform: scale(1.1);
}

.chapter-node.locked {
  cursor: not-allowed;
  opacity: 0.6;
}

.chapter-node.locked:hover {
  transform: none;
}

.node-outer {
  transition: all 0.3s ease;
}

.chapter-node:hover .node-outer {
  filter: drop-shadow(0 0 12px currentColor);
}

.connection-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawPath 2s ease-out forwards;
}

@keyframes drawPath {
  to {
    stroke-dashoffset: 0;
  }
}

/* Mobile Grid */
.roadmap-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.roadmap-card {
  padding: 12px;
  text-align: center;
  border: 2px solid;
  transition: all 0.2s ease;
}

.roadmap-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.roadmap-card.completed {
  border-color: #ffd700 !important;
}

.card-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: var(--text-dim);
  margin-bottom: 4px;
}

.card-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.card-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s ease;
}

.progress-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  font-weight: 600;
  min-width: 35px;
}

.tooltip-group {
  pointer-events: none;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
