<template>
  <div class="practice-page">

    <!-- Map View -->
    <div v-if="view === 'map'" class="practice-map">
      <div class="map-header container">
        <div class="header-content">
          <div class="title-row">
            <h1 class="map-title font-display">刷题闯关地图</h1>
            <div class="auth-area">
              <button v-if="!isLoggedIn" class="login-btn" @click="handleLogin">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>
                </svg>
                登录
              </button>
              <div v-else class="logged-in-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                已登录
              </div>
              <span class="sync-indicator" :class="syncStatus" :title="syncStatusTitle">
                <span v-if="syncStatus === 'syncing'" class="sync-spin">↻</span>
                <span v-else-if="syncStatus === 'success'">☁ ✓</span>
                <span v-else-if="syncStatus === 'error'">☁ ✗</span>
                <span v-else-if="isLoggedIn">☁</span>
              </span>
            </div>
          </div>
          <p class="map-subtitle">点击章节卡片进入刷题 · 共 12 个专题</p>
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-value font-mono" style="color: var(--neon-cyan)">{{ globalDone }}</span>
              <span class="stat-label">已完成</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value font-mono" style="color: var(--mc-gold)">{{ globalTotal }}</span>
              <span class="stat-label">总题数</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value font-mono">{{ globalPct }}%</span>
              <span class="stat-label">完成率</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value font-mono" style="color: var(--neon-purple)">LV.{{ level }}</span>
              <span class="stat-label">等级</span>
            </div>
          </div>
          <div class="progress-track">
            <div class="progress-bar">
              <div class="progress-fill" :style="{width: globalPct+'%'}"></div>
              <div class="progress-glow" :style="{left: globalPct+'%'}"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bubble-container container">
        <div
          v-for="(ch, i) in CHAPTERS"
          :key="ch.id"
          class="bubble-cell"
          :style="bubbleStyle(i, ch)"
          @click="openChapter(ch)"
          @mousemove="handleTilt($event, i)"
          @mouseleave="resetTilt(i)"
          :ref="el => bubbleRefs[i] = el"
        >
          <div class="bubble-glow" :style="{background: `radial-gradient(circle at 50% 50%, ${ch.color}33 0%, transparent 70%)`}"></div>
          <div class="bubble-inner">
            <div class="bubble-header">
              <span class="bubble-num font-mono">{{ String(i+1).padStart(2,'0') }}</span>
              <span class="bubble-done font-mono" :style="{color: ch.light}">{{ countDone(ch.id) }}</span>
            </div>
            <div class="bubble-title">{{ ch.short }}</div>
            <div class="bubble-progress">
              <div class="bubble-progress-bar">
                <div class="bubble-progress-fill" :style="{width: chPct(ch)+'%', background: `linear-gradient(90deg, ${ch.color}, ${ch.light})`}"></div>
              </div>
              <span class="bubble-progress-text font-mono">{{ chPct(ch) }}%</span>
            </div>
          </div>
          <div class="bubble-particles">
            <span v-for="p in 6" :key="p" class="particle" :style="particleStyle(p)"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Chapter View -->
    <div v-if="view === 'chapter'" class="chapter-view">
      <div class="chapter-sidebar">
        <button class="back-btn" @click="view='map'">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          返回地图
        </button>
        <div class="chapter-list">
          <div
            v-for="(ch, i) in CHAPTERS"
            :key="ch.id"
            class="chapter-nav-item"
            :class="{active: currentChapter && currentChapter.id === ch.id}"
            :style="currentChapter && currentChapter.id === ch.id ? {'border-color': ch.color, '--ch-color': ch.color} : {}"
            @click="openChapter(ch)"
          >
            <span class="nav-num font-mono">{{ String(i+1).padStart(2,'0') }}</span>
            <div class="nav-info">
              <span class="nav-title">{{ ch.short }}</span>
              <span class="nav-progress font-mono" :style="{color: ch.light}">
                {{ countDone(ch.id) }}/{{ totals[ch.id] || 0 }}
              </span>
            </div>
            <div class="nav-bar">
              <div class="nav-bar-fill" :style="{width: chPct(ch)+'%', background: ch.color}"></div>
            </div>
          </div>
        </div>
        <div class="sidebar-footer">
          <div class="footer-label font-mono">全站进度</div>
          <div class="footer-progress">
            <div class="footer-progress-bar">
              <div class="footer-progress-fill" :style="{width: globalPct+'%'}"></div>
            </div>
            <span class="footer-pct font-mono">{{ globalPct }}%</span>
          </div>
        </div>
      </div>

      <div class="chapter-main">
        <div v-if="mdLoading" class="md-loading">
          <div class="loading-spinner"></div>
          <span class="font-mono">LOADING...</span>
        </div>
        <div v-else-if="mdError" class="md-error font-mono">{{ mdError }}</div>
        <div v-else class="chapter-content">
          <div class="chapter-header glass-card">
            <div class="chapter-meta">
              <span class="chapter-num font-mono" :style="{color: currentChapter.light}">{{ String(CHAPTERS.findIndex(c => c.id === currentChapter.id) + 1).padStart(2,'0') }}</span>
              <h2 class="chapter-title font-display" :style="{color: currentChapter.light}">
                {{ currentChapter.title }}
              </h2>
            </div>
            <div class="chapter-stats-row">
              <div class="ch-stat">
                <span class="ch-stat-value font-mono" :style="{color: currentChapter.light}">{{ countDone(currentChapter.id) }}</span>
                <span class="ch-stat-label">已完成</span>
              </div>
              <div class="ch-stat-divider"></div>
              <div class="ch-stat">
                <span class="ch-stat-value font-mono">{{ chapterTotal }}</span>
                <span class="ch-stat-label">总题数</span>
              </div>
              <div class="ch-stat-divider"></div>
              <div class="ch-stat">
                <span class="ch-stat-value font-mono" :style="{color: currentChapter.light}">{{ chPct(currentChapter) }}%</span>
                <span class="ch-stat-label">完成率</span>
              </div>
            </div>
            <div class="chapter-progress-bar">
              <div class="chapter-progress-fill" :style="{width: chPct(currentChapter)+'%', background: `linear-gradient(90deg, ${currentChapter.color}, ${currentChapter.light})`}"></div>
            </div>
          </div>

          <div class="sections-list">
            <div
              v-for="(sec, secIdx) in sections"
              :key="sec.h2 + sec.h3"
              class="section-block glass-card"
              :style="{animationDelay: secIdx * 50 + 'ms'}"
            >
              <div v-if="sec.h2" class="sec-header" @click="toggleSection(secIdx)">
                <div class="sec-title-group">
                  <span class="sec-index font-mono">{{ secIdx + 1 }}</span>
                  <h3 class="sec-h2 font-display">{{ sec.h2 }}</h3>
                </div>
                <div class="sec-right">
                  <span class="sec-count font-mono">{{ sec.rows.length }} 题</span>
                  <svg class="sec-arrow" :class="{open: openSections[secIdx]}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>
              <div v-if="sec.h3" class="sec-h3">{{ sec.h3 }}</div>
              <div class="sec-content" :class="{collapsed: !openSections[secIdx]}">
                <div class="prob-table">
                  <div
                    v-for="row in sec.rows"
                    :key="row.probId"
                    class="prob-row"
                    :class="{done: isChecked(currentChapter.id, row.probId)}"
                    @click="toggleCheck(currentChapter.id, row.probId)"
                  >
                    <div class="problem-checkbox" :class="{checked: isChecked(currentChapter.id, row.probId)}">
                      <div v-if="isChecked(currentChapter.id, row.probId)" class="check-icon">
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                          <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    <span class="prob-num font-mono">{{ row.num }}</span>
                    <span class="prob-title">
                      <a v-if="row.url" :href="row.url" target="_blank" rel="noopener" @click.stop>{{ row.title }}</a>
                      <span v-else>{{ row.title }}</span>
                      <span v-if="row.isMember" class="lock-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </span>
                    </span>
                    <span class="prob-rating" :class="ratingCls(row.rating)">{{ row.rating }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { CHAPTERS } from '../composables/data.js'
import { useAuth } from '../composables/auth.js'
import { useProgressSync } from '../composables/progressSync.js'

const { isLoggedIn, loginWithGithub } = useAuth()
const { syncStatus, syncError, loadFromServer, saveProgress: serverSaveProgress } = useProgressSync()

const PROGRESS_KEY = 'mc-algo-progress'
const TOTALS_KEY  = '_chapterTotals'

const view = ref('map')
const currentChapter = ref(null)
const sections = ref([])
const mdLoading = ref(false)
const mdError = ref('')
const mdCache = {}
const progress = ref({})
const totals = ref({})
const bubbleRefs = reactive({})
const tiltData = reactive({})
const openSections = reactive({})

const syncStatusTitle = computed(() => {
  if (!isLoggedIn.value) return '未登录'
  switch (syncStatus.value) {
    case 'idle': return '已同步'
    case 'syncing': return '同步中...'
    case 'success': return '已同步'
    case 'error': return '同步失败: ' + syncError.value
    default: return ''
  }
})

function loadStorage() {
  try { progress.value = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}') } catch { progress.value = {} }
  try { totals.value  = JSON.parse(localStorage.getItem(TOTALS_KEY)  || '{}') } catch { totals.value = {} }
}

function saveProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress.value))
  if (isLoggedIn.value) {
    serverSaveProgress(progress.value)
  }
}

