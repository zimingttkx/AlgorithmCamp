<template>
  <div class="practice-page">

    <!-- Celebration Overlay -->
    <div v-if="showCelebration" class="celebration-overlay">
      <div
        v-for="p in celebrationParticles"
        :key="p.id"
        class="celebration-pixel"
        :class="[p.type, { animate: p.animate }]"
        :style="{
          left: p.x + '%',
          top: p.y + '%',
          background: p.color,
          animationDelay: p.delay + 's'
        }"
      ></div>
    </div>

    <!-- Chapter Complete Banner -->
    <div v-if="showChapterBanner" class="chapter-complete-banner" :class="{ show: showChapterBanner }">
      <h2>Chapter Complete!</h2>
      <p>{{ currentChapter?.title || 'All problems solved!' }}</p>
      <div class="celebration-stars">
        <span class="star" style="color: var(--mc-gold)">&#9733;</span>
        <span class="star" style="color: var(--neon-primary)">&#9733;</span>
        <span class="star" style="color: var(--mc-gold)">&#9733;</span>
      </div>
    </div>

    <!-- Pixel Hearts -->
    <div v-if="showHearts" class="pixel-hearts-container">
      <span
        v-for="h in heartParticles"
        :key="h.id"
        class="pixel-heart-float"
        :class="{ animate: h.animate }"
        :style="{ left: h.x + '%', bottom: '0', animationDelay: h.delay + 's' }"
      >&#10084;</span>
    </div>

    <!-- Confetti -->
    <div v-if="showConfetti" class="confetti-container">
      <div
        v-for="c in confettiPieces"
        :key="c.id"
        class="confetti-piece"
        :class="{ animate: c.animate }"
        :style="{
          left: c.x + '%',
          background: c.color,
          width: c.size + 'px',
          height: c.size + 'px',
          animationDelay: c.delay + 's',
          animationDuration: c.duration + 's'
        }"
      ></div>
    </div>

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
            <!-- LeetCode Sync -->
            <div class="leetcode-sync-area">
              <div v-if="!leetcodeUsername" class="leetcode-bind">
                <input
                  v-model="leetcodeInput"
                  type="text"
                  placeholder="LeetCode用户名"
                  class="leetcode-input"
                  @keyup.enter="handleLeetCodeBind"
                />
                <button class="leetcode-btn" @click="handleLeetCodeBind" :disabled="!leetcodeInput.trim()">
                  ⚔ 绑定
                </button>
              </div>
              <div v-else class="leetcode-bound">
                <span class="leetcode-icon">⚔</span>
                <span class="leetcode-name">{{ leetcodeUsername }}</span>
                <button class="leetcode-sync-btn" :class="leetcodeSyncStatus" @click="handleLeetCodeSync" :title="leetcodeSyncStatusTitle">
                  <span v-if="leetcodeSyncStatus === 'syncing'" class="sync-spin">↻</span>
                  <span v-else-if="leetcodeSyncStatus === 'synced'">✓</span>
                  <span v-else-if="leetcodeSyncStatus === 'error'">✗</span>
                  <span v-else-if="leetcodeSyncStatus === 'pending'">●</span>
                  <span v-else>↻</span>
                </button>
                <button class="leetcode-unbind-btn" @click="handleLeetCodeUnbind" title="解除绑定">×</button>
              </div>
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
            <div class="pixel-progress-advanced">
              <div class="progress-fill" :style="{width: globalPct+'%', background: `linear-gradient(90deg, var(--neon-primary), var(--neon-secondary), var(--neon-accent))`}"></div>
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
              <div class="bubble-progress-advanced">
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
            class="chapter-nav-item chapter-nav-item-enhanced"
            :class="{active: currentChapter && currentChapter.id === ch.id}"
            :style="currentChapter && currentChapter.id === ch.id ? {'border-color': ch.color, '--ch-color': ch.color} : {'--ch-color': ch.color}"
            @click="openChapter(ch)"
          >
            <span class="nav-num font-mono">{{ String(i+1).padStart(2,'0') }}</span>
            <div class="nav-info">
              <span class="nav-title">{{ ch.short }}</span>
              <span class="nav-progress font-mono" :style="{color: ch.light}">
                {{ countDone(ch.id) }}/{{ totals[ch.id] || 0 }}
              </span>
            </div>
            <div class="nav-bar-enhanced">
              <div class="nav-bar-fill" :style="{width: chPct(ch)+'%', background: ch.color}"></div>
            </div>
          </div>
        </div>
        <div class="sidebar-footer">
          <div class="footer-label font-mono">全站进度</div>
          <div class="footer-progress">
            <div class="pixel-progress-advanced" style="height: 8px;">
              <div class="progress-fill" :style="{width: globalPct+'%', background: `linear-gradient(90deg, var(--neon-primary), var(--neon-secondary))`}"></div>
              <div class="progress-glow" :style="{left: globalPct+'%'}"></div>
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
            <div class="chapter-progress-bar-advanced">
              <div class="chapter-progress-fill chapter-progress-fill-rainbow" :style="{width: chPct(currentChapter)+'%', background: `linear-gradient(90deg, ${currentChapter.color}, ${currentChapter.light})`}"></div>
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
                    class="prob-row prob-row-3d-lift"
                    :class="{done: isChecked(currentChapter.id, row.probId)}"
                    @click="handleProblemClick(currentChapter.id, row.probId, row)"
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
import { useLeetCodeSync } from '../composables/leetCodeSync.js'

