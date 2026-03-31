import { ref, computed } from 'vue'
import { CHAPTERS } from './data.js'

const STORAGE_KEY = 'mc-algo-progress'

function loadRaw() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

export function getProgress(chapterId) {
  const raw = loadRaw()

  if (chapterId) {
    // chapter-level
    const checked = raw[chapterId] || {}
    const done = Object.values(checked).filter(Boolean).length
    const total = Object.keys(checked).length || 1
    return { donePct: Math.round(done / total * 100), done, total }
  }

  // global
  let done = 0, total = 0
  for (const ch of CHAPTERS) {
    const checked = raw[ch.id] || {}
    const vals = Object.values(checked)
    done += vals.filter(Boolean).length
    total += vals.length
  }
  const doneTotal = ref(done)
  const totalProblems = ref(total || 1)
  const donePct = computed(() => total ? Math.round(done / total * 100) : 0)
  return { doneTotal, totalProblems, donePct }
}
