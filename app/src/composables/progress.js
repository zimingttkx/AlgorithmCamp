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

export function getProgress(chapterId) {
  const raw = loadRaw()
  const totals = loadTotals()

  if (chapterId) {
    // chapter-level
    const checked = raw[chapterId] || {}
    const done = Object.values(checked).filter(Boolean).length
    const total = totals[chapterId] || Object.keys(checked).length || 1
    return { donePct: Math.round(done / total * 100), done, total }
  }

  // global — use _chapterTotals for real problem counts
  let done = 0, total = 0
  for (const ch of CHAPTERS) {
    const checked = raw[ch.id] || {}
    done += Object.values(checked).filter(Boolean).length
    total += totals[ch.id] || Object.keys(checked).length
  }
  const doneTotal = ref(done)
  const totalProblems = ref(total || 1)
  const donePct = computed(() => total ? Math.round(done / total * 100) : 0)
  return { doneTotal, totalProblems, donePct }
}