const { isLoggedIn, loginWithGithub } = useAuth()
const { syncStatus, syncError, loadFromServer, saveProgress: serverSaveProgress } = useProgressSync()
const {
  leetcodeUsername,
  syncStatus: leetcodeSyncStatus,
  syncError: leetcodeSyncError,
  bindUsername,
  unbindUsername,
  syncLeetCodeToProgress,
  syncStatusTitle: leetcodeSyncStatusTitle,
  leetcodeSolvedCount,
  localMatchedCount,
} = useLeetCodeSync()

const PROGRESS_KEY = 'mc-algo-progress'
const TOTALS_KEY  = '_chapterTotals'

// Celebration state
const showCelebration = ref(false)
const showChapterBanner = ref(false)
const showHearts = ref(false)
const showConfetti = ref(false)
const celebrationParticles = ref([])
const heartParticles = ref([])
const confettiPieces = ref([])
let celebrationTimeout = null

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

// LeetCode sync state
const leetcodeInput = ref('')

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

// LeetCode sync handlers
function handleLeetCodeBind() {
  const username = leetcodeInput.value.trim()
  if (!username) return
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    alert('用户名格式不正确，只能包含字母、数字、下划线和连字符')
    return
  }
  bindUsername(username)
  leetcodeInput.value = ''
}

function handleLeetCodeUnbind() {
  unbindUsername()
}

async function handleLeetCodeSync() {
  if (!leetcodeUsername.value) return
  // Pre-load all chapters before sync if not already loaded
  await Promise.all(CHAPTERS.map(ch => {
    if (!mdCache[ch.id]) {
      return fetch(ch.file).then(r => r.text()).then(md => {
        mdCache[ch.id] = parseMdTables(md)
      })
    }
    return Promise.resolve()
  }))
  await syncLeetCodeToProgress(mdCache)
  // Reload progress to reflect changes
  loadStorage()
}

function triggerCelebration() {
  // Clear any existing timeout
  if (celebrationTimeout) {
    clearTimeout(celebrationTimeout)
  }

  // Generate pixel celebration particles
  const colors = ['var(--neon-primary)', 'var(--neon-secondary)', 'var(--neon-accent)', 'var(--mc-gold)']
  celebrationParticles.value = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: 50 + Math.random() * 30,
    color: colors[Math.floor(Math.random() * colors.length)],
    type: ['celebration-pixel', 'celebration-pixel-heart', 'celebration-pixel-star'][Math.floor(Math.random() * 3)],
    delay: Math.random() * 0.5,
    animate: false
  }))

  // Generate confetti
  confettiPieces.value = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 8 + Math.random() * 8,
    delay: Math.random() * 1,
    duration: 2 + Math.random() * 2,
    animate: false
  }))

  // Generate floating hearts
  heartParticles.value = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    delay: Math.random() * 0.8,
    animate: false
  }))

  // Trigger animations
  showCelebration.value = true
  showConfetti.value = true
  showHearts.value = true

  // Start animations
  setTimeout(() => {
    celebrationParticles.value = celebrationParticles.value.map(p => ({ ...p, animate: true }))
    confettiPieces.value = confettiPieces.value.map(c => ({ ...c, animate: true }))
    heartParticles.value = heartParticles.value.map(h => ({ ...h, animate: true }))
  }, 50)

  // Show chapter complete banner if applicable
  setTimeout(() => {
    showChapterBanner.value = true
  }, 300)

  // Cleanup
  celebrationTimeout = setTimeout(() => {
    showCelebration.value = false
    showChapterBanner.value = false
    showHearts.value = false
    showConfetti.value = false
    celebrationParticles.value = []
    confettiPieces.value = []
    heartParticles.value = []
  }, 4000)
}

