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
import { ref } from 'vue'
const isZh = ref(true)
const timeRange = ref('week')
const timeOptions = []
const trendData = ref([])
const pieData = ref([])
const heatmapMonths = ref([])
const heatmapData = ref([])
</script>
