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
const rawProgress = ref({})
const totalsData = ref({})

// Singleton refs for global progress - computed from reactive state
let globalDoneTotal = null
let globalTotalProblems = null
let globalDonePct = null

// Initialize progress data
function initProgress() {
  rawProgress.value = loadRaw()
  totalsData.value = loadTotals()
}

// Refresh progress from localStorage (call this when you know localStorage changed)
function refreshProgress() {
  rawProgress.value = loadRaw()
  totalsData.value = loadTotals()
}

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

  // global - ensure we have fresh data
  initProgress()
  
  // Create singleton computed refs on first call
  if (!globalDoneTotal) {
    globalDoneTotal = computed(() => {
      const raw = rawProgress.value
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
    
    globalTotalProblems = computed(() => {
      const raw = rawProgress.value
      const totals = totalsData.value
      let total = 0
      for (const ch of CHAPTERS) {
        total += totals[ch.id] || ch.count || Object.keys(raw[ch.id] || {}).length
      }
      return total || 1
    })
    
    globalDonePct = computed(() => {
      const total = globalTotalProblems.value
      const done = globalDoneTotal.value
      return total ? Math.round(done / total * 100) : 0
    })
  }

  return {
    doneTotal: globalDoneTotal,
    totalProblems: globalTotalProblems,
    donePct: globalDonePct
  }
}

export { refreshProgress }
