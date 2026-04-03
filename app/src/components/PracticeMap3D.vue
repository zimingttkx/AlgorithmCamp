<template>
  <div class="worldmap-wrap" ref="container">
    <canvas ref="canvas"></canvas>

    <!-- Mobile fallback -->
    <div v-if="isMobile" class="worldmap-fallback">
      <div class="map-header container">
        <div class="section-title pixel-font">⚔ {{ isZh ? '算法闯关地图' : 'ALGORITHM MAP' }}</div>
        <div class="map-subtitle">{{ isZh ? '点击关卡进入专题 · 共 12 关' : 'Click level · 12 total' }}</div>
      </div>
      <div class="fallback-grid container">
        <div v-for="(ch, i) in chapters" :key="ch.id" class="fallback-cell pixel-card"
          :class="{ locked: !isLevelUnlocked(i) }"
          :style="{ borderColor: isLevelUnlocked(i) ? ch.light : '#334' }"
          @click="isLevelUnlocked(i) && $emit('open', ch)">
          <div class="fb-idx" :style="{ color: isLevelUnlocked(i) ? ch.light : '#555' }">
            {{ isLevelUnlocked(i) ? `LEVEL-${String(i+1).padStart(2,'0')}` : '🔒 LOCKED' }}
          </div>
          <div class="fb-title" :style="{ opacity: isLevelUnlocked(i) ? 1 : 0.4 }">{{ ch.short }}</div>
          <div class="fb-done" :style="{color: isLevelUnlocked(i) ? ch.light : '#555'}">
            {{ countDone(ch.id) }} / {{ totals[ch.id] || ch.count || '?' }}
          </div>
          <div class="fb-bar"><div class="fb-bar-inner" :style="{width: pct(ch)+'%', background: isLevelUnlocked(i) ? ch.light : '#334'}"></div></div>
        </div>
      </div>
    </div>

    <!-- HUD overlay -->
    <div v-if="!isMobile && focusState === 'overview'" class="worldmap-hud">
      <div class="hud-title section-title pixel-font">⚔ {{ isZh ? '算法闯关地图' : 'ALGORITHM MAP' }}</div>
      <div class="hud-progress">{{ conqueredCount }} / 12 {{ isZh ? '关卡已通过' : 'Levels Cleared' }}</div>
      <div class="hud-hint">{{ isZh ? '点击关卡进入专题' : 'Click level to enter' }}</div>
    </div>

    <!-- Level hover tooltip -->
    <div v-if="hoverChapter && focusState === 'overview' && !isMobile" class="worldmap-tooltip pixel-card">
      <div class="tt-name" :style="{color: hoverChapter.light}">{{ hoverChapter.title }}</div>
      <div class="tt-stat">{{ countDone(hoverChapter.id) }} / {{ totals[hoverChapter.id] || hoverChapter.count || '?' }} {{ isZh ? '题' : 'solved' }} · {{ pct(hoverChapter) }}%</div>
    </div>

    <!-- Section panel -->
    <transition name="sec-panel-slide">
      <div v-if="focusState === 'focused' && panelSections.length > 0 && !isMobile" class="section-panel">
        <div class="sp-header">
          <button class="sp-back" @click="zoomOut">← {{ isZh ? '返回地图' : 'Back to Map' }}</button>
          <div class="sp-title" :style="{color: focusedChapter?.light}">{{ focusedChapter?.title }}</div>
          <div class="sp-subtitle">{{ isZh ? '选择小节' : 'Select Section' }}</div>
        </div>
        <div class="sp-grid">
          <div v-for="(sec, i) in panelSections" :key="i"
            class="sp-card pixel-card"
            :style="{borderColor: focusedChapter?.light}"
            @click="selectSection(sec)">
            <div class="sp-card-num">{{ String(i + 1).padStart(2, '0') }}</div>
            <div class="sp-card-title">{{ sec.h2 }} {{ sec.h3 }}</div>
            <div class="sp-card-count">{{ sec.rows?.length || 0 }} {{ isZh ? '题' : 'problems' }}</div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Problem panel -->
    <transition name="pp-slide">
      <div v-if="focusState === 'section' && selectedSection && focusedChapter && !isMobile"
        class="prob-panel pixel-card">
        <div class="pp-top">
          <button class="pp-back" @click="closeSection">← {{ focusedChapter.short }}</button>
          <span class="pp-count">{{ selectedSection.rows.length }} {{ isZh ? '题' : 'problems' }}</span>
        </div>
        <div class="pp-title" :style="{color: focusedChapter.light}">{{ selectedSection.h2 }} {{ selectedSection.h3 }}</div>
        <div class="pp-list">
          <div v-for="row in selectedSection.rows" :key="row.probId" class="pp-row"
            :class="{done: isChecked(focusedChapter.id, row.probId)}">
            <input type="checkbox" :checked="isChecked(focusedChapter.id, row.probId)"
              @change.stop="$emit('toggle-problem', focusedChapter.id, row.probId)"
              class="prob-check" @click.stop />
            <span class="prob-num">{{ row.num }}</span>
            <a v-if="row.url" :href="row.url" target="_blank" class="prob-link" @click.stop>{{ row.title }}</a>
            <span v-else class="prob-name">{{ row.title }}</span>
            <span v-if="row.isMember" class="lock">🔒</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLang } from '../composables/i18n.js'