function handleProblemClick(chId, probId, row) {
  // If not checked, this is a new completion
  if (!isChecked(chId, probId)) {
    // Toggle check
    toggleCheck(chId, probId)
    // Check if chapter is now complete
    checkChapterCompletion(chId)
  } else {
    // Just toggle off
    toggleCheck(chId, probId)
  }
}

function checkChapterCompletion(chId) {
  const total = totals.value[chId] || 0
  const done = countDone(chId)
  if (total > 0 && done === total) {
    // Chapter complete!
    triggerCelebration()
  }
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

/* LeetCode Sync Styles */
.leetcode-sync-area {
  display: flex;
  align-items: center;
  margin-left: 12px;
  padding-left: 12px;
  border-left: 1px solid var(--glass-border);
}

.leetcode-bind {
  display: flex;
  align-items: center;
  gap: 8px;
}

.leetcode-input {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  padding: 6px 10px;
  color: var(--text-primary);
  font-size: 0.85rem;
  width: 140px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.leetcode-input:focus {
  border-color: var(--neon-primary);
  box-shadow: 0 0 8px var(--glow-primary-soft);
}

.leetcode-input::placeholder {
  color: var(--text-dim);
}

.leetcode-btn {
  background: var(--neon-primary);
  color: #000;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.leetcode-btn:hover:not(:disabled) {
  box-shadow: 0 0 12px var(--glow-primary);
  transform: translateY(-1px);
}

.leetcode-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.leetcode-bound {
  display: flex;
  align-items: center;
  gap: 8px;
}

.leetcode-icon {
  font-size: 1rem;
}

.leetcode-name {
  font-size: 0.85rem;
  color: var(--neon-cyan);
  font-family: 'JetBrains Mono', monospace;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.leetcode-sync-btn {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  padding: 6px 10px;
  color: var(--text-dim);
  cursor: pointer;
  transition: all 0.2s;
  min-width: 32px;
  text-align: center;
}

.leetcode-sync-btn:hover {
  border-color: var(--neon-cyan);
  color: var(--neon-cyan);
}

.leetcode-sync-btn.syncing {
  color: var(--neon-blue);
  border-color: var(--neon-blue);
}

.leetcode-sync-btn.synced {
  color: var(--neon-cyan);
  border-color: var(--neon-cyan);
}

.leetcode-sync-btn.error {
  color: var(--neon-pink);
  border-color: var(--neon-pink);
}

.leetcode-sync-btn.pending {
  color: var(--mc-gold);
  border-color: var(--mc-gold);
}

.leetcode-unbind-btn {
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  padding: 4px 8px;
  font-size: 1rem;
  transition: color 0.2s;
}

.leetcode-unbind-btn:hover {
  color: var(--neon-pink);
}

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
/* ── Advanced Progress Bar Animations ── */
.pixel-progress-advanced {
  position: relative;
  height: 10px;
  background: var(--bg-elevated);
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
}
.pixel-progress-advanced::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    transparent 0px,
    transparent 8px,
    rgba(0, 0, 0, 0.15) 8px,
    rgba(0, 0, 0, 0.15) 10px
  );
  pointer-events: none;
  z-index: 2;
}
.pixel-progress-advanced .progress-fill {
  height: 100%;
  background: var(--rainbow-gradient);
  background-size: 400% 100%;
  animation: rainbowFlow 3s linear infinite;
  border-radius: 4px;
  position: relative;
  transition: width 0.8s var(--ease-out-expo);
}
.pixel-progress-advanced .progress-fill::after {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
  animation: shimmer 1.5s infinite;
}
.pixel-progress-advanced .progress-glow {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: var(--neon-primary);
  border-radius: 50%;
  filter: blur(8px);
  opacity: 0.8;
  transition: left 0.8s var(--ease-out-expo);
  box-shadow: 0 0 10px var(--glow-primary), 0 0 20px var(--glow-primary);
}
.pixel-progress-advanced .progress-glow-secondary {
  background: var(--neon-secondary);
  box-shadow: 0 0 10px var(--glow-secondary), 0 0 20px var(--glow-secondary);
}
.pixel-progress-advanced .progress-glow-accent {
  background: var(--neon-accent);
  box-shadow: 0 0 10px var(--glow-accent), 0 0 20px var(--glow-accent);
}

/* Pixel-style segmented progress */
.pixel-progress-segmented {
  position: relative;
  height: 12px;
  background: var(--bg-elevated);
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  gap: 3px;
  padding: 2px;
  border: 1px solid var(--border-subtle);
}
.pixel-progress-segmented .segment {
  flex: 1;
  height: 100%;
  background: var(--bg-dark);
  border-radius: 3px;
  transition: all 0.3s var(--ease-out-expo);
  position: relative;
  overflow: hidden;
}
.pixel-progress-segmented .segment.filled {
  background: var(--neon-primary);
  box-shadow: 0 0 8px var(--glow-primary);
  animation: segmentPulse 2s ease-in-out infinite;
}
.pixel-progress-segmented .segment.filled-secondary {
  background: var(--neon-secondary);
  box-shadow: 0 0 8px var(--glow-secondary);
}
.pixel-progress-segmented .segment.filled-accent {
  background: var(--neon-accent);
  box-shadow: 0 0 8px var(--glow-accent);
}
.pixel-progress-segmented .segment.filling {
  animation: segmentFill 0.5s var(--ease-out-expo) forwards;
}

@keyframes segmentPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
@keyframes segmentFill {
  0% { transform: scaleX(0); transform-origin: left; }
  100% { transform: scaleX(1); transform-origin: left; }
}

/* Chapter Progress Bar with rainbow */
.chapter-progress-bar-advanced {
  height: 8px;
  background: var(--bg-elevated);
  border-radius: 4px;
  overflow: visible;
  position: relative;
  border: 1px solid var(--border-subtle);
}
.chapter-progress-bar-advanced::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    transparent 0px,
    transparent 6px,
    rgba(0, 0, 0, 0.1) 6px,
    rgba(0, 0, 0, 0.1) 8px
  );
  border-radius: 4px;
}
.chapter-progress-bar-advanced .chapter-progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s var(--ease-out-expo);
  position: relative;
  overflow: hidden;
}
.chapter-progress-bar-advanced .chapter-progress-fill::after {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: shimmer 2s infinite;
}
.chapter-progress-bar-advanced .chapter-progress-fill-rainbow {
  background: var(--rainbow-gradient) !important;
  background-size: 400% 100%;
  animation: rainbowFlow 3s linear infinite;
  box-shadow: 0 0 10px var(--glow-primary);
}

