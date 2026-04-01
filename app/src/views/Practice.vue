<template>
  <div class="practice-page" style="padding-top:56px">

    <!-- Sync Modal -->
    <Teleport to="body">
      <div v-if="showSyncModal" class="sync-overlay" @click.self="showSyncModal = false">
        <div class="sync-modal">
          <div class="sync-modal-title pixel-font">◉ GIST 云同步</div>

          <!-- Token 输入（未配置时显示） -->
          <div v-if="!gistToken" class="sync-section">
            <p class="sync-desc">输入 GitHub Personal Access Token（只需 <code>gist</code> 权限），自动创建私有 Gist 存储进度。</p>
            <input v-model="tokenInput" class="sync-input" placeholder="ghp_xxxxxxxxxxxx" type="password" />
            <div class="sync-actions">
              <button class="sync-btn-primary" @click="handleSaveToken" :disabled="!tokenInput.trim() || syncStatus === 'syncing'">
                {{ syncStatus === 'syncing' ? '初始化中...' : '初始化同步' }}
              </button>
              <button class="sync-btn-cancel" @click="showSyncModal = false">取消</button>
            </div>
            <p v-if="syncError" class="sync-error">{{ syncError }}</p>
            <p class="sync-tip">Token 仅存于本地浏览器。创建：GitHub → Settings → Developer settings → Personal access tokens → 勾选 gist</p>
          </div>

          <!-- 已配置：显示状态和操作 -->
          <div v-else class="sync-section">
            <div class="sync-status-bar">
              <span class="sync-status-label">同步状态</span>
              <span class="sync-status-val" :class="syncStatus">{{ { idle: '就绪', syncing: '同步中...', success: '已同步', error: '同步失败' }[syncStatus] }}</span>
            </div>
            <p v-if="syncError" class="sync-error">{{ syncError }}</p>

            <div class="sync-btn-row">
              <button class="sync-btn-primary" @click="handleUpload" :disabled="syncStatus === 'syncing'">
                ↑ 上传本地进度
              </button>
              <button class="sync-btn-secondary" @click="handleDownload" :disabled="syncStatus === 'syncing'">
                ↓ 下载云端进度
              </button>
            </div>

            <div class="sync-manage-row">
              <button class="sync-btn-danger" @click="clearSync(); showSyncModal = false">清除配置</button>
              <button class="sync-btn-cancel" @click="showSyncModal = false">关闭</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Map View -->
    <div v-if="view === 'map'" class="practice-map">
      <div class="map-header container">
        <div class="section-title" style="display:flex;align-items:center;gap:12px">
          ⚔ 刷题闯关地图
          <button class="sync-btn" :class="syncStatus" @click="showSyncModal = true; tokenInput = ''" :title="gistToken ? '云同步已启用' : '点击配置云同步'">
            <span v-if="syncStatus === 'syncing'" class="sync-spin">↻</span>
            <span v-else-if="syncStatus === 'success'">☁ ✓</span>
            <span v-else-if="syncStatus === 'error'">☁ ✗</span>
            <span v-else>{{ gistToken ? '☁' : '☁?' }}</span>
          </button>
        </div>
        <div class="map-subtitle">点击章节方块进入刷题 · 共 12 个专题</div>
        <div class="map-global-row">
          <div class="pixel-font map-done-text">已完成 <span style="color:var(--neon-cyan)">{{ globalDone }}</span> 题</div>
          <div class="map-level pixel-font">LV.{{ level }} &nbsp;<span style="color:var(--text-dim);font-size:.42rem">{{ globalDone * 50 }} XP</span></div>
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

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { CHAPTERS } from '../composables/data.js'
import { useLang } from '../composables/i18n.js'
import { useSync } from '../composables/sync.js'

const { t } = useLang()
const { syncStatus, syncError, gistToken, gistId, initGist, pushProgress, pullProgress, mergeProgress, debouncePush, clearSync, touchChapter, deviceId } = useSync()

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
const showSyncModal = ref(false)
const tokenInput = ref('')

function loadStorage() {
  try { progress.value = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}') } catch { progress.value = {} }
  try { totals.value  = JSON.parse(localStorage.getItem(TOTALS_KEY)  || '{}') } catch { totals.value = {} }
}

function saveProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress.value))
  if (gistToken.value && gistId.value) {
    debouncePush(progress.value)
  }
}