const { isZh } = useLang()

const props = defineProps({
  chapters: { type: Array, default: () => [] },
  progress: { type: Object, default: () => ({}) },
  totals: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['open', 'toggle-problem'])

const container = ref(null)
const canvas = ref(null)
const hoverChapter = ref(null)
const isMobile = ref(false)
const focusState = ref('overview')
const focusedChapter = ref(null)
const selectedSection = ref(null)
let panelSections = []

function countDone(id) {
  if (!props.progress[id]) return 0
  return Object.values(props.progress[id]).filter(Boolean).length
}
function pct(ch) {
  const t = props.totals[ch.id] || ch.count || 0
  return t ? Math.round(countDone(ch.id) / t * 100) : 0
}
function isChecked(chId, probId) {
  return !!(props.progress[chId] && props.progress[chId][probId])
}

function isLevelUnlocked(i) {
  if (i === 0) return true
  const prev = props.chapters[i - 1]
  return countDone(prev.id) > 0
}

const conqueredCount = computed(() =>
  props.chapters.filter(ch => {
    const t = props.totals[ch.id] || ch.count || 0
    return t > 0 && countDone(ch.id) >= t
  }).length
)

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
        const num = cells[0], titleCell = cells[1] || ''
        const lm = titleCell.match(/\[([^\]]+)\]\(([^)]+)\)/)
        let title = titleCell, url = ''
        if (lm) { title = lm[1]; url = lm[2] }
        const isMember = title.includes('🔒')
        title = title.replace('🔒', '').trim()
        const probId = String(num).replace(/[^a-zA-Z0-9]/g, '_')
        curTable.push({ num, title, url, isMember, probId })
      }
    }
  }
  flush()
  return secs
}

function selectSection(sec) {
  selectedSection.value = sec
  focusState.value = 'section'
}

function closeSection() {
  selectedSection.value = null
  focusState.value = 'focused'
}

function zoomOut() {
  focusedChapter.value = null
  selectedSection.value = null
  panelSections = []
  focusState.value = 'overview'
}

async function loadSections(ch) {
  try {
    const r = await fetch(import.meta.env.BASE_URL + ch.file)
    if (!r.ok) throw new Error('404')
    const md = await r.text()
    panelSections = parseMdTables(md)
  } catch {
    panelSections = []
  }
}

// 2D Canvas rendering
let animId = null
let ctx = null
let levels = []
let hoveredIdx = -1
const mouse = { x: -999, y: -999 }
let canvasEl = null
let onResizeHandler = null
let onMouseMoveHandler = null
let onMouseLeaveHandler = null
let onClickHandler = null

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
  if (canvasEl) {
    canvasEl.removeEventListener('mousemove', onMouseMoveHandler)
    canvasEl.removeEventListener('mouseleave', onMouseLeaveHandler)
    canvasEl.removeEventListener('click', onClickHandler)
  }
  if (onResizeHandler) window.removeEventListener('resize', onResizeHandler)
})