/* Bubble progress with advanced animation */
.bubble-progress-advanced {
  position: relative;
  height: 6px;
  background: var(--bg-elevated);
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.05);
}
.bubble-progress-advanced::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    transparent 0px,
    transparent 4px,
    rgba(0, 0, 0, 0.12) 4px,
    rgba(0, 0, 0, 0.12) 6px
  );
}
.bubble-progress-advanced .bubble-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.8s var(--ease-out-expo);
  position: relative;
}
.bubble-progress-advanced .bubble-progress-fill::after {
  content: '';
  position: absolute;
  top: 0; right: 0;
  width: 6px;
  height: 100%;
  background: white;
  border-radius: 2px;
  opacity: 0.6;
  filter: blur(2px);
  animation: progressGlow 1s ease-in-out infinite alternate;
}
@keyframes progressGlow {
  0% { opacity: 0.4; }
  100% { opacity: 0.8; }
}

/* ── 3D Flip Card Effect for Problem Cards ── */
.prob-row-flip {
  perspective: 1000px;
  cursor: pointer;
}
.prob-card-3d {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s var(--ease-out-expo);
}
.prob-card-3d.flipped {
  transform: rotateY(180deg);
}
.prob-card-front,
.prob-card-back {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.prob-card-back {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  transform: rotateY(180deg);
  background: var(--bg-card);
  border: 1px solid var(--neon-primary);
  border-radius: 10px;
  padding: 16px;
  box-shadow: var(--shadow-neon-primary);
}
.prob-card-back-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.prob-card-back-title {
  font-size: 0.85rem;
  color: var(--neon-primary);
  font-weight: 600;
}
.prob-card-back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--neon-cyan);
  text-decoration: none;
  font-size: 0.8rem;
  padding: 6px 12px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid var(--neon-cyan);
  border-radius: 6px;
  transition: all 0.2s var(--ease-out-expo);
}
.prob-card-back-link:hover {
  background: var(--neon-cyan);
  color: var(--bg-base);
  box-shadow: 0 0 15px var(--glow-primary);
}
.prob-card-back-hint {
  font-size: 0.7rem;
  color: var(--text-dim);
  font-family: 'JetBrains Mono', monospace;
}