function isChecked(chId, probId) {
  return !!(progress.value[chId] && progress.value[chId][probId])
}

function toggleCheck(chId, probId) {
  if (!progress.value[chId]) progress.value[chId] = {}
  progress.value[chId][probId] = !progress.value[chId][probId]
  progress.value = { ...progress.value }
  saveProgress()
}

function toggleSection(idx) {
  openSections[idx] = !openSections[idx]
}

function countDone(chId) {
  if (!progress.value[chId]) return 0
  return Object.values(progress.value[chId]).filter(Boolean).length
}

const globalDone = computed(() => CHAPTERS.reduce((s, ch) => s + countDone(ch.id), 0))
const globalTotal = computed(() => Object.values(totals.value).reduce((a,b) => a+b, 0))
const globalPct = computed(() => globalTotal.value > 0 ? Math.round(globalDone.value / globalTotal.value * 100) : 0)
const level = computed(() => Math.max(1, Math.floor(globalDone.value / 20) + 1))

function chPct(ch) {
  const t = totals.value[ch.id] || 0
  if (!t) return 0
  return Math.round(countDone(ch.id) / t * 100)
}

const chapterTotal = computed(() => {
  if (!currentChapter.value) return 0
  return totals.value[currentChapter.value.id] || 0
})

const BUBBLE_POSITIONS = [
  { x: 8,  y: 12 }, { x: 28, y: 6  }, { x: 50, y: 11 }, { x: 70, y: 5  },
  { x: 13, y: 38 }, { x: 35, y: 32 }, { x: 58, y: 37 }, { x: 78, y: 31 },
  { x: 6,  y: 64 }, { x: 28, y: 60 }, { x: 51, y: 65 }, { x: 72, y: 57 },
]