onMounted(() => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) return

  const el = canvas.value
  const w = container.value.clientWidth
  const h = Math.max(640, window.innerHeight - 80)
  el.width = w
  el.height = h
  ctx = el.getContext('2d')
  canvasEl = el

  // Level positions (serpentine path)
  const cols = 4, rows = 3
  const startX = 100, startY = h - 120
  const gapX = (w - 200) / (cols - 1)
  const gapY = 180

  for (let i = 0; i < 12; i++) {
    const row = Math.floor(i / cols)
    const col = i % cols
    const x = row % 2 === 0 ? startX + col * gapX : startX + (cols - 1 - col) * gapX
    const y = startY - row * gapY
    levels.push({ x, y, chapter: props.chapters[i], index: i })
  }

  // Mouse events — use named functions so they can be removed on unmount
  onMouseMoveHandler = (e) => {
    const rect = el.getBoundingClientRect()
    mouse.x = e.clientX - rect.left
    mouse.y = e.clientY - rect.top
  }
  onMouseLeaveHandler = () => { mouse.x = -999; mouse.y = -999 }
  onClickHandler = () => {
    if (focusState.value === 'overview' && hoveredIdx >= 0) {
      const ch = props.chapters[hoveredIdx]
      if (!isLevelUnlocked(hoveredIdx)) return
      focusedChapter.value = ch
      focusState.value = 'focused'
      loadSections(ch)
    }
  }
  el.addEventListener('mousemove', onMouseMoveHandler)
  el.addEventListener('mouseleave', onMouseLeaveHandler)
  el.addEventListener('click', onClickHandler)

  // Animation loop
  function animate() {
    animId = requestAnimationFrame(animate)
    ctx.clearRect(0, 0, w, h)

    // Background
    ctx.fillStyle = '#0a0e1a'
    ctx.fillRect(0, 0, w, h)

    // Draw path
    ctx.strokeStyle = '#1a3a5a'
    ctx.lineWidth = 4
    ctx.beginPath()
    for (let i = 0; i < levels.length; i++) {
      const lv = levels[i]
      if (i === 0) ctx.moveTo(lv.x, lv.y)
      else ctx.lineTo(lv.x, lv.y)
    }
    ctx.stroke()

    // Check hover
    hoveredIdx = -1
    hoverChapter.value = null
    for (let i = 0; i < levels.length; i++) {
      const lv = levels[i]
      const dx = mouse.x - lv.x
      const dy = mouse.y - lv.y
      if (Math.sqrt(dx * dx + dy * dy) < 40) {
        hoveredIdx = i
        hoverChapter.value = lv.chapter
        break
      }
    }

    // Draw levels
    for (let i = 0; i < levels.length; i++) {
      const lv = levels[i]
      const ch = lv.chapter
      const unlocked = isLevelUnlocked(i)
      const done = countDone(ch.id)
      const total = props.totals[ch.id] || ch.count || 0
      const completed = total > 0 && done >= total
      const isHovered = hoveredIdx === i

      const size = isHovered ? 50 : 45
      const x = lv.x - size / 2
      const y = lv.y - size / 2

      // Level circle
      ctx.fillStyle = unlocked ? ch.color : '#222233'
      ctx.beginPath()
      ctx.arc(lv.x, lv.y, size / 2, 0, Math.PI * 2)
      ctx.fill()

      // Border
      ctx.strokeStyle = unlocked ? ch.light : '#334455'
      ctx.lineWidth = 3
      ctx.stroke()

      // Number
      ctx.fillStyle = unlocked ? '#fff' : '#555'
      ctx.font = 'bold 20px "Press Start 2P", monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(i + 1), lv.x, lv.y)

      // Flag if completed
      if (completed) {
        ctx.fillStyle = ch.light
        ctx.fillRect(lv.x + 20, lv.y - 30, 3, 20)
        ctx.fillRect(lv.x + 23, lv.y - 28, 12, 8)
      }

      // Lock if locked
      if (!unlocked) {
        ctx.fillStyle = '#555'
        ctx.font = '16px Arial'
        ctx.fillText('🔒', lv.x, lv.y - 35)
      }
    }
  }

  animate()

  function onResize() {
    isMobile.value = window.innerWidth < 768
  }
  window.addEventListener('resize', onResize)
})
</script>

<style scoped>
.worldmap-wrap {
  position: relative;
  width: 100%;
  min-height: 640px;
  overflow: hidden;
  background: #0a0e1a;
}
.worldmap-wrap canvas {
  display: block;
  cursor: pointer;
}

.worldmap-hud {
  position: absolute;
  top: 24px; left: 28px;
  z-index: 10;
  pointer-events: none;
}
.hud-progress {
  font-size: 0.85rem;
  color: var(--mc-gold, #f0c030);
  margin-top: 6px;
  text-shadow: 0 0 8px var(--mc-gold, #f0c030);
}
.hud-hint {
  font-size: 0.85rem;
  color: var(--text-dim, #94A3B8);
  margin-top: 4px;
  opacity: 0.7;
}

.worldmap-tooltip {
  position: absolute;
  top: 24px; right: 28px;
  z-index: 10;
  pointer-events: none;
  padding: 14px 18px;
  min-width: 180px;
  backdrop-filter: blur(12px);
  background: rgba(10,14,26,0.9) !important;
  border: 1px solid rgba(14,165,233,0.3) !important;
}
.tt-name { font-size: 1.05rem; font-weight: 600; margin-bottom: 4px; }
.tt-stat { font-size: 0.85rem; color: var(--text-dim, #94A3B8); }

.section-panel {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  z-index: 15;
  width: min(700px, 85vw);
  max-height: 70vh;
  overflow-y: auto;
  padding: 24px;
  backdrop-filter: blur(20px);
  background: rgba(10,14,26,0.95) !important;
  border: 2px solid rgba(14,165,233,0.3) !important;
  border-radius: 12px !important;
}
.sp-header {
  margin-bottom: 20px;
  text-align: center;
  position: relative;
}
.sp-back {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.85rem;
  color: var(--neon-cyan, #00ffcc);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}
.sp-back:hover { color: var(--neon-blue, #0EA5E9); }
.sp-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 6px;
}
.sp-subtitle {
  font-size: 0.9rem;
  color: var(--text-dim, #94A3B8);
}
.sp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}
.sp-card {
  padding: 16px;
  cursor: pointer;
  text-align: center;
  border: 2px solid;
  transition: all 0.2s;
  background: var(--sp-card-bg) !important;
}
.sp-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(14,165,233,0.3);
  background: var(--sp-card-bg-hover) !important;
}
.sp-card-num {
  font-size: 0.75rem;
  color: var(--text-dim, #94A3B8);
  margin-bottom: 8px;
  letter-spacing: 0.1em;
}
.sp-card-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-main, #F1F5F9);
  line-height: 1.3;
  min-height: 2.6em;
}
.sp-card-count {
  font-size: 0.85rem;
  color: var(--neon-cyan, #00ffcc);
}
.sec-panel-slide-enter-active, .sec-panel-slide-leave-active {
  transition: all 0.3s ease;
}
.sec-panel-slide-enter-from, .sec-panel-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -45%);
}

.prob-panel {
  position: absolute;
  bottom: 30px; left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  width: min(520px, 90vw);
  max-height: 55vh;
  overflow-y: auto;
  padding: 20px 24px;
  backdrop-filter: blur(20px);
  background: var(--prob-panel-bg) !important;
  border: 1px solid rgba(14,165,233,0.25) !important;
  border-radius: 10px !important;
}
.pp-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.pp-back {
  font-size: 0.85rem;
  color: var(--neon-cyan, #00ffcc);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}
.pp-back:hover { color: var(--neon-blue, #0EA5E9); }
.pp-count { font-size: 0.8rem; color: var(--text-dim, #94A3B8); }
.pp-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 14px;
}
.pp-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pp-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 0.85rem;
  transition: background 0.15s;
}
.pp-row:hover { background: rgba(14,165,233,0.06); }
.pp-row.done { opacity: 0.5; }
.pp-row.done .prob-link,
.pp-row.done .prob-name { text-decoration: line-through; }
.prob-check {
  width: 14px; height: 14px;
  accent-color: var(--neon-cyan, #00ffcc);
  flex-shrink: 0;
  cursor: pointer;
}
.prob-num { color: var(--text-dim, #94A3B8); min-width: 30px; flex-shrink: 0; }
.prob-link {
  flex: 1; color: var(--text-main, #F1F5F9); text-decoration: none;
  min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.prob-link:hover { color: var(--neon-blue, #0EA5E9); }
.prob-name {
  flex: 1; color: var(--text-main, #F1F5F9);
  min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.lock { font-size: 0.8rem; flex-shrink: 0; }

.pp-slide-enter-active, .pp-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease;
}
.pp-slide-enter-from { transform: translateX(-50%) translateY(30px); opacity: 0; }
.pp-slide-leave-to   { transform: translateX(-50%) translateY(30px); opacity: 0; }

.worldmap-fallback { padding: 40px 0 60px; background: var(--map-bg); }
.map-header { padding-bottom: 20px; }
.map-subtitle { color: var(--text-dim, #94A3B8); font-size: 0.9rem; }
.fallback-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.fallback-cell {
  padding: 14px;
  cursor: pointer;
  text-align: center;
  border: 2px solid;
  transition: transform 0.2s, box-shadow 0.2s;
  background: var(--fallback-cell-bg) !important;
}
.fallback-cell:hover { transform: translateY(-3px); box-shadow: 0 0 16px rgba(14,165,233,0.2); }
.fallback-cell.locked { cursor: not-allowed; opacity: 0.5; }
.fallback-cell.locked:hover { transform: none; box-shadow: none; }
.fb-idx { font-size: 0.7rem; margin-bottom: 4px; letter-spacing: 0.1em; }
.fb-title { font-size: 0.95rem; font-weight: 600; margin-bottom: 6px; }
.fb-done { font-size: 0.85rem; margin-bottom: 6px; }
.fb-bar { width: 100%; height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; }
.fb-bar-inner { height: 100%; border-radius: 2px; transition: width 0.6s ease; }

@media (max-width: 768px) {
  .worldmap-wrap { min-height: auto; }
  .worldmap-wrap canvas { display: none; }
  .fallback-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