/* 3D Hover lift for prob rows */
.prob-row-3d-lift {
  transition: all 0.3s var(--ease-out-expo);
  transform-style: preserve-3d;
}
.prob-row-3d-lift:hover {
  transform: translateY(-4px) translateZ(20px);
  box-shadow: 0 20px 40px rgba(0, 240, 255, 0.15);
  border-color: var(--neon-primary);
}

/* ── Pixelated Celebration Animation ── */
.celebration-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}
.celebration-pixel {
  position: absolute;
  width: 8px;
  height: 8px;
  opacity: 0;
}
.celebration-pixel.animate {
  animation: pixelCelebrate 1.5s var(--ease-out-expo) forwards;
}
@keyframes pixelCelebrate {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: translateY(-100px) scale(1.5) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: translateY(-200px) scale(0.5) rotate(360deg);
  }
}
.celebration-pixel-heart {
  animation: pixelHeartBurst 1.2s var(--ease-out-expo) forwards;
}
@keyframes pixelHeartBurst {
  0% {
    opacity: 1;
    transform: scale(0) rotate(0deg);
  }
  30% {
    opacity: 1;
    transform: scale(1.5) rotate(-10deg);
  }
  100% {
    opacity: 0;
    transform: scale(0.5) translateY(-150px) rotate(20deg);
  }
}
.celebration-pixel-star {
  animation: pixelStarBurst 1s var(--ease-out-expo) forwards;
}
@keyframes pixelStarBurst {
  0% {
    opacity: 1;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: scale(0.3) translateY(-120px) rotate(360deg);
  }
}

/* Confetti particles */
.confetti-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9998;
  overflow: hidden;
}
.confetti-piece {
  position: absolute;
  width: 10px;
  height: 10px;
  opacity: 0;
}
.confetti-piece.animate {
  animation: confettiFall 3s var(--ease-out-expo) forwards;
}
@keyframes confettiFall {
  0% {
    opacity: 1;
    transform: translateY(-20px) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(100vh) rotate(720deg);
  }
}

