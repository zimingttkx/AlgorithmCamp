/**
 * Problem Metadata Composable
 * Loads and caches problem data from chapter markdown files
 * Provides access to problem metadata including difficulty ratings
 */

import { ref } from 'vue'
import { CHAPTERS } from './data.js'

const metadataCache = ref({})
const isLoading = ref(false)
const loadError = ref(null)

// Parse markdown tables to extract problem data
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

// Load all chapter metadata
async function loadAllMetadata() {
  if (Object.keys(metadataCache.value).length > 0) {
    return metadataCache.value // Already loaded
  }

  isLoading.value = true
  loadError.value = null

  try {
    // Determine base path for fetching chapter files
    const basePath = import.meta.env.BASE_URL || '/'

    const results = await Promise.all(
      CHAPTERS.map(async (ch) => {
        try {
          // Construct absolute path for the chapter file
          const filePath = ch.file.startsWith('/') ? ch.file : `${basePath}${ch.file}`
          const response = await fetch(filePath)
          if (!response.ok) return { chapterId: ch.id, sections: [] }
          const md = await response.text()
          return { chapterId: ch.id, sections: parseMdTables(md) }
        } catch (e) {
          console.error(`Failed to load chapter ${ch.id}:`, e)
          return { chapterId: ch.id, sections: [] }
        }
      })
    )

    // Build the cache
    const cache = {}
    for (const result of results) {
      cache[result.chapterId] = result.sections
    }

    metadataCache.value = cache
    return cache
  } catch (e) {
    loadError.value = e.message
    console.error('Failed to load problem metadata:', e)
    return {}
  } finally {
    isLoading.value = false
  }
}

// Get problem metadata by chapter and problem ID
function getProblem(chapterId, probId) {
  const sections = metadataCache.value[chapterId]
  if (!sections) return null

  for (const sec of sections) {
    for (const row of sec.rows || []) {
      if (row.probId === probId) {
        return row
      }
    }
  }
  return null
}

// Get difficulty classification from rating
function getDifficultyFromRating(rating) {
  if (!rating || rating === '—') return 'medium' // Default to medium if no rating
  const r = parseInt(rating)
  if (isNaN(r)) return 'medium'
  if (r < 1600) return 'easy'
  if (r < 2000) return 'medium'
  return 'hard'
}

// Get all problems for a chapter
function getChapterProblems(chapterId) {
  const sections = metadataCache.value[chapterId]
  if (!sections) return []

  const problems = []
  for (const sec of sections) {
    for (const row of sec.rows || []) {
      problems.push(row)
    }
  }
  return problems
}

export function useProblemMetadata() {
  return {
    metadataCache,
    isLoading,
    loadError,
    loadAllMetadata,
    getProblem,
    getDifficultyFromRating,
    getChapterProblems
  }
}