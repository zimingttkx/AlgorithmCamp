<template>
  <div class="stats-panel">
    <!-- Header -->
    <div class="panel-header">
      <h2 class="panel-title pixel-font">
        {{ isZh ? '刷题统计面板' : 'Practice Statistics' }}
      </h2>
      <div class="time-filter">
        <button
          v-for="opt in timeOptions"
          :key="opt.value"
          class="filter-btn"
          :class="{ active: timeRange === opt.value }"
          @click="timeRange = opt.value"
        >
          {{ isZh ? opt.label : opt.labelEn }}
        </button>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="charts-grid">
      <!-- Trend Chart (Full Width) -->
      <div class="chart-card chart-trend">
        <div class="chart-title">{{ isZh ? '总解题数趋势' : 'Total Solved Trend' }}</div>
        <canvas ref="trendCanvas" class="chart-canvas"></canvas>
        <div class="chart-empty" v-if="trendData.length === 0">
          <span class="empty-icon">📈</span>
          <span class="empty-text">{{ isZh ? '暂无趋势数据' : 'No trend data yet' }}</span>
        </div>
      </div>

      <!-- Pie Chart -->
      <div class="chart-card chart-pie">
        <div class="chart-title">{{ isZh ? '各类目占比' : 'Category Distribution' }}</div>
        <canvas ref="pieCanvas" class="chart-canvas"></canvas>
        <div class="chart-legend">
          <div v-for="(item, i) in pieData" :key="i" class="legend-item">
            <span class="legend-color" :style="{ background: item.color }"></span>
            <span class="legend-label">{{ item.label }}</span>
            <span class="legend-value">{{ item.value }}%</span>
          </div>
        </div>
      </div>

      <!-- Bar Chart -->
      <div class="chart-card chart-bar">
        <div class="chart-title">{{ isZh ? '难度分布' : 'Difficulty Distribution' }}</div>
        <canvas ref="barCanvas" class="chart-canvas"></canvas>
        <div class="chart-legend bar-legend">
          <div class="legend-item">
            <span class="legend-color easy"></span>
            <span class="legend-label">{{ isZh ? '简单' : 'Easy' }}</span>
          </div>
          <div class="legend-item">
            <span class="legend-color medium"></span>
            <span class="legend-label">{{ isZh ? '中等' : 'Medium' }}</span>
          </div>
          <div class="legend-item">
            <span class="legend-color hard"></span>
            <span class="legend-label">{{ isZh ? '困难' : 'Hard' }}</span>
          </div>
        </div>
      </div>

      <!-- Heatmap -->
      <div class="chart-card chart-heatmap">
        <div class="chart-title">{{ isZh ? '刷题热力图' : 'Practice Heatmap' }}</div>
        <div class="heatmap-container">
          <div class="heatmap-months">
            <span v-for="(month, i) in heatmapMonths" :key="i" class="month-label">{{ month }}</span>
          </div>
          <div class="heatmap-grid-wrapper">
            <div class="heatmap-days">
              <span>{{ isZh ? '日' : 'S' }}</span>
              <span>{{ isZh ? '三' : 'W' }}</span>
              <span>{{ isZh ? '五' : 'F' }}</span>
            </div>
            <div class="heatmap-grid" ref="heatmapGrid">
              <div
                v-for="(day, i) in heatmapData"
                :key="i"
                class="heatmap-cell"
                :class="'level-' + day.level"
                :title="day.date + ': ' + day.count + (isZh ? ' 题' : ' problems')"
              ></div>
          </div>
        </div>
        <div class="heatmap-scale">
          <span class="scale-label">{{ isZh ? '少' : 'Less' }}</span>
          <div class="scale-cells">
            <div class="heatmap-cell level-0"></div>
            <div class="heatmap-cell level-1"></div>
            <div class="heatmap-cell level-2"></div>
            <div class="heatmap-cell level-3"></div>
            <div class="heatmap-cell level-4"></div>
          </div>
          <span class="scale-label">{{ isZh ? '多' : 'More' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useLang } from '../composables/i18n.js'
import { CHAPTERS } from '../composables/data.js'
import { useProblemMetadata } from '../composables/useProblemMetadata.js'

const { isZh } = useLang()
const { loadAllMetadata, getProblem, getDifficultyFromRating } = useProblemMetadata()

const timeRange = ref('week') // week | month | all
const timeOptions = [
  { value: 'week', label: '周', labelEn: 'Week' },
  { value: 'month', label: '月', labelEn: 'Month' },
  { value: 'all', label: '全部', labelEn: 'All' },
]

// Refs for canvas elements
const trendCanvas = ref(null)
const pieCanvas = ref(null)
const barCanvas = ref(null)
const heatmapGrid = ref(null)

// Progress data from localStorage
const progress = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('mc-algo-progress') || '{}')
  } catch {
    return {}
  }
})

// Durations data for heatmap
const durationsData = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('mc-algo-durations') || '[]')
  } catch {
    return []
  }
})

// Calculate chapter distribution for pie chart
const pieData = computed(() => {
  const data = []
  let total = 0
  const chapterCounts = []

  for (const ch of CHAPTERS) {
    const chapterProgress = progress.value[ch.id] || {}
    const done = Object.values(chapterProgress).filter(v => {
      if (typeof v === 'object' && v !== null) return !!v.checked
      return !!v
    }).length
    chapterCounts.push({ id: ch.id, short: ch.short, done, color: ch.color })
    total += done
  }

  if (total === 0) return []

  for (const ch of chapterCounts) {
    if (ch.done > 0) {
      data.push({
        label: ch.short,
        value: Math.round((ch.done / total) * 100),
        count: ch.done,
        color: ch.color,
      })
    }
  }

  return data.sort((a, b) => b.value - a.value)
})

// Calculate difficulty distribution based on actual problem ratings
const barData = computed(() => {
  const data = { easy: 0, medium: 0, hard: 0 }

  for (const [chapterId, problems] of Object.entries(progress.value)) {
    for (const [probId, status] of Object.entries(problems)) {
      // Check if problem is solved
      const isSolved = status && typeof status === 'object' ? !!status.checked : !!status
      if (!isSolved) continue

      // Get problem metadata to find actual difficulty rating
      const prob = getProblem(chapterId, probId)
      if (prob) {
        const difficulty = getDifficultyFromRating(prob.rating)
        data[difficulty]++
      } else {
        // Fallback: if problem metadata not found, count as medium
        data.medium++
      }
    }
  }

  return data
})

// Trend data - group problems solved by date
const trendData = computed(() => {
  const dateMap = {}

  // Collect all solved dates from progress
  for (const [chapterId, problems] of Object.entries(progress.value)) {
    for (const [probId, data] of Object.entries(problems)) {
      if (data && typeof data === 'object' && data.checkedAt) {
        const date = data.checkedAt.split('T')[0]
        dateMap[date] = (dateMap[date] || 0) + 1
      }
    }
  }

  // Collect from durations data
  for (const entry of durationsData.value) {
    if (entry.date) {
      const date = entry.date.split('T')[0]
      dateMap[date] = (dateMap[date] || 0) + 1
    }
  }

  // Convert to array and sort by date
  const data = Object.entries(dateMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  // Calculate cumulative sum
  let cumulative = 0
  return data.map(d => {
    cumulative += d.count
    return { date: d.date, count: cumulative }
  })
})

// Heatmap data - last 6 months
const heatmapData = computed(() => {
  const data = []
  const today = new Date()
  const counts = {}

  // Collect all solved dates
  for (const [chapterId, problems] of Object.entries(progress.value)) {
    for (const [probId, pdata] of Object.entries(problems)) {
      if (pdata && typeof pdata === 'object' && pdata.checkedAt) {
        const date = pdata.checkedAt.split('T')[0]
        counts[date] = (counts[date] || 0) + 1
      }
    }
  }

  for (const entry of durationsData.value) {
    if (entry.date) {
      const date = entry.date.split('T')[0]
      counts[date] = (counts[date] || 0) + 1
    }
  }

  // Generate last 6 months of data (approx 180 days)
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 180)

  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    const count = counts[dateStr] || 0

    // Determine level 0-4
    let level = 0
    if (count > 0) {
      if (count <= 1) level = 1
      else if (count <= 3) level = 2
      else if (count <= 5) level = 3
      else level = 4
    }

    data.push({ date: dateStr, count, level })
  }

  return data
})

// Month labels for heatmap
const heatmapMonths = computed(() => {
  const months = []
  const today = new Date()
  const seen = new Set()

  for (let i = 5; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i * 30)
    const month = d.toLocaleDateString(isZh.value ? 'zh-CN' : 'en-US', { month: 'short' })
    if (!seen.has(month)) {
      months.push(month)
      seen.add(month)
    }
  }

  return months
})

// Draw trend chart
function drawTrendChart() {
  const canvas = trendCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const rect = canvas.parentElement.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = 200

  const data = trendData.value
  if (data.length === 0) return

  // Filter data based on time range
  let filteredData = data
  if (timeRange.value === 'week') {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    filteredData = data.filter(d => new Date(d.date) >= weekAgo)
  } else if (timeRange.value === 'month') {
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)
    filteredData = data.filter(d => new Date(d.date) >= monthAgo)
  }

  if (filteredData.length === 0) return

  const padding = 40
  const width = canvas.width - padding * 2
  const height = canvas.height - padding * 2
  const maxCount = Math.max(...filteredData.map(d => d.count), 1)

  // Draw grid
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)'
  ctx.lineWidth = 1
  for (let i = 0; i <= 4; i++) {
    const y = padding + (height / 4) * i
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(canvas.width - padding, y)
    ctx.stroke()
  }

  // Draw gradient fill
  const gradient = ctx.createLinearGradient(0, padding, 0, canvas.height - padding)
  gradient.addColorStop(0, 'rgba(0, 240, 255, 0.3)')
  gradient.addColorStop(1, 'rgba(0, 240, 255, 0)')

  ctx.beginPath()
  ctx.moveTo(padding, canvas.height - padding)

  filteredData.forEach((d, i) => {
    const x = padding + (i / (filteredData.length - 1 || 1)) * width
    const y = canvas.height - padding - (d.count / maxCount) * height
    if (i === 0) ctx.lineTo(x, y)
    else ctx.lineTo(x, y)
  })

  ctx.lineTo(padding + width, canvas.height - padding)
  ctx.closePath()
  ctx.fillStyle = gradient
  ctx.fill()

  // Draw line
  ctx.beginPath()
  filteredData.forEach((d, i) => {
    const x = padding + (i / (filteredData.length - 1 || 1)) * width
    const y = canvas.height - padding - (d.count / maxCount) * height
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.strokeStyle = '#00f0ff'
  ctx.lineWidth = 2
  ctx.stroke()

  // Draw dots
  filteredData.forEach((d, i) => {
    const x = padding + (i / (filteredData.length - 1 || 1)) * width
    const y = canvas.height - padding - (d.count / maxCount) * height
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#00f0ff'
    ctx.fill()
    ctx.strokeStyle = '#0a0e1a'
    ctx.lineWidth = 2
    ctx.stroke()
  })

  // Draw labels
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.font = '10px "Ubuntu Mono", monospace'
  ctx.textAlign = 'center'

  // Show first, middle, last date
  const labelIndices = [0, Math.floor(filteredData.length / 2), filteredData.length - 1]
  labelIndices.forEach(i => {
    if (filteredData[i]) {
      const x = padding + (i / (filteredData.length - 1 || 1)) * width
      const date = new Date(filteredData[i].date)
      const label = date.toLocaleDateString(isZh.value ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })
      ctx.fillText(label, x, canvas.height - 10)
    }
  })

  // Y-axis labels
  ctx.textAlign = 'right'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  for (let i = 0; i <= 4; i++) {
    const val = Math.round((maxCount / 4) * (4 - i))
    const y = padding + (height / 4) * i + 4
    ctx.fillText(val.toString(), padding - 8, y)
  }
}

// Draw pie chart
function drawPieChart() {
  const canvas = pieCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const rect = canvas.parentElement.getBoundingClientRect()
  const size = Math.min(rect.width, 200)
  canvas.width = size
  canvas.height = size

  const data = pieData.value
  if (data.length === 0) return

  const centerX = size / 2
  const centerY = size / 2
  const radius = size / 2 - 10

  let startAngle = -Math.PI / 2

  data.forEach(item => {
    const sliceAngle = (item.value / 100) * Math.PI * 2

    // Draw slice
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
    ctx.closePath()
    ctx.fillStyle = item.color
    ctx.fill()

    // Draw border
    ctx.strokeStyle = '#0a0e1a'
    ctx.lineWidth = 2
    ctx.stroke()

    startAngle += sliceAngle
  })

  // Draw center hole (donut style)
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(10, 14, 26, 0.95)'
  ctx.fill()
}

// Draw bar chart
function drawBarChart() {
  const canvas = barCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const rect = canvas.parentElement.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = 200

  const data = barData.value
  const total = data.easy + data.medium + data.hard
  if (total === 0) return

  const padding = 40
  const width = canvas.width - padding * 2
  const height = canvas.height - padding * 2
  const maxVal = Math.max(data.easy, data.medium, data.hard, 1)

  const barWidth = width / 3 - 20
  const colors = {
    easy: '#4ade80',
    medium: '#fbbf24',
    hard: '#f87171'
  }

  // Draw bars
  const bars = [
    { key: 'easy', label: isZh.value ? '简单' : 'Easy' },
    { key: 'medium', label: isZh.value ? '中等' : 'Medium' },
    { key: 'hard', label: isZh.value ? '困难' : 'Hard' }
  ]

  bars.forEach((bar, i) => {
    const x = padding + i * (barWidth + 20) + barWidth / 2
    const barHeight = (data[bar.key] / maxVal) * height
    const y = canvas.height - padding - barHeight

    // Draw bar
    const gradient = ctx.createLinearGradient(x, y, x, canvas.height - padding)
    gradient.addColorStop(0, colors[bar.key])
    gradient.addColorStop(1, colors[bar.key] + '80')

    ctx.beginPath()
    ctx.roundRect(x - barWidth / 2, y, barWidth, barHeight, [4, 4, 0, 0])
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw value on top
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 12px "Ubuntu Mono", monospace'
    ctx.textAlign = 'center'
    ctx.fillText(data[bar.key].toString(), x, y - 8)

    // Draw label below
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.font = '10px "Ubuntu Mono", monospace'
    ctx.fillText(bar.label, x, canvas.height - padding + 16)
  })

  // Draw background grid
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)'
  ctx.lineWidth = 1
  for (let i = 0; i <= 4; i++) {
    const y = padding + (height / 4) * i
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(canvas.width - padding, y)
    ctx.stroke()
  }
}

// Draw all charts
function drawCharts() {
  nextTick(() => {
    drawTrendChart()
    drawPieChart()
    drawBarChart()
  })
}

// Watch for changes
watch([timeRange, progress, durationsData, metadataCache], () => {
  drawCharts()
}, { deep: true })

onMounted(async () => {
  // Load problem metadata first for accurate difficulty data
  await loadAllMetadata()
  drawCharts()
  window.addEventListener('resize', drawCharts)
})
</script>

<style scoped>
.stats-panel {
  padding: 20px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.panel-title {
  font-size: 1.3rem;
  color: var(--neon-cyan);
  text-shadow: 0 0 10px var(--glow-primary);
  margin: 0;
}

.time-filter {
  display: flex;
  gap: 8px;
}

.filter-btn {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  padding: 6px 14px;
  background: transparent;
  color: var(--text-dim);
  border: 1px solid rgba(0, 240, 255, 0.3);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: rgba(0, 240, 255, 0.1);
  color: var(--neon-cyan);
}

.filter-btn.active {
  background: rgba(0, 240, 255, 0.2);
  color: var(--neon-cyan);
  border-color: var(--neon-cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-card {
  background: rgba(10, 14, 26, 0.8);
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 12px;
  padding: 16px;
  position: relative;
}

.chart-trend {
  grid-column: 1 / -1;
}

.chart-title {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.chart-canvas {
  display: block;
  width: 100%;
}

.chart-empty {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-dim);
}

.empty-icon {
  font-size: 2rem;
  opacity: 0.5;
}

.empty-text {
  font-size: 0.8rem;
}

/* Pie Chart Legend */
.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.legend-color {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.legend-color.easy {
  background: #4ade80;
}

.legend-color.medium {
  background: #fbbf24;
}

.legend-color.hard {
  background: #f87171;
}

.legend-value {
  color: var(--text-dim);
  font-family: 'Ubuntu Mono', monospace;
}

.bar-legend {
  justify-content: center;
}

/* Heatmap */
.heatmap-container {
  display: flex;
  gap: 4px;
}

.heatmap-months {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 20px;
  font-size: 0.65rem;
  color: var(--text-dim);
  min-width: 24px;
}

.heatmap-grid-wrapper {
  flex: 1;
  display: flex;
  gap: 4px;
}

.heatmap-days {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 0.65rem;
  color: var(--text-dim);
  padding-right: 4px;
}

.heatmap-days span {
  height: 12px;
  line-height: 12px;
}

.heatmap-grid {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
  width: 100%;
}

.heatmap-cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: var(--bg-panel);
  transition: transform 0.1s ease;
}

.heatmap-cell:hover {
  transform: scale(1.3);
}

.heatmap-cell.level-0 {
  background: var(--bg-panel);
}

.heatmap-cell.level-1 {
  background: rgba(0, 240, 255, 0.25);
}

.heatmap-cell.level-2 {
  background: rgba(0, 240, 255, 0.5);
}

.heatmap-cell.level-3 {
  background: rgba(0, 240, 255, 0.75);
}

.heatmap-cell.level-4 {
  background: rgba(0, 240, 255, 1);
  box-shadow: 0 0 6px rgba(0, 240, 255, 0.5);
}

.heatmap-scale {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 8px;
  font-size: 0.65rem;
  color: var(--text-dim);
}

.scale-cells {
  display: flex;
  gap: 2px;
}

.scale-label {
  color: var(--text-dim);
}

/* Responsive */
@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-trend {
    grid-column: 1;
  }
}
</style>