/* Chapter completion celebration */
.chapter-complete-banner {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  background: var(--glass-bg);
  backdrop-filter: blur(24px);
  border: 2px solid var(--neon-primary);
  border-radius: 20px;
  padding: 32px 48px;
  text-align: center;
  z-index: 10000;
  box-shadow: var(--shadow-neon-primary), 0 0 60px var(--glow-primary-soft);
  opacity: 0;
  transition: all 0.5s var(--ease-out-expo);
}
.chapter-complete-banner.show {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}
.chapter-complete-banner h2 {
  font-family: 'Clash Display', sans-serif;
  font-size: 2rem;
  color: var(--neon-primary);
  text-shadow: 0 0 20px var(--glow-primary);
  margin-bottom: 8px;
  animation: celebrateTitle 0.5s var(--ease-out-expo);
}
.chapter-complete-banner p {
  color: var(--text-secondary);
  font-size: 1rem;
  margin-bottom: 16px;
}
.chapter-complete-banner .celebration-stars {
  display: flex;
  justify-content: center;
  gap: 12px;
}
.chapter-complete-banner .star {
  font-size: 2rem;
  animation: starPop 0.5s var(--ease-out-back) both;
}
.chapter-complete-banner .star:nth-child(1) { animation-delay: 0.1s; }
.chapter-complete-banner .star:nth-child(2) { animation-delay: 0.2s; }
.chapter-complete-banner .star:nth-child(3) { animation-delay: 0.3s; }
@keyframes celebrateTitle {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes starPop {
  0% { transform: scale(0) rotate(-180deg); }
  100% { transform: scale(1) rotate(0deg); }
}

/* Pixel hearts floating animation */
.pixel-hearts-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9997;
}
.pixel-heart-float {
  position: absolute;
  font-size: 20px;
  opacity: 0;
}
.pixel-heart-float.animate {
  animation: pixelHeartFloat 2s var(--ease-out-expo) forwards;
}
@keyframes pixelHeartFloat {
  0% {
    opacity: 1;
    transform: translateY(0) scale(0.5);
  }
  50% {
    opacity: 1;
    transform: translateY(-50vh) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-100vh) scale(0.3);
  }
}

/* ── Enhanced Chapter Navigation Visual Effects ── */
.chapter-nav-item-enhanced {
  padding: 14px 20px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.3s var(--ease-out-expo);
  margin: 4px 12px;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}
.chapter-nav-item-enhanced::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, var(--ch-color, var(--neon-primary)) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s var(--ease-out-expo);
  border-radius: 10px;
}
.chapter-nav-item-enhanced:hover::before {
  opacity: 0.08;
}
.chapter-nav-item-enhanced:hover {
  transform: translateX(4px) translateZ(10px);
  border-left-color: var(--ch-color, var(--neon-primary));
  box-shadow: 0 4px 20px rgba(0, 240, 255, 0.1);
}
.chapter-nav-item-enhanced.active {
  background: rgba(0, 240, 255, 0.08);
  border-left: 3px solid var(--ch-color, var(--neon-primary));
  box-shadow: inset 0 0 20px rgba(0, 240, 255, 0.05);
}
.chapter-nav-item-enhanced.active::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: var(--ch-color, var(--neon-primary));
  border-radius: 50%;
  box-shadow: 0 0 10px var(--ch-color, var(--neon-primary));
  animation: navPulse 2s ease-in-out infinite;
}
@keyframes navPulse {
  0%, 100% { opacity: 1; transform: translateY(-50%) scale(1); }
  50% { opacity: 0.6; transform: translateY(-50%) scale(0.8); }
}

/* Enhanced nav bar with glow */
.nav-bar-enhanced {
  height: 4px;
  background: var(--bg-elevated);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}
.nav-bar-enhanced::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    transparent 0px,
    transparent 3px,
    rgba(0, 0, 0, 0.15) 3px,
    rgba(0, 0, 0, 0.15) 4px
  );
}
.nav-bar-enhanced .nav-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s var(--ease-out-expo);
  position: relative;
  overflow: hidden;
}
.nav-bar-enhanced .nav-bar-fill::after {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: shimmer 2s infinite;
}

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

/* ── Reduced Motion ── */
@media (prefers-reduced-motion: reduce) {
  .pixel-progress-advanced .progress-fill,
  .pixel-progress-advanced .progress-fill::after,
  .chapter-progress-bar-advanced .chapter-progress-fill,
  .chapter-progress-bar-advanced .chapter-progress-fill::after,
  .celebration-pixel,
  .celebration-pixel-heart,
  .celebration-pixel-star,
  .confetti-piece,
  .pixel-heart-float {
    animation: none !important;
  }
  .chapter-nav-item-enhanced:hover {
    transform: none;
  }
  .prob-row-3d-lift:hover {
    transform: none;
  }
}
</style>
