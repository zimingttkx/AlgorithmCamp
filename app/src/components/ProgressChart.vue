<template>
  <div class="progress-chart">
    <div class="chart-header">
      <h3>{{ isZh ? '刷题趋势' : 'Progress Trend' }}</h3>
      <div class="chart-legend">
        <span class="legend-item">
          <span class="legend-dot"></span>
          {{ isZh ? '每日解题' : 'Daily Solved' }}
        </span>
      </div>
    </div>
    <div class="chart-container" ref="chartRef">
      <svg :width="width" :height="height" class="chart-svg">
        <!-- Grid lines -->
        <g class="grid-lines">
          <line
            v-for="(tick, i) in yTicks"
            :key="'y-grid-' + i"
            :x1="padding.left"
            :y1="getY(tick)"
            :x2="width - padding.right"
            :y2="getY(tick)"
            class="grid-line"
          />
        </g>

        <!-- X-axis -->
        <g class="x-axis">
          <line
            :x1="padding.left"
            :y1="height - padding.bottom"
            :x2="width - padding.right"
            :y2="height - padding.bottom"
            class="axis-line"
          />
          <text
            v-for="(tick, i) in xTicks"
            :key="'x-' + i"
            :x="getX(tick.date)"
            :y="height - padding.bottom + 20"
            text-anchor="middle"
            class="axis-label"
          >
            {{ formatDate(tick.date) }}
          </text>
        </g>

        <!-- Y-axis -->
        <g class="y-axis">
          <text
            v-for="(tick, i) in yTicks"
            :key="'y-' + i"
            :x="padding.left - 8"
            :y="getY(tick)"
            text-anchor="end"
            dominant-baseline="middle"
            class="axis-label"
          >
            {{ tick }}
          </text>
        </g>

        <!-- Area fill -->
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="var(--neon-cyan)" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="var(--neon-cyan)" stop-opacity="0.05"/>
          </linearGradient>
        </defs>
        <path
          v-if="areaPath"
          :d="areaPath"
          fill="url(#areaGradient)"
          class="area-path"
        />

        <!-- Line -->
        <path
          v-if="linePath"
          :d="linePath"
          fill="none"
          stroke="var(--neon-cyan)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="line-path"
        />

        <!-- Data points -->
        <circle
          v-for="(point, i) in chartData"
          :key="'point-' + i"
          :cx="getX(point.date)"
          :cy="getY(point.count)"
          :r="4"
          fill="var(--neon-cyan)"
          class="data-point"
        />
      </svg>

      <!-- Empty state -->
      <div v-if="chartData.length === 0" class="empty-state">
        <p>{{ isZh ? '暂无数据，开始刷题吧！' : 'No data yet, start practicing!' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useLang } from '../composables/i18n.js'
import { useProgress } from '../composables/progress.js'
import { useAuth } from '../composables/auth.js'
import { useProgressSync } from '../composables/progressSync.js'

const { isZh } = useLang()
const { isLoggedIn } = useAuth()
const { loadFromServer } = useProgressSync()

// 使用共享的 progress store
const { progressData } = useProgress()

const chartRef = ref(null)
const width = ref(400)
const height = 200
const padding = { top: 20, right: 20, bottom: 40, left: 40 }

onMounted(async () => {
  // 加载服务器数据（如果已登录）
  // loadFromServer 内部已经会调用 setProgress() 更新共享 store
  if (isLoggedIn()) {
    loadFromServer()
  }

  // Update width based on container
  if (chartRef.value) {
    width.value = chartRef.value.clientWidth || 400
  }
})

// 监听登录状态变化
watch(() => isLoggedIn(), (loggedIn) => {
  if (loggedIn) {
    loadFromServer()
  }
})

// Aggregate progress by date
const chartData = computed(() => {
  const data = []

  for (const chapterId in progressData.value) {
    const chapter = progressData.value[chapterId]
    for (const probId in chapter) {
      const item = chapter[probId]
      if (item && item.timestamp) {
        const date = item.timestamp.split('T')[0]
        const existing = data.find(d => d.date === date)
        if (existing) {
          existing.count++
        } else {
          data.push({ date, count: 1 })
        }
      }
    }
  }

  // Sort by date
  data.sort((a, b) => new Date(a.date) - new Date(b.date))

  // Calculate cumulative sum
  let cumulative = 0
  return data.map(d => {
    cumulative += d.count
    return { date: d.date, count: cumulative }
  })
})

// Calculate ticks based on data range
const xTicks = computed(() => {
  if (chartData.value.length === 0) return []

  const dates = chartData.value.map(d => d.date)
  const start = new Date(dates[0])
  const end = new Date(dates[dates.length - 1])
  const days = (end - start) / (1000 * 60 * 60 * 24)

  const ticks = []
  let interval

  // Adjust interval based on time range
  if (days <= 7) {
    interval = 1 // daily
  } else if (days <= 30) {
    interval = 5 // every 5 days
  } else if (days <= 90) {
    interval = 15 // every 15 days
  } else if (days <= 365) {
    interval = 30 // monthly
  } else {
    interval = 90 // quarterly
  }

  for (let i = 0; i < dates.length; i++) {
    if (i % interval === 0 || i === dates.length - 1) {
      ticks.push({ date: dates[i] })
    }
  }

  return ticks
})

const yTicks = computed(() => {
  if (chartData.value.length === 0) return [0, 0]

  const max = Math.max(...chartData.value.map(d => d.count))
  const rounded = Math.ceil(max / 5) * 5 || 5
  const step = Math.max(1, Math.floor(rounded / 4))

  const ticks = []
  for (let i = 0; i <= rounded; i += step) {
    ticks.push(i)
  }
  return ticks
})

// Scale functions
function getX(date) {
  if (chartData.value.length === 0) return 0
  const dates = chartData.value.map(d => d.date)
  const min = new Date(dates[0]).getTime()
  const max = new Date(dates[dates.length - 1]).getTime()
  const range = max - min || 1
  const pos = (new Date(date).getTime() - min) / range
  return padding.left + pos * (width.value - padding.left - padding.right)
}

function getY(count) {
  if (chartData.value.length === 0) return height - padding.bottom
  const max = Math.max(...chartData.value.map(d => d.count), 1)
  const pos = 1 - (count / max)
  return padding.top + pos * (height - padding.top - padding.bottom)
}

// Line path
const linePath = computed(() => {
  if (chartData.value.length === 0) return ''
  return chartData.value
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.date)} ${getY(d.count)}`)
    .join(' ')
})

// Area path
const areaPath = computed(() => {
  if (chartData.value.length === 0) return ''
  const line = chartData.value
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.date)} ${getY(d.count)}`)
    .join(' ')
  const last = chartData.value[chartData.value.length - 1]
  const first = chartData.value[0]
  return `${line} L ${getX(last.date)} ${height - padding.bottom} L ${getX(first.date)} ${height - padding.bottom} Z`
})

function formatDate(date) {
  const d = new Date(date)
  if (chartData.value.length > 30) {
    return `${d.getMonth() + 1}/${d.getDate()}`
  }
  return `${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<style scoped>
.progress-chart {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: 16px;
  padding: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-header h3 {
  color: var(--neon-cyan);
  margin: 0;
  font-size: 1rem;
}

.chart-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--neon-cyan);
}

.chart-container {
  position: relative;
  width: 100%;
}

.chart-svg {
  display: block;
  overflow: visible;
}

.grid-line {
  stroke: var(--border-default);
  stroke-dasharray: 4 4;
}

.axis-line {
  stroke: var(--border-default);
}

.axis-label {
  fill: var(--text-dim);
  font-size: 10px;
}

.line-path {
  filter: drop-shadow(0 0 4px var(--neon-cyan));
}

.data-point {
  filter: drop-shadow(0 0 4px var(--neon-cyan));
  cursor: pointer;
  transition: r 0.2s;
}

.data-point:hover {
  r: 6;
}

.empty-state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-dim);
}
</style>