function isChecked(chId, probId) {
  return !!(progress.value[chId] && progress.value[chId][probId])
}

function toggleCheck(chId, probId) {
  if (!progress.value[chId]) progress.value[chId] = {}
  progress.value[chId][probId] = !progress.value[chId][probId]
  touchChapter(progress.value, chId)
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


async function syncOnLoad() {
  loadStorage()
  if (!gistToken.value || !gistId.value) return
  const cloud = await pullProgress()
  if (cloud) {
    progress.value = mergeProgress(progress.value, cloud)
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress.value))
  }
}

async function handleSaveToken() {
  const token = tokenInput.value.trim()
  if (!token) return
  try {
    await initGist(token)
    showSyncModal.value = false
    await syncOnLoad()
  } catch {
    // error reflected in syncStatus
  }
}

async function handleUpload() {
  loadStorage()
  const ok = await pushProgress(progress.value)
  if (!ok) {
    // pushProgress already sets syncStatus to 'error' if token/gistId missing
  }
}

async function handleDownload() {
  const cloud = await pullProgress()
  if (cloud) {
    progress.value = mergeProgress(progress.value, cloud)
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress.value))
  }
}

onMounted(() => { syncOnLoad() })
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

/* Sync Button */
.sync-btn {
  font-size: .65rem;
  padding: 2px 8px;
  background: rgba(255,255,255,.06);
  border: 1px solid var(--border-pixel);
  color: var(--text-dim);
  cursor: pointer;
  border-radius: 4px;
  transition: all .2s;
  font-family: inherit;
  letter-spacing: .04em;
}
.sync-btn:hover { border-color: var(--neon-cyan); color: var(--neon-cyan); }
.sync-btn.success { border-color: #00ffcc44; color: var(--neon-cyan); }
.sync-btn.error   { border-color: #ff2eb044; color: var(--neon-pink); }
.sync-btn.syncing { border-color: #0ea5e944; color: var(--neon-blue); }

.sync-spin { display: inline-block; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Sync Modal */
.sync-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.8);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
}
.sync-modal { width: 100%; max-width: 460px; padding: 28px; }
.sync-modal-title {
  font-size: .75rem; color: var(--neon-cyan);
  text-shadow: 0 0 8px var(--neon-cyan);
  margin-bottom: 12px; letter-spacing: .1em;
}
.sync-modal-desc { font-size: .85rem; color: var(--text-dim); line-height: 1.7; margin-bottom: 20px; }
.sync-modal-desc code {
  background: rgba(0,255,204,.1); color: var(--neon-cyan);
  padding: 1px 5px; border-radius: 3px; font-size: .8rem;
}
.sync-info {
  background: rgba(255,255,255,.03);
  border: 1px solid var(--border-pixel);
  border-radius: 4px; padding: 12px 14px; margin-bottom: 16px;
}
.sync-info-row { display: flex; gap: 12px; align-items: center; margin-bottom: 6px; }
.sync-info-row:last-child { margin-bottom: 0; }
.sync-label { font-size: .75rem; color: var(--text-dim); min-width: 52px; }
.sync-val { font-size: .85rem; color: var(--text-main); }
.sync-val.success { color: var(--neon-cyan); }
.sync-val.error   { color: var(--neon-pink); }
.sync-val.syncing { color: var(--neon-blue); }
.sync-input-row { margin-bottom: 16px; }
.sync-token-input {
  width: 100%; background: rgba(255,255,255,.04);
  border: 1px solid var(--border-pixel); color: var(--text-main);
  padding: 10px 12px; font-size: .88rem; font-family: monospace;
  outline: none; border-radius: 4px; box-sizing: border-box;
  transition: border-color .2s;
}
.sync-token-input:focus { border-color: var(--neon-cyan); }
.sync-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
.sync-cancel {
  background: none; border: 1px solid var(--border-pixel);
  color: var(--text-dim); padding: 8px 16px; cursor: pointer;
  border-radius: 4px; font-family: inherit; font-size: .85rem;
  transition: all .2s;
}
.sync-cancel:hover { border-color: var(--text-dim); color: var(--text-main); }
.sync-tip {
  font-size: .75rem; color: var(--text-dim); line-height: 1.6;
  padding-top: 12px; border-top: 1px solid var(--border-pixel);
}

</style>

<!-- Unscoped styles for Teleported sync modal (scoped CSS can't reach body children) -->
<style>
.sync-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.85);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
}
.sync-modal {
  width: 100%; max-width: 480px; padding: 28px;
  background: #1a1a2e; border: 2px solid #334155;
  box-shadow: 0 0 20px rgba(0,0,0,.5);
}
.sync-modal-title {
  font-size: .75rem; color: #00ffcc;
  text-shadow: 0 0 8px #00ffcc;
  margin-bottom: 16px; letter-spacing: .1em;
}
.sync-section { margin-bottom: 16px; }
.sync-desc {
  font-size: .85rem; color: #94a3b8; line-height: 1.7; margin-bottom: 16px;
}
.sync-desc code {
  background: rgba(0,255,204,.1); color: #00ffcc;
  padding: 1px 5px; border-radius: 3px; font-size: .8rem;
}
.sync-input {
  width: 100%; background: rgba(255,255,255,.04);
  border: 1px solid #334155; color: #f1f5f9;
  padding: 10px 12px; font-size: .88rem; font-family: monospace;
  outline: none; border-radius: 4px; box-sizing: border-box;
  margin-bottom: 16px; transition: border-color .2s;
}
.sync-input:focus { border-color: #00ffcc; }
.sync-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }

.sync-btn-primary {
  background: rgba(0,255,204,.12); border: 1px solid #00ffcc44;
  color: #00ffcc; padding: 8px 18px; cursor: pointer;
  border-radius: 4px; font-family: inherit; font-size: .85rem;
  transition: all .2s; letter-spacing: .04em;
}
.sync-btn-primary:hover:not(:disabled) { background: rgba(0,255,204,.2); }
.sync-btn-primary:disabled { opacity: .4; cursor: not-allowed; }

.sync-btn-secondary {
  background: rgba(14,165,233,.12); border: 1px solid #0ea5e944;
  color: #0ea5e9; padding: 8px 18px; cursor: pointer;
  border-radius: 4px; font-family: inherit; font-size: .85rem;
  transition: all .2s;
}
.sync-btn-secondary:hover:not(:disabled) { background: rgba(14,165,233,.2); }
.sync-btn-secondary:disabled { opacity: .4; cursor: not-allowed; }

.sync-btn-danger {
  background: rgba(255,46,176,.12); border: 1px solid #ff2eb044;
  color: #ff2eb0; padding: 8px 18px; cursor: pointer;
  border-radius: 4px; font-family: inherit; font-size: .85rem;
  transition: all .2s;
}
.sync-btn-danger:hover { background: rgba(255,46,176,.2); }

.sync-btn-cancel {
  background: none; border: 1px solid #334155;
  color: #94a3b8; padding: 8px 16px; cursor: pointer;
  border-radius: 4px; font-family: inherit; font-size: .85rem;
  transition: all .2s;
}
.sync-btn-cancel:hover { border-color: #94a3b8; color: #f1f5f9; }

.sync-tip {
  font-size: .75rem; color: #64748b; line-height: 1.6;
  padding-top: 12px; border-top: 1px solid #334155;
}

.sync-status-bar {
  display: flex; align-items: center; gap: 12px;
  background: rgba(255,255,255,.03); border: 1px solid #334155;
  border-radius: 4px; padding: 12px 14px; margin-bottom: 16px;
}
.sync-status-label { font-size: .75rem; color: #94a3b8; }
.sync-status-val { font-size: .85rem; font-weight: 600; }
.sync-status-val.idle { color: #94a3b8; }
.sync-status-val.syncing { color: #0ea5e9; }
.sync-status-val.success { color: #00ffcc; }
.sync-status-val.error { color: #ff2eb0; }

.sync-error {
  font-size: .82rem; color: #ff2eb0; background: rgba(255,46,176,.08);
  border: 1px solid rgba(255,46,176,.2); border-radius: 4px;
  padding: 8px 12px; margin-bottom: 12px; line-height: 1.5;
}

.sync-btn-row { display: flex; gap: 10px; margin-bottom: 12px; }
.sync-manage-row { display: flex; gap: 10px; }

.sync-spin { display: inline-block; animation: sync-spin .8s linear infinite; }
@keyframes sync-spin { to { transform: rotate(360deg); } }
</style>