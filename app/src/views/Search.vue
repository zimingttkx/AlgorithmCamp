<template>
  <div class="search-page">
    <div class="search-header">
      <h1 class="page-title">{{ isZh ? '搜索题目' : 'Search Problems' }}</h1>
      <p class="page-desc">{{ isZh ? '搜索所有章节的题目，按名称、难度或状态筛选' : 'Search across all chapters by name, difficulty, or status' }}</p>
    </div>

    <!-- Search and Filter -->
    <SearchFilter
      :result-count="filteredProblems.length"
      @change="onFilterChange"
    />

    <!-- Results -->
    <div class="search-results">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>{{ isZh ? '加载中...' : 'Loading...' }}</span>
      </div>

      <div v-else-if="filteredProblems.length === 0 && hasActiveFilters" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
          <line x1="8" y1="8" x2="14" y2="14"/>
          <line x1="14" y1="8" x2="8" y2="14"/>
        </svg>
        <p>{{ isZh ? '没有找到匹配的题目' : 'No matching problems found' }}</p>
        <button class="reset-link" @click="resetAll">{{ isZh ? '清除筛选条件' : 'Clear filters' }}</button>
      </div>

      <div v-else-if="filteredProblems.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <p>{{ isZh ? '输入关键词搜索题目' : 'Enter keywords to search problems' }}</p>
      </div>

      <div v-else class="results-list">
        <div
          v-for="problem in filteredProblems"
          :key="`${problem.chapterId}-${problem.probId}`"
          class="result-item"
          @click="goToProblem(problem)"
        >
          <div class="result-main">
            <span class="result-num font-mono">{{ problem.num }}</span>
            <span class="result-title">{{ problem.title }}</span>
            <span v-if="problem.isMember" class="lock-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
          </div>
          <div class="result-meta">
            <span class="result-chapter" :style="{color: getChapterColor(problem.chapterId)}">
              {{ problem.chapterTitle }}
            </span>
            <span class="result-rating" :class="ratingCls(problem.rating)">
              {{ problem.rating || '—' }}
            </span>
            <span v-if="isProblemDone(problem)" class="result-status done">
              {{ isZh ? '已做' : 'Done' }}
            </span>
            <span v-else-if="isInReview(problem)" class="result-status review">
              {{ isZh ? '复习' : 'Review' }}
            </span>
            <span v-else class="result-status todo">
              {{ isZh ? '未做' : 'Todo' }}
            </span>
          </div>
          <div v-if="problem.sectionH2" class="result-section">
            {{ problem.sectionH2 }}
            <span v-if="problem.sectionH3"> / {{ problem.sectionH3 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CHAPTERS } from '../composables/data.js'
import { useLang } from '../composables/i18n.js'
import { useReviewReminder } from '../composables/useReviewReminder.js'
import SearchFilter from '../components/SearchFilter.vue'
import { useSearchFilter } from '../composables/useSearchFilter.js'

const router = useRouter()
const { isZh } = useLang()

// Review reminder
const { reviews: reviewData, isDueForReview } = useReviewReminder()

// Search filter
const {
  searchQuery,
  debouncedSearchQuery,
  difficultyFilter,
  statusFilter,
  chapterFilter,
  filterProblems,
  hasActiveFilters,
  resetFilters
} = useSearchFilter()

// Data loading state
const isLoading = ref(true)
const mdCache = ref({})
const progress = ref({})

// Load all chapter data
onMounted(async () => {
  // Load progress
  try {
    progress.value = JSON.parse(localStorage.getItem('mc-algo-progress') || '{}')
  } catch {
    progress.value = {}
  }

  // Load all chapters
  await Promise.all(CHAPTERS.map(async (ch) => {
    if (!mdCache.value[ch.id]) {
      try {
        const r = await fetch(ch.file)
        if (r.ok) {
          const md = await r.text()
          mdCache.value[ch.id] = parseMdTables(md)
        }
      } catch (e) {
        console.warn(`Failed to load chapter ${ch.id}:`, e)
      }
    }
  }))

  isLoading.value = false
})

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

// Filtered problems across all chapters
// Use debouncedSearchQuery for proper reactivity after debounce delay
const filteredProblems = computed(() => {
  // Access debouncedSearchQuery to establish reactivity dependency
  const _ = debouncedSearchQuery.value
  return filterProblems(mdCache.value, progress.value, reviewData.value)
})

function onFilterChange() {
  // Filters are reactive, computed will update
}

function resetAll() {
  resetFilters()
}

function goToProblem(problem) {
  router.push(`/problem/${problem.chapterId}/${problem.probId}`)
}

function getChapterColor(chapterId) {
  const ch = CHAPTERS.find(c => c.id === chapterId)
  return ch ? ch.light : '#888'
}

function isProblemDone(problem) {
  const chapterProgress = progress.value[problem.chapterId]
  if (!chapterProgress) return false
  const probData = chapterProgress[problem.probId]
  if (typeof probData === 'object' && probData !== null) {
    return !!probData.checked
  }
  return !!probData
}

function isInReview(problem) {
  return !!reviewData.value[problem.chapterId]?.[problem.probId]
}

function ratingCls(r) {
  if (!r || r === '—') return 'r-none'
  const n = parseInt(r)
  if (isNaN(n)) return 'r-none'
  if (n < 1600) return 'r-low'
  if (n < 2000) return 'r-med'
  return 'r-high'
}
</script>

<style scoped>
.search-page {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.search-header {
  margin-bottom: 24px;
}

.page-title {
  font-family: 'Minecraft', 'Pixelify Sans', sans-serif;
  font-size: 1.8rem;
  color: var(--neon-primary);
  text-shadow: 0 0 10px var(--glow-primary);
  margin: 0 0 8px 0;
}

.page-desc {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0;
}

/* Results */
.search-results {
  margin-top: 16px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-muted);
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--glass-border);
  border-top-color: var(--neon-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state svg {
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 0.95rem;
}

.reset-link {
  background: none;
  border: none;
  color: var(--neon-primary);
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: underline;
}

.reset-link:hover {
  color: var(--neon-secondary);
}

/* Results List */
.results-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.result-item:hover {
  border-color: var(--neon-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.result-main {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.result-num {
  color: var(--text-muted);
  font-size: 0.85rem;
  min-width: 60px;
}

.result-title {
  color: var(--text-primary);
  font-weight: 500;
  flex: 1;
}

.lock-icon {
  color: var(--text-muted);
  display: flex;
  align-items: center;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.8rem;
}

.result-chapter {
  font-weight: 500;
}

.result-rating {
  font-family: 'Ubuntu Mono', monospace;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
}

.result-rating.r-none { color: var(--text-muted); }
.result-rating.r-low { color: #4ade80; }
.result-rating.r-med { color: #fbbf24; }
.result-rating.r-high { color: #f87171; }

.result-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.result-status.done {
  background: rgba(74, 222, 128, 0.15);
  color: #4ade80;
}

.result-status.review {
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
}

.result-status.todo {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-muted);
}

.result-section {
  margin-top: 6px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Responsive */
@media (max-width: 768px) {
  .search-page {
    padding: 16px;
  }

  .page-title {
    font-size: 1.4rem;
  }

  .result-meta {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>