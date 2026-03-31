<template>
  <div class="practice-page" style="padding-top:56px">

    <!-- Map View -->
    <div v-if="view === 'map'" class="practice-map">
      <div class="map-header container">
        <div class="section-title">⚔ 刷题闯关地图</div>
        <div class="map-subtitle">点击章节方块进入刷题 · 共 12 个专题</div>
        <div class="map-global-row">
          <div class="pixel-font map-done-text">已完成 <span style="color:var(--neon-cyan)">{{ globalDone }}</span> 题</div>
          <div class="map-level pixel-font">LV.{{ level }} &nbsp;<span style="color:var(--text-dim);font-size:.42rem">{{ globalDone * 50 }} XP</span></div>
          <button class="pixel-btn sync-btn" @click="showSyncModal = true">⟳ 同步 LeetCode</button>
        </div>
        <div class="pixel-progress-outer" style="max-width:400px;margin-top:8px">
          <div class="pixel-progress-inner" :style="{width: globalPct+'%'}"></div>
        </div>
      </div>
      <div class="bubble-container container">
        <div
          v-for="(ch, i) in CHAPTERS" :key="ch.id"
          class="bubble-cell"
          :style="bubbleStyle(i, ch)"
          @click="openChapter(ch)"
        >
          <div class="bubble-num pixel-font">{{ String(i+1).padStart(2,'0') }}</div>
          <div class="bubble-title">{{ ch.short }}</div>
          <div class="bubble-done pixel-font" :style="{color: ch.light}">{{ countDone(ch.id) }} ✓</div>
          <div class="bubble-bar">
            <div class="bubble-bar-inner" :style="{width: chPct(ch)+'%', background: ch.light}"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chapter View -->
    <div v-if="view === 'chapter'" class="chapter-view">
      <div class="chapter-sidebar">
        <div class="sidebar-back pixel-font" @click="view='map'">◀ 章节地图</div>
        <div class="sidebar-chapters">
          <div
            v-for="(ch, i) in CHAPTERS" :key="ch.id"
            class="sidebar-item"
            :class="{active: currentChapter && currentChapter.id === ch.id}"
            :style="currentChapter && currentChapter.id === ch.id ? {'border-left-color': ch.light, color: ch.light} : {}"
            @click="openChapter(ch)"
          >
            <span class="sidebar-num pixel-font">{{ String(i+1).padStart(2,'0') }}</span>
            <span class="sidebar-title">{{ ch.short }}</span>
            <span v-if="countDone(ch.id) > 0" class="sidebar-done pixel-font" :style="{color: ch.light}">{{ countDone(ch.id) }}</span>
          </div>
        </div>
        <div class="sidebar-progress">
          <div class="pixel-font" style="font-size:.42rem;color:var(--text-dim);margin-bottom:6px">全站进度 {{ globalPct }}%</div>
          <div class="pixel-progress-outer">
            <div class="pixel-progress-inner" :style="{width: globalPct+'%'}"></div>
          </div>
        </div>
      </div>

      <div class="chapter-main">
        <div v-if="mdLoading" class="md-loading pixel-font">LOADING...</div>
        <div v-else-if="mdError" class="md-error pixel-font">{{ mdError }}</div>
        <div v-else>
          <div class="chapter-header">
            <h2 class="pixel-font chapter-title" :style="{color: currentChapter.light, textShadow: '0 0 12px '+currentChapter.light}">
              {{ currentChapter.title }}
            </h2>
            <div class="chapter-stats pixel-font">
              已完成 <span :style="{color: currentChapter.light}">{{ countDone(currentChapter.id) }}</span> / {{ chapterTotal }} 题
            </div>
            <div class="pixel-progress-outer" style="max-width:300px;margin-top:8px">
              <div class="pixel-progress-inner" :style="{width: chPct(currentChapter)+'%', background: 'linear-gradient(90deg,'+currentChapter.color+','+currentChapter.light+')'}"></div>
            </div>
          </div>
          <div class="sections-list">
            <div v-for="sec in sections" :key="sec.h2+sec.h3" class="section-block pixel-card">
              <div v-if="sec.h2" class="sec-h2 pixel-font">{{ sec.h2 }}</div>
              <div v-if="sec.h3" class="sec-h3">{{ sec.h3 }}</div>
              <div class="prob-table">
                <div v-for="row in sec.rows" :key="row.probId" class="prob-row" :class="{done: isChecked(currentChapter.id, row.probId)}">
                  <input type="checkbox" :checked="isChecked(currentChapter.id, row.probId)" @change="toggleCheck(currentChapter.id, row.probId)" class="prob-check" />
                  <span class="prob-num pixel-font">{{ row.num }}</span>
                  <span class="prob-title">
                    <a v-if="row.url" :href="row.url" target="_blank" rel="noopener">{{ row.title }}</a>
                    <span v-else>{{ row.title }}</span>
                    <span v-if="row.isMember" class="lock-icon">🔒</span>
                  </span>
                  <span class="prob-rating" :class="ratingCls(row.rating)">{{ row.rating }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- LeetCode Sync Modal -->
    <Teleport to="body">
      <div v-if="showSyncModal" class="modal-overlay" @click.self="showSyncModal = false">
        <div class="modal-content pixel-card">
          <button class="modal-close" @click="showSyncModal = false">×</button>
          <h2 class="modal-title pixel-font glow-cyan">⟳ {{ t('同步 LeetCode', 'Sync LeetCode') }}</h2>

          <div class="sync-intro">
            {{ t('将 LeetCode.cn 已通过的题目同步到本地，避免重复刷题。', 'Sync your accepted problems from LeetCode.cn to avoid re-doing them.') }}
          </div>

          <div class="sync-steps">
            <h3 class="step-title">{{ t('使用步骤', 'How to use') }}</h3>
            <ol class="step-list">
              <li>{{ t('打开 leetcode.cn 并登录你的账号', 'Open leetcode.cn and login to your account') }}</li>
              <li>
                <span v-html="t(
                  '打开浏览器开发者工具：<br><b>Mac</b>：按 <kbd>Option+Cmd+J</kbd> 或菜单 → 开发者工具<br><b>Windows/Linux</b>：按 <kbd>F12</kbd> 或 <kbd>Ctrl+Shift+J</kbd>',
                  'Open DevTools:<br><b>Mac</b>: Press <kbd>Option+Cmd+J</kbd> or menu → Developer Tools<br><b>Windows/Linux</b>: Press <kbd>F12</kbd> or <kbd>Ctrl+Shift+J</kbd>'
                )"></span>
              </li>
              <li>{{ t('切换到 Console（控制台）标签页', 'Switch to the Console tab') }}</li>
              <li>{{ t('点击下方「复制」按钮复制脚本，粘贴到控制台后按回车执行', 'Click the "Copy" button below, paste into Console and press Enter') }}</li>
              <li>{{ t('脚本执行完毕后会弹出提示，然后点击下方「粘贴导入」按钮', 'After the script finishes, an alert will appear — then click "Paste &amp; Import" below') }}</li>
            </ol>
          </div>

          <div class="sync-script-box">
            <div class="script-header">
              <span class="pixel-font">{{ t('复制此脚本', 'Copy this script') }}</span>
              <button class="copy-btn pixel-font" @click="copyScript">{{ t('复制', 'Copy') }}</button>
            </div>
            <pre class="script-code"><code>{{ leetcodeScript }}</code></pre>
          </div>

          <div class="sync-actions">
            <button class="pixel-btn" @click="pasteImport">{{ t('粘贴导入', 'Paste & Import') }}</button>
            <span v-if="syncResult" class="sync-result pixel-font">{{ syncResult }}</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { CHAPTERS } from '../composables/data.js'
