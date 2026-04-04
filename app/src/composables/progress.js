import { ref, computed } from 'vue'
import { CHAPTERS } from './data.js'

const STORAGE_KEY = 'mc-algo-progress'
const TOTALS_KEY = '_chapterTotals'

function loadRaw() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

function loadTotals() {
  try { return JSON.parse(localStorage.getItem(TOTALS_KEY) || '{}') } catch { return {} }
}

// Singleton reactive state for global progress - ensures UI updates reactively
const progressData = ref({})
const totalsData = ref({})

// Initialize progress data from localStorage
function initProgress() {
  progressData.value = loadRaw()
  totalsData.value = loadTotals()
}

// Refresh progress from localStorage (call this when you know localStorage changed)
function refreshProgress() {
  progressData.value = loadRaw()
  totalsData.value = loadTotals()
}

// Set progress data (call this when server data loads to update reactive state)
function setProgress(data) {
  progressData.value = data || {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data || {}))
}

// Set totals data
function setTotals(data) {
  totalsData.value = data || {}
  localStorage.setItem(TOTALS_KEY, JSON.stringify(data || {}))
}

export function useProgress() {
  // Initialize on first use
  if (Object.keys(progressData.value).length === 0) {
    initProgress()
  }

  // Computed totals
  const doneTotal = computed(() => {
    const raw = progressData.value
    let done = 0
    for (const ch of CHAPTERS) {
      const checked = raw[ch.id] || {}
      done += Object.values(checked).filter(v => {
        if (typeof v === 'object' && v !== null) return !!v.checked
        return !!v
      }).length
    }
    return done
  })

  const totalProblems = computed(() => {
    const raw = progressData.value
    const totals = totalsData.value
    let total = 0
    for (const ch of CHAPTERS) {
      total += totals[ch.id] || ch.count || Object.keys(raw[ch.id] || {}).length
    }
    return total || 1
  })

  const donePct = computed(() => {
    const total = totalProblems.value
    const done = doneTotal.value
    return total ? Math.round(done / total * 100) : 0
  })

  return {
    progressData,
    totalsData,
    doneTotal,
    totalProblems,
    donePct,
    setProgress,
    setTotals,
    refreshProgress
  }
}

// Legacy export for backward compatibility
export function getProgress(chapterId) {
  if (chapterId) {
    // chapter-level - return plain values for specific chapter
    const raw = loadRaw()
    const totals = loadTotals()
    const checked = raw[chapterId] || {}
    const done = Object.values(checked).filter(v => {
      if (typeof v === 'object' && v !== null) return !!v.checked
      return !!v
    }).length
    const total = totals[chapterId] || Object.keys(checked).length || 1
    return { donePct: Math.round(done / total * 100), done, total }
  }

  // global - use the new useProgress hook
  const { doneTotal, totalProblems, donePct } = useProgress()
  return { doneTotal, totalProblems, donePct }
}

export { refreshProgress }