function bubbleStyle(i, ch) {
  const pos = BUBBLE_POSITIONS[i] || { x: (i % 4) * 25, y: Math.floor(i / 4) * 30 }
  const tilt = tiltData[i] || { x: 0, y: 0 }
  return {
    left: pos.x + '%',
    top: pos.y + '%',
    '--tilt-x': tilt.x + 'deg',
    '--tilt-y': tilt.y + 'deg',
    '--ch-color': ch.color,
    '--ch-glow': ch.color + '66',
  }
}

function handleTilt(e, i) {
  const el = bubbleRefs[i]
  if (!el) return
  const rect = el.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  const tiltX = ((y - centerY) / centerY) * -8
  const tiltY = ((x - centerX) / centerX) * 8
  tiltData[i] = { x: tiltX, y: tiltY }
}

function resetTilt(i) {
  tiltData[i] = { x: 0, y: 0 }
}

function particleStyle(p) {
  const angle = (p / 6) * 360
  const delay = p * 0.15
  return {
    '--angle': angle + 'deg',
    '--delay': delay + 's',
  }
}

function ratingCls(r) {
  if (!r || r === '—') return 'r-none'
  const n = parseInt(r)
  if (n < 1600) return 'r-low'
  if (n < 2000) return 'r-med'
  return 'r-high'
}

function parseMdTables(md) {
  const secs = []
  const lines = md.split('\n')
  let curH2 = '', curH3 = '', curTable = []
  function flush() {
    if (curTable.length > 0) { secs.push({ h2: curH2, h3: curH3, rows: [...curTable] }); curTable = [] }
  }
  for (const line of lines) {
    const t = line.trim()
    if (t.startsWith('## '))        { flush(); curH2 = t.replace(/^##\s+/, ''); curH3 = '' }
    else if (t.startsWith('### '))  { flush(); curH3 = t.replace(/^###\s+/, '') }
    else if (t.startsWith('#### ')) { flush(); curH3 = t.replace(/^####\s+/, '') }
    else if (t.startsWith('|') && !t.startsWith('|---')) {
      const cells = t.split('|').map(c => c.trim()).filter(c => c)
      if (cells.length >= 2 && cells[0] !== '题号' && cells[0] !== '#') {
        const num = cells[0], titleCell = cells[1] || '', rating = cells[2] || '—'
        const lm = titleCell.match(/\[([^\]]+)\]\(([^)]+)\)/)
        let title = titleCell, url = ''
        if (lm) { title = lm[1]; url = lm[2] }
        const isMember = title.includes('🔒')
        title = title.replace('🔒', '').trim()
        const probId = String(num).replace(/[^a-zA-Z0-9]/g, '_')
        curTable.push({ num, title, url, rating, isMember, probId })
      }
    }
  }
  flush()
  // Initialize all sections as open
  secs.forEach((_, idx) => { openSections[idx] = true })
  return secs
}

async function openChapter(ch) {
  currentChapter.value = ch
  view.value = 'chapter'
  mdLoading.value = true
  mdError.value = ''
  if (mdCache[ch.id]) {
    sections.value = mdCache[ch.id]
    mdLoading.value = false
    updateTotals(ch)
    return
  }
  try {
    const r = await fetch(ch.file)
    if (!r.ok) throw new Error('404')
    const md = await r.text()
    const parsed = parseMdTables(md)
    mdCache[ch.id] = parsed
    sections.value = parsed
    updateTotals(ch)
  } catch {
    mdError.value = '章节加载失败，请检查网络'
  }
  mdLoading.value = false
}

function updateTotals(ch) {
  const t = sections.value.reduce((s, sec) => s + sec.rows.length, 0)
  totals.value[ch.id] = t
  localStorage.setItem(TOTALS_KEY, JSON.stringify(totals.value))
}

async function syncOnLoad() {
  loadStorage()
  if (!isLoggedIn.value) return
  const serverProgress = await loadFromServer()
  if (serverProgress) {
    loadStorage()
  }
}

function handleLogin() {
  loginWithGithub()
}

onMounted(() => { syncOnLoad() })
</script>

<style scoped>
.practice-page { min-height: 100vh; background: var(--bg-base); }

/* ── Map Header ── */
.map-header { padding: 48px 0 40px; }
.header-content {
  background: var(--glass-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 32px;
  box-shadow: var(--glass-shadow);
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.map-title {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.03em;
}

.auth-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-blue));
  border: none;
  border-radius: 10px;
  color: var(--bg-base);
  cursor: pointer;
  transition: all 0.3s var(--ease-out-expo);
}
.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(34, 211, 238, 0.4);
}

.logged-in-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  padding: 8px 16px;
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.3);
  border-radius: 8px;
  color: var(--neon-green);
}

.sync-indicator {
  font-size: 1rem;
  padding: 6px 10px;
  color: var(--text-dim);
}
.sync-indicator.success { color: var(--neon-cyan); }
.sync-indicator.error   { color: var(--neon-pink); }
.sync-indicator.syncing { color: var(--neon-blue); }

.sync-spin { display: inline-block; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.map-subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 24px;
}

.stats-row {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: var(--border-subtle);
}

.progress-track {
  position: relative;
}

.progress-bar {
  height: 8px;
  background: var(--bg-elevated);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--neon-blue), var(--neon-cyan));
  border-radius: 4px;
  transition: width 1s var(--ease-out-expo);
}

.progress-glow {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: var(--neon-cyan);
  border-radius: 50%;
  filter: blur(10px);
  opacity: 0.6;
  transition: left 1s var(--ease-out-expo);
}

/* ── Bubble Container ── */
.bubble-container {
  position: relative;
  height: 560px;
  margin-top: 32px;
}

.bubble-cell {
  position: absolute;
  width: 160px;
  padding: 0;
  background: var(--bg-card);
  border: 1px solid var(--ch-color, var(--border-default));
  border-radius: 16px;
  cursor: pointer;
  transition: transform 0.4s var(--ease-out-expo), box-shadow 0.4s var(--ease-out-expo), border-color 0.3s;
  transform: perspective(1000px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg));
  overflow: hidden;
}
.bubble-cell:hover {
  transform: perspective(1000px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) translateY(-8px) scale(1.02);
  box-shadow: 0 20px 60px var(--ch-glow, rgba(79, 142, 247, 0.3));
  border-color: var(--ch-color, var(--neon-blue));
  z-index: 10;
}

.bubble-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.6;
}

.bubble-inner {
  position: relative;
  z-index: 1;
  padding: 16px;
}

.bubble-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.bubble-num {
  font-size: 0.7rem;
  color: var(--text-dim);
  font-weight: 500;
}

.bubble-done {
  font-size: 0.85rem;
  font-weight: 700;
}

.bubble-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  line-height: 1.3;
}

.bubble-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bubble-progress-bar {
  flex: 1;
  height: 4px;
  background: var(--bg-elevated);
  border-radius: 2px;
  overflow: hidden;
}

.bubble-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.8s var(--ease-out-expo);
}

.bubble-progress-text {
  font-size: 0.65rem;
  color: var(--text-dim);
  min-width: 32px;
  text-align: right;
}

.bubble-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--ch-color, var(--neon-blue));
  border-radius: 50%;
  top: 50%;
  left: 50%;
  opacity: 0;
  animation: float-particle 3s ease-in-out infinite;
  animation-delay: var(--delay);
  transform: rotate(var(--angle)) translateY(0);
}

@keyframes float-particle {
  0%, 100% {
    opacity: 0;
    transform: rotate(var(--angle)) translateY(0);
  }
  50% {
    opacity: 0.6;
    transform: rotate(var(--angle)) translateY(-40px);
  }
}

/* ── Chapter View ── */
.chapter-view {
  display: flex;
  min-height: 100vh;
}

.chapter-sidebar {
  width: 280px;
  flex-shrink: 0;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 20px 24px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--neon-blue);
  cursor: pointer;
  transition: all 0.2s;
}
.back-btn:hover { color: var(--neon-cyan); }

.chapter-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.chapter-nav-item {
  padding: 12px 20px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.2s;
  margin: 4px 12px;
  border-radius: 8px;
}
.chapter-nav-item:hover { background: rgba(255, 255, 255, 0.04); }
.chapter-nav-item.active {
  background: rgba(79, 142, 247, 0.08);
  border-left-color: var(--ch-color, var(--neon-blue));
}

.nav-num {
  font-size: 0.65rem;
  color: var(--text-dim);
  display: block;
  margin-bottom: 4px;
}

.nav-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.nav-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.nav-progress {
  font-size: 0.7rem;
}

.nav-bar {
  height: 3px;
  background: var(--bg-elevated);
  border-radius: 2px;
  overflow: hidden;
}

.nav-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s var(--ease-out-expo);
}

.sidebar-footer {
  padding: 20px 24px;
  border-top: 1px solid var(--border-subtle);
}

.footer-label {
  font-size: 0.7rem;
  color: var(--text-dim);
  margin-bottom: 8px;
}

.footer-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-elevated);
  border-radius: 3px;
  overflow: hidden;
}

.footer-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--neon-blue), var(--neon-cyan));
  border-radius: 3px;
  transition: width 0.8s var(--ease-out-expo);
}

.footer-pct {
  font-size: 0.75rem;
  color: var(--neon-cyan);
  min-width: 36px;
  text-align: right;
}

/* ── Chapter Main ── */
.chapter-main {
  flex: 1;
  padding: 32px 40px 60px;
  min-width: 0;
}

.md-loading, .md-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px;
  color: var(--neon-cyan);
  font-size: 0.85rem;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-default);
  border-top-color: var(--neon-cyan);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.chapter-content { max-width: 900px; }

.chapter-header {
  padding: 28px 32px;
  margin-bottom: 28px;
}

.chapter-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.chapter-num {
  font-size: 1rem;
  font-weight: 600;
}

.chapter-title {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.chapter-stats-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
}

.ch-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ch-stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1;
}

.ch-stat-label {
  font-size: 0.7rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ch-stat-divider {
  width: 1px;
  height: 24px;
  background: var(--border-subtle);
}

.chapter-progress-bar {
  height: 6px;
  background: var(--bg-elevated);
  border-radius: 3px;
  overflow: hidden;
}

.chapter-progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s var(--ease-out-expo);
}

/* ── Sections List ── */
.sections-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-block {
  padding: 0;
  overflow: hidden;
  animation: cardIn 0.5s var(--ease-out-expo) both;
}

.sec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  cursor: pointer;
  transition: background 0.2s;
}
.sec-header:hover { background: rgba(255, 255, 255, 0.02); }

.sec-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sec-index {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border-radius: 8px;
  font-size: 0.75rem;
  color: var(--neon-blue);
}

.sec-h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.sec-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sec-count {
  font-size: 0.75rem;
  color: var(--text-dim);
}

.sec-arrow {
  color: var(--text-dim);
  transition: transform 0.3s var(--ease-out-expo);
}
.sec-arrow.open { transform: rotate(180deg); }

.sec-content {
  max-height: 2000px;
  overflow: hidden;
  transition: max-height 0.4s var(--ease-out-expo);
}
.sec-content.collapsed { max-height: 0; }

.sec-h3 {
  padding: 0 24px 12px;
  font-size: 0.9rem;
  color: var(--neon-blue);
  font-weight: 500;
}

.prob-table {
  padding: 0 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.prob-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  background: var(--bg-elevated);
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s var(--ease-out-expo);
}
.prob-row:hover {
  background: rgba(79, 142, 247, 0.06);
  border-color: var(--border-accent);
  transform: translateX(4px);
}
.prob-row.done {
  background: rgba(52, 211, 153, 0.06);
  border-color: rgba(52, 211, 153, 0.2);
}

.problem-checkbox {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  border: 2px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s var(--ease-out-expo);
  flex-shrink: 0;
}
.problem-checkbox:hover {
  border-color: var(--neon-cyan);
  box-shadow: 0 0 12px var(--glow-cyan);
}
.problem-checkbox.checked {
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-blue));
  border-color: transparent;
}

.check-icon {
  color: var(--bg-base);
  animation: checkPop 0.3s var(--ease-out-back);
}

@keyframes checkPop {
  0% { transform: scale(0); }
  70% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.prob-num {
  font-size: 0.75rem;
  color: var(--text-dim);
  min-width: 40px;
  flex-shrink: 0;
}

.prob-title {
  flex: 1;
  font-size: 0.9rem;
  color: var(--text-primary);
  min-width: 0;
}
.prob-title a { color: var(--text-primary); text-decoration: none; }
.prob-title a:hover { color: var(--neon-blue); }
.prob-row.done .prob-title { text-decoration: line-through; color: var(--text-dim); }

.lock-icon {
  margin-left: 6px;
  color: var(--text-dim);
  display: inline-flex;
}

.prob-rating {
  font-size: 0.7rem;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid;
  flex-shrink: 0;
}
.r-none { color: var(--text-dim); border-color: var(--border-subtle); background: transparent; }
.r-low  { color: var(--neon-green); border-color: var(--neon-green); background: rgba(52, 211, 153, 0.1); }
.r-med  { color: var(--mc-gold); border-color: var(--mc-gold); background: rgba(250, 204, 21, 0.1); }
.r-high { color: var(--neon-pink); border-color: var(--neon-pink); background: rgba(244, 114, 182, 0.1); }

/* ── Responsive ── */
@media (max-width: 900px) {
  .bubble-container { height: 900px; }
  .bubble-cell { width: 140px; }
  .chapter-view { flex-direction: column; }
  .chapter-sidebar { width: 100%; height: auto; position: static; border-right: none; border-bottom: 1px solid var(--glass-border); }
  .chapter-list { display: flex; flex-wrap: wrap; padding: 12px; gap: 8px; }
  .chapter-nav-item { margin: 0; flex: 1 1 calc(50% - 4px); min-width: 140px; }
  .chapter-main { padding: 24px 20px 40px; }
  .stats-row { flex-wrap: wrap; gap: 16px; }
  .stat-divider { display: none; }
}

@media (max-width: 480px) {
  .header-content { padding: 20px; }
  .bubble-container { height: 1200px; }
  .bubble-cell { width: 120px; }
  .title-row { flex-direction: column; align-items: flex-start; gap: 12px; }
  .chapter-nav-item { flex: 1 1 100%; }
}
</style>
