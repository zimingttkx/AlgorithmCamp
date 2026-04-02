<template>
  <div class="search-filter-container">
    <!-- Search Bar -->
    <div class="search-bar">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          :placeholder="isZh ? '搜索题目名称或题号...' : 'Search by name or number...'"
          @input="onSearchInput"
        />
        <button v-if="searchQuery" class="search-clear" @click="clearSearch">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Filter Row -->
    <div class="filter-row">
      <!-- Difficulty Filter -->
      <div class="filter-group">
        <label class="filter-label">{{ isZh ? '难度' : 'Difficulty' }}</label>
        <div class="filter-chips">
          <button
            v-for="level in difficultyLevels"
            :key="level.value"
            class="filter-chip"
            :class="[level.class, { active: difficultyFilter === level.value }]"
            @click="setDifficulty(level.value)"
          >
            {{ level.label }}
          </button>
        </div>
      </div>

      <!-- Status Filter -->
      <div class="filter-group">
        <label class="filter-label">{{ isZh ? '状态' : 'Status' }}</label>
        <div class="filter-chips">
          <button
            v-for="status in statusLevels"
            :key="status.value"
            class="filter-chip"
            :class="[status.class, { active: statusFilter === status.value }]"
            @click="setStatus(status.value)"
          >
            {{ status.label }}
          </button>
        </div>
      </div>

      <!-- Chapter Filter -->
      <div class="filter-group filter-group-chapter">
        <label class="filter-label">{{ isZh ? '章节' : 'Chapter' }}</label>
        <select v-model="chapterFilter" class="filter-select" @change="onChapterChange">
          <option :value="null">{{ isZh ? '全部章节' : 'All Chapters' }}</option>
          <option v-for="ch in CHAPTERS" :key="ch.id" :value="ch.id">
            {{ ch.short }}
          </option>
        </select>
      </div>

      <!-- Reset Button -->
      <button
        v-if="hasActiveFilters"
        class="reset-btn"
        @click="resetAll"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
        {{ isZh ? '重置' : 'Reset' }}
      </button>
    </div>

    <!-- Results Count -->
    <div v-if="hasActiveFilters" class="results-info">
      <span class="results-count">
        {{ isZh ? '找到' : 'Found' }} <strong>{{ resultCount }}</strong>
        {{ isZh ? '道题目' : 'problems' }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { CHAPTERS } from '../composables/data.js'
import { useLang } from '../composables/i18n.js'
import { useSearchFilter } from '../composables/useSearchFilter.js'
import { useDebounce } from '../composables/useDebounce.js'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  resultCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const { isZh } = useLang()

const {
  searchQuery,
  difficultyFilter,
  statusFilter,
  chapterFilter,
  DIFFICULTY_LEVELS,
  STATUS_FILTERS,
  resetFilters,
  hasActiveFilters
} = useSearchFilter()

// Debounce search input to reduce filter operations (150ms delay)
const { debouncedFn: debouncedEmitChange, cancel: cancelDebounce } = useDebounce(() => {
  emitChange()
}, 150)

// Sync with parent
watch(() => props.modelValue, (val) => {
  if (val.searchQuery !== undefined) searchQuery.value = val.searchQuery
  if (val.difficultyFilter !== undefined) difficultyFilter.value = val.difficultyFilter
  if (val.statusFilter !== undefined) statusFilter.value = val.statusFilter
  if (val.chapterFilter !== undefined) chapterFilter.value = val.chapterFilter
}, { immediate: true, deep: true })

// Emit changes to parent (debounced for search)
function emitChange() {
  emit('update:modelValue', {
    searchQuery: searchQuery.value,
    difficultyFilter: difficultyFilter.value,
    statusFilter: statusFilter.value,
    chapterFilter: chapterFilter.value
  })
  emit('change')
}

function onSearchInput() {
  // Debounce search input changes
  debouncedEmitChange()
}

function onChapterChange() {
  // Chapter changes are immediate (not debounced)
  emitChange()
}

function setDifficulty(value) {
  difficultyFilter.value = difficultyFilter.value === value ? DIFFICULTY_LEVELS.NONE : value
  emitChange()
}

function setStatus(value) {
  statusFilter.value = statusFilter.value === value ? STATUS_FILTERS.ALL : value
  emitChange()
}

function clearSearch() {
  searchQuery.value = ''
  emitChange()
}

function resetAll() {
  resetFilters()
  emitChange()
}

// Cleanup debounce on unmount
onUnmounted(() => {
  cancelDebounce()
})

// Difficulty levels for chips
const difficultyLevels = computed(() => [
  { value: DIFFICULTY_LEVELS.LOW, label: isZh.value ? '简单' : 'Easy', class: 'chip-easy' },
  { value: DIFFICULTY_LEVELS.MED, label: isZh.value ? '中等' : 'Medium', class: 'chip-medium' },
  { value: DIFFICULTY_LEVELS.HIGH, label: isZh.value ? '困难' : 'Hard', class: 'chip-hard' }
])

// Status levels for chips
const statusLevels = computed(() => [
  { value: STATUS_FILTERS.NOT_STARTED, label: isZh.value ? '未做' : 'Todo', class: 'chip-todo' },
  { value: STATUS_FILTERS.DONE, label: isZh.value ? '已做' : 'Done', class: 'chip-done' },
  { value: STATUS_FILTERS.REVIEW, label: isZh.value ? '复习' : 'Review', class: 'chip-review' }
])
</script>

<style scoped>
.search-filter-container {
  background: var(--glass-bg, rgba(20, 20, 30, 0.8));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

/* Search Bar */
.search-bar {
  margin-bottom: 12px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-muted, #888);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 42px;
  background: var(--input-bg, rgba(0, 0, 0, 0.3));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  border-radius: 8px;
  color: var(--text-primary, #fff);
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--neon-primary, #00ff88);
  box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.2);
}

.search-input::placeholder {
  color: var(--text-muted, #888);
}

.search-clear {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: var(--text-muted, #888);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.search-clear:hover {
  color: var(--text-primary, #fff);
  background: rgba(255, 255, 255, 0.1);
}

/* Filter Row */
.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group-chapter {
  flex: 0 0 auto;
}

.filter-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted, #888);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Filter Chips */
.filter-chips {
  display: flex;
  gap: 6px;
}

.filter-chip {
  padding: 6px 12px;
  background: var(--chip-bg, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  border-radius: 16px;
  color: var(--text-secondary, #ccc);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-chip:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.filter-chip.active {
  border-color: transparent;
  color: #fff;
}

.filter-chip.active.chip-easy {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-color: #22c55e;
}

.filter-chip.active.chip-medium {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border-color: #f59e0b;
}

.filter-chip.active.chip-hard {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-color: #ef4444;
}

.filter-chip.active.chip-todo {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border-color: #6366f1;
}

.filter-chip.active.chip-done {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-color: #22c55e;
}

.filter-chip.active.chip-review {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border-color: #8b5cf6;
}

/* Filter Select */
.filter-select {
  padding: 6px 28px 6px 10px;
  background: var(--chip-bg, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  border-radius: 8px;
  color: var(--text-primary, #fff);
  font-size: 12px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  min-width: 100px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--neon-primary, #00ff88);
}

.filter-select option {
  background: var(--bg-primary, #1a1a2e);
  color: var(--text-primary, #fff);
}

/* Reset Button */
.reset-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  border-radius: 8px;
  color: var(--text-muted, #888);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: auto;
}

.reset-btn:hover {
  border-color: var(--neon-primary, #00ff88);
  color: var(--neon-primary, #00ff88);
}

/* Results Info */
.results-info {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
}

.results-count {
  font-size: 13px;
  color: var(--text-muted, #888);
}

.results-count strong {
  color: var(--neon-primary, #00ff88);
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    width: 100%;
  }

  .filter-chips {
    flex-wrap: wrap;
  }

  .reset-btn {
    margin-left: 0;
    justify-content: center;
  }
}
</style>