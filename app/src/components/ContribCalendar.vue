<template>
  <div class="contrib-calendar">
    <!-- 月份标签 -->
    <div class="cal-months">
      <span v-for="m in monthLabels" :key="m.label + m.offset" class="cal-month" :style="{marginLeft: m.offset + 'px'}">{{ m.label }}</span>
    </div>
    <div class="cal-body">
      <!-- 星期标签 -->
      <div class="cal-days">
        <span></span>
        <span>Mon</span>
        <span></span>
        <span>Wed</span>
        <span></span>
        <span>Fri</span>
        <span></span>
      </div>
      <!-- 日历格子 -->
      <div class="cal-grid" ref="gridRef">
        <div v-for="(week, wi) in weeks" :key="wi" class="cal-week">
          <div
            v-for="day in week"
            :key="day.date"
            class="cal-cell"
            :style="{ background: getColor(day.count) }"
            @mouseenter="showTip($event, day)"
            @mouseleave="hideTip"
          ></div>
        </div>
      </div>
    </div>
    <!-- 图例 -->
    <div class="cal-legend">
      <span class="cal-legend-text">Less</span>
      <div class="cal-cell cal-legend-cell" v-for="i in 5" :key="i" :style="{ background: colors[i-1] }"></div>
      <span class="cal-legend-text">More</span>
    </div>
    <!-- Tooltip -->
    <div v-if="tip.show" class="cal-tooltip" :style="{ left: tip.x + 'px', top: tip.y + 'px' }">
      <strong>{{ tip.count }} commits</strong> on {{ tip.date }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getCalendarWeeks, getCommitColor, CONFIG } from '../composables/stats.js'

const props = defineProps({
  calendar: { type: Object, default: () => ({}) }
})

const gridRef = ref(null)
const tip = ref({ show: false, x: 0, y: 0, count: 0, date: '' })

const weeks = computed(() => getCalendarWeeks(props.calendar))
const colors = CONFIG.calendarColors

function getColor(count) { return getCommitColor(count) }

const monthLabels = computed(() => {
  const labels = []
  const seen = new Set()
  for (let i = 0; i < weeks.value.length; i++) {
    const week = weeks.value[i]
    const firstDay = week[0]
    if (!firstDay) continue
    const date = new Date(firstDay.date + 'T00:00:00')
    const month = date.toLocaleString('en', { month: 'short' })
    const key = date.getFullYear() + '-' + month
    if (!seen.has(key)) {
      seen.add(key)
      labels.push({ label: month, offset: i * 16 })
    }
  }
  return labels
})

function showTip(e, day) {
  const rect = e.target.getBoundingClientRect()
  const parentRect = gridRef.value?.parentElement?.getBoundingClientRect()
  tip.value = {
    show: true,
    x: rect.left - (parentRect?.left || 0) + rect.width / 2,
    y: rect.top - (parentRect?.top || 0) - 36,
    count: day.count,
    date: day.date,
  }
}
function hideTip() { tip.value.show = false }
</script>

<style scoped>
.contrib-calendar {
  position: relative;
  user-select: none;
}
/* Pixelated grid overlay */
.contrib-calendar::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(79, 142, 247, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(79, 142, 247, 0.03) 1px, transparent 1px);
  background-size: 4px 4px;
  pointer-events: none;
  z-index: 1;
  border-radius: 4px;
}
.cal-months {
  display: flex;
  margin-bottom: 4px;
  padding-left: 36px;
  position: relative;
  height: 16px;
}
.cal-month {
  font-size: 0.75rem;
  color: var(--text-dim);
  position: absolute;
}
.cal-body {
  display: flex;
  gap: 6px;
}
.cal-days {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex-shrink: 0;
}
.cal-days span {
  height: 13px;
  font-size: 0.7rem;
  color: var(--text-dim);
  display: flex;
  align-items: center;
  line-height: 1;
}
.cal-grid {
  display: flex;
  gap: 3px;
  overflow-x: auto;
  position: relative;
  z-index: 2;
}
.cal-week {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.cal-cell {
  width: 13px;
  height: 13px;
  border-radius: 2px;
  border: 1px solid rgba(255,255,255,0.05);
  cursor: pointer;
  transition: transform 0.1s;
  image-rendering: pixelated;
  position: relative;
}
/* Pixelated hover effect */
.cal-cell:hover {
  transform: scale(1.5) !important;
  border-color: var(--neon-cyan);
  box-shadow: 0 0 8px var(--glow-cyan);
  z-index: 10;
}
.cal-legend {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  justify-content: flex-end;
}
.cal-legend-text {
  font-size: 0.75rem;
  color: var(--text-dim);
}
.cal-legend-cell { cursor: default; }
.cal-legend-cell:hover { transform: none; }
.cal-tooltip {
  position: absolute;
  background: var(--bg-panel);
  border: 1px solid var(--neon-blue);
  color: var(--text-main);
  font-size: 0.8rem;
  padding: 6px 10px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 100;
  transform: translateX(-50%);
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  image-rendering: pixelated;
}
@media (max-width: 768px) {
  .cal-months { display: none; }
  .cal-days { display: none; }
  .cal-grid { overflow-x: auto; }
  .cal-cell { width: 11px; height: 11px; }
}
@media (prefers-reduced-motion: reduce) {
  .cal-cell { transition: none; }
  .cal-cell:hover { transform: scale(1.2) !important; }
}
</style>