import { useLang } from '../composables/i18n.js'
import { leetcodeScript } from '../composables/lcScript.js'

const { t } = useLang()

const STORAGE_KEY = 'mc-algo-progress'
const TOTALS_KEY  = '_chapterTotals'

const view = ref('map')
const currentChapter = ref(null)
const sections = ref([])
const mdLoading = ref(false)
const mdError = ref('')
const mdCache = {}
const progress = ref({})
const totals = ref({})
const showSyncModal = ref(false)
const syncResult = ref('')

function loadStorage() {
  try { progress.value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { progress.value = {} }
  try { totals.value  = JSON.parse(localStorage.getItem(TOTALS_KEY)  || '{}') } catch { totals.value = {} }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress.value))
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
  return {
    left: pos.x + '%',
    top: pos.y + '%',
    'border-color': ch.color,
    'box-shadow': `0 0 12px ${ch.color}88, inset 0 0 8px ${ch.color}22`,
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


function copyScript() {
  navigator.clipboard.writeText(leetcodeScript)
  syncResult.value = t('已复制脚本！', 'Script copied!')
  setTimeout(() => syncResult.value = '', 2000)
}

async function pasteImport() {
  try {
    const text = await navigator.clipboard.readText()
    const data = JSON.parse(text)
    if (!data.acIds || !Array.isArray(data.acIds)) {
      syncResult.value = t('剪贴板内容无效', 'Invalid clipboard content')
      return
    }

    // Build a map of problem numbers to chapter/probId
    const probMap = {}
    for (const [chId, secs] of Object.entries(mdCache)) {
      for (const sec of secs) {
        for (const row of sec.rows) {
          probMap[row.num] = { chId, probId: row.probId }
        }
      }
    }

    // Also need to load chapters that aren't cached yet
    // Mark all AC problems
    let imported = 0
    for (const num of data.acIds) {
      const mapping = probMap[num]
      if (mapping) {
        if (!progress.value[mapping.chId]) progress.value[mapping.chId] = {}
        if (!progress.value[mapping.chId][mapping.probId]) {
          progress.value[mapping.chId][mapping.probId] = true
          imported++
        }
      }
    }

    progress.value = { ...progress.value }
    saveProgress()
    syncResult.value = t(`成功导入 ${imported} 道题目！`, `Successfully imported ${imported} problems!`)
  } catch (e) {
    syncResult.value = t('导入失败，请确保已复制正确数据', 'Import failed. Please ensure correct data is copied.')
  }
}

// Close modal on Escape
watch(showSyncModal, (val) => {
  const handleEsc = (e) => {
    if (e.key === 'Escape' && showSyncModal.value) showSyncModal.value = false
  }
  if (val) {
    window.addEventListener('keydown', handleEsc)
  } else {
    window.removeEventListener('keydown', handleEsc)
    syncResult.value = ''
  }
})

onMounted(() => { loadStorage() })
</script>

<style scoped>
.practice-page { min-height: 100vh; }

.practice-map { padding-bottom: 60px; }
.map-header { padding: 40px 0 24px; }
.map-subtitle { color: var(--text-dim); font-size: .82rem; margin-bottom: 12px; }
.map-global-row { display: flex; align-items: center; gap: 20px; margin-top: 8px; }
.map-done-text { font-size: .52rem; }
.map-level { font-size: .52rem; color: var(--mc-gold); text-shadow: 0 0 8px var(--mc-gold); }

.bubble-container { position: relative; height: 520px; margin-top: 32px; }
.bubble-cell {
  position: absolute;
  width: 140px;
  padding: 14px 12px 10px;
  background: var(--bg-card);
  border: 2px solid;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.2s;
}
.bubble-cell:hover { transform: translate(-3px,-4px) scale(1.04); z-index: 10; }
.bubble-num { font-size: .45rem; color: var(--text-dim); margin-bottom: 4px; }
.bubble-title { font-size: .78rem; color: var(--text-main); margin-bottom: 6px; font-weight: 600; }
.bubble-done { font-size: .42rem; margin-bottom: 5px; }
.bubble-bar { width: 100%; height: 4px; background: #1a1a2e; }
.bubble-bar-inner { height: 100%; transition: width .8s ease; }

.chapter-view { display: flex; min-height: calc(100vh - 56px); }

.chapter-sidebar {
  width: 240px; flex-shrink: 0;
  background: var(--bg-panel);
  border-right: 2px solid var(--border-pixel);
  display: flex; flex-direction: column;
  position: sticky; top: 56px;
  height: calc(100vh - 56px);
  overflow-y: auto;
}
.sidebar-back {
  font-size: .45rem; color: var(--neon-cyan);
  padding: 12px 16px 14px;
  border-bottom: 1px solid var(--border-pixel);
  cursor: pointer; letter-spacing: .08em;
}
.sidebar-back:hover { color: var(--neon-blue); }
.sidebar-chapters { flex: 1; overflow-y: auto; padding: 8px 0; }
.sidebar-item {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 16px; cursor: pointer;
  border-left: 3px solid transparent;
  transition: all .15s; color: var(--text-dim); font-size: .82rem;
}
.sidebar-item:hover { color: var(--text-main); background: rgba(255,255,255,.04); }
.sidebar-item.active { background: rgba(0,243,255,.06); }
.sidebar-num { font-size: .38rem; flex-shrink: 0; }
.sidebar-title { flex: 1; }
.sidebar-done { font-size: .38rem; flex-shrink: 0; }
.sidebar-progress { padding: 12px 16px; border-top: 1px solid var(--border-pixel); }

.chapter-main { flex: 1; padding: 32px 28px 60px; min-width: 0; }
.md-loading, .md-error {
  font-size: .55rem; color: var(--neon-cyan);
  text-align: center; padding: 60px;
  animation: blink 1s step-end infinite;
}
.chapter-header { margin-bottom: 28px; }
.chapter-title { font-size: clamp(.6rem,1.5vw,.85rem); margin-bottom: 10px; }
.chapter-stats { font-size: .45rem; color: var(--text-dim); margin-bottom: 6px; }

.sections-list { display: flex; flex-direction: column; gap: 16px; }
.section-block { padding: 16px 20px; }
.sec-h2 { font-size: .52rem; color: var(--neon-purple); text-shadow: 0 0 6px var(--neon-purple); margin-bottom: 10px; }
.sec-h3 { font-size: .82rem; color: var(--neon-blue); margin-bottom: 10px; font-weight: 600; }

.prob-table { display: flex; flex-direction: column; gap: 4px; }
.prob-row {
  display: flex; align-items: center; gap: 10px;
  padding: 7px 10px;
  border: 1px solid transparent;
  transition: background .15s, border-color .15s;
  border-radius: 0;
}
.prob-row:hover { background: rgba(0,243,255,.04); border-color: var(--border-pixel); }
.prob-row.done { background: rgba(0,255,204,.06); }
.prob-check { width: 14px; height: 14px; accent-color: var(--neon-cyan); flex-shrink: 0; cursor: pointer; }
.prob-num { font-size: .38rem; color: var(--text-dim); min-width: 36px; flex-shrink: 0; }
.prob-title { flex: 1; font-size: .85rem; min-width: 0; }
.prob-title a { color: var(--text-main); text-decoration: none; }
.prob-title a:hover { color: var(--neon-blue); }
.prob-row.done .prob-title { text-decoration: line-through; color: var(--text-dim); }
.lock-icon { margin-left: 4px; font-size: .75rem; }
.prob-rating { font-size: .38rem; flex-shrink: 0; padding: 2px 6px; border: 1px solid; }
.r-none { color: var(--text-dim); border-color: var(--border-pixel); }
.r-low  { color: #7cc427; border-color: #7cc427; }
.r-med  { color: var(--mc-gold); border-color: var(--mc-gold); }
.r-high { color: var(--neon-pink); border-color: var(--neon-pink); }

@media (max-width: 768px) {
  .bubble-container { height: 800px; }
  .bubble-cell { width: 120px; }
  .chapter-view { flex-direction: column; }
  .chapter-sidebar { width: 100%; height: auto; position: static; border-right: none; border-bottom: 2px solid var(--border-pixel); }
  .sidebar-chapters { max-height: 180px; }
}

/* Sync button */
.sync-btn {
  font-size: .42rem;
  padding: 6px 14px;
  margin-left: auto;
}

/* Sync Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
.modal-content {
  position: relative;
  width: 100%;
  max-width: 640px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 28px;
  animation: slideUp 0.25s ease;
}
@keyframes slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
.modal-close {
  position: absolute;
  top: 12px; right: 12px;
  background: transparent;
  border: 1px solid var(--border-pixel);
  color: var(--text-dim);
  width: 28px; height: 28px;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.modal-close:hover { background: var(--neon-pink); color: #fff; border-color: var(--neon-pink); }
.modal-title { font-size: 1.1rem; margin-bottom: 14px; }
.sync-intro {
  color: var(--text-dim);
  font-size: .85rem;
  line-height: 1.7;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-pixel);
}
.sync-steps { margin-bottom: 20px; }
.step-title {
  font-size: .65rem;
  color: var(--neon-cyan);
  text-transform: uppercase;
  letter-spacing: .1em;
  margin-bottom: 10px;
}
.step-list {
  padding-left: 20px;
  color: var(--text-dim);
  font-size: .85rem;
  line-height: 1.9;
  margin: 0;
}
.step-list li { margin-bottom: 4px; }
.step-list li::marker { color: var(--neon-purple); }
.sync-script-box {
  background: var(--bg-dark);
  border: 1px solid var(--border-pixel);
  border-radius: 4px;
  margin-bottom: 20px;
  overflow: hidden;
}
.script-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: var(--bg-panel);
  border-bottom: 1px solid var(--border-pixel);
  font-size: .55rem;
  color: var(--text-dim);
}
.copy-btn {
  background: transparent;
  border: 1px solid var(--neon-cyan);
  color: var(--neon-cyan);
  padding: 3px 10px;
  font-size: .42rem;
  cursor: pointer;
  letter-spacing: .05em;
  transition: all .15s;
}
.copy-btn:hover { background: var(--neon-cyan); color: var(--bg-dark); }
.script-code {
  margin: 0;
  padding: 14px;
  font-size: .68rem;
  color: #7cc427;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'Courier New', monospace;
  max-height: 200px;
  overflow-y: auto;
}
.sync-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-pixel);
}
.sync-result {
  font-size: .45rem;
  color: var(--neon-cyan);
  letter-spacing: .05em;
}

.step-list kbd {
  display: inline-block;
  background: var(--bg-dark);
  border: 1px solid var(--border-pixel);
  border-radius: 3px;
  padding: 1px 5px;
  font-size: .75em;
  color: var(--neon-cyan);
  font-family: 'Courier New', monospace;
}
</style>