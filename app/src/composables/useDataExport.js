/**
 * Data Export Composable
 * Handles exporting and importing practice data in JSON/CSV formats
 * Provides backup and restore functionality
 *
 * Features:
 * - Export practice records to JSON
 * - Export practice records to CSV
 * - Export progress data
 * - Backup all localStorage data
 * - Restore from backup
 */

import { ref, computed } from 'vue'
import { CHAPTERS } from './data.js'

// Storage keys used by the app
const STORAGE_KEYS = {
  PROGRESS: 'mc-algo-progress',
  CHAPTER_TOTALS: '_chapterTotals',
  PRACTICE_GOALS: 'mc-algo-practice-goals',
  PRACTICE_HISTORY: 'mc-algo-practice-history',
  STREAK: 'mc-algo-streak',
  LEETCODE_USERNAME: 'mc-algo-leetcode-username',
  LEETCODE_SYNC: 'mc-algo-leetcode-sync',
  REVIEWS: 'mc-algo-reviews',
  REVIEW_REMINDER: 'mc-algo-reviews',
  PROBLEM_NOTES: 'mc-algo-problem-notes',
  PROBLEM_FAVORITES: 'mc-algo-problem-favorites',
  BLOG_POSTS: 'mc-algo-blog-posts'
}

const BACKUP_VERSION = '1.0'

/**
 * Load data from localStorage by key
 */
function loadFromStorage(key) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

/**
 * Save data to localStorage
 */
function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

/**
 * Get all stored data as an object
 */
function getAllStoredData() {
  const data = {}
  for (const [name, key] of Object.entries(STORAGE_KEYS)) {
    const value = loadFromStorage(key)
    if (value !== null) {
      data[key] = value
    }
  }
  // Also get any other mc-algo-* keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.startsWith('mc-algo-') && !data[key]) {
      const value = loadFromStorage(key)
      if (value !== null) {
        data[key] = value
      }
    }
  }
  return data
}

export function useDataExport() {
  const isExporting = ref(false)
  const isImporting = ref(false)
  const lastExportDate = ref(null)
  const lastImportDate = ref(null)
  const exportMessage = ref('')
  const importMessage = ref('')

  /**
   * Get summary of all stored data
   */
  const dataSummary = computed(() => {
    const allData = getAllStoredData()
    const summary = {
      totalKeys: Object.keys(allData).length,
      hasProgress: !!allData[STORAGE_KEYS.PROGRESS],
      hasGoals: !!allData[STORAGE_KEYS.PRACTICE_GOALS],
      hasHistory: !!allData[STORAGE_KEYS.PRACTICE_HISTORY],
      hasStreak: !!allData[STORAGE_KEYS.STREAK],
      hasReviewReminder: !!allData[STORAGE_KEYS.REVIEW_REMINDER],
      hasProblemNotes: !!allData[STORAGE_KEYS.PROBLEM_NOTES],
      hasProblemFavorites: !!allData[STORAGE_KEYS.PROBLEM_FAVORITES],
      hasLeetCode: !!allData[STORAGE_KEYS.LEETCODE_USERNAME]
    }

    // Count solved problems
    let solvedCount = 0
    const progress = allData[STORAGE_KEYS.PROGRESS]
    if (progress) {
      for (const chapterId of Object.keys(progress)) {
        const chapter = progress[chapterId]
        for (const probId of Object.keys(chapter)) {
          const problem = chapter[probId]
          if (typeof problem === 'object' && problem?.checked) {
            solvedCount++
          } else if (typeof problem === 'boolean' && problem) {
            solvedCount++
          }
        }
      }
    }
    summary.solvedProblems = solvedCount

    // Count notes and favorites
    const notes = allData[STORAGE_KEYS.PROBLEM_NOTES] || {}
    const favorites = allData[STORAGE_KEYS.PROBLEM_FAVORITES] || {}
    summary.problemNotesCount = Object.keys(notes).length
    summary.problemFavoritesCount = Object.keys(favorites).length

    return summary
  })

  /**
   * Convert progress data to structured array format
   */
  function progressToArray() {
    const allData = getAllStoredData()
    const progress = allData[STORAGE_KEYS.PROGRESS] || {}
    const results = []

    for (const chapterId of Object.keys(progress)) {
      const chapter = progress[chapterId]
      const chapterInfo = CHAPTERS.find(ch => ch.id === chapterId)
      const chapterTitle = chapterInfo?.title || chapterId

      for (const probId of Object.keys(chapter)) {
        const problem = chapter[probId]
        const isChecked = typeof problem === 'object' ? problem?.checked : !!problem

        results.push({
          chapterId,
          chapterTitle,
          problemId: probId,
          status: isChecked ? 'solved' : 'attempted',
          solvedAt: typeof problem === 'object' && problem?.solvedAt ? problem.solvedAt : null
        })
      }
    }

    return results
  }

  /**
   * Export progress data as JSON
   */
  function exportProgressJSON() {
    isExporting.value = true
    exportMessage.value = ''

    try {
      const progressArray = progressToArray()
      const exportData = {
        version: BACKUP_VERSION,
        exportDate: new Date().toISOString(),
        type: 'progress',
        data: progressArray
      }

      const jsonStr = JSON.stringify(exportData, null, 2)
      downloadFile(jsonStr, 'algorithmcamp-progress.json', 'application/json')
      lastExportDate.value = new Date().toISOString()
      exportMessage.value = 'Progress exported successfully!'
    } catch (error) {
      exportMessage.value = `Export failed: ${error.message}`
    } finally {
      isExporting.value = false
    }
  }

  /**
   * Export progress data as CSV
   */
  function exportProgressCSV() {
    isExporting.value = true
    exportMessage.value = ''

    try {
      const progressArray = progressToArray()

      // CSV header
      const headers = ['Chapter ID', 'Chapter Title', 'Problem ID', 'Status', 'Solved At']
      const rows = progressArray.map(p => [
        p.chapterId,
        `"${p.chapterTitle.replace(/"/g, '""')}"`,
        p.problemId,
        p.status,
        p.solvedAt || ''
      ])

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      downloadFile(csvContent, 'algorithmcamp-progress.csv', 'text/csv')
      lastExportDate.value = new Date().toISOString()
      exportMessage.value = 'Progress exported as CSV successfully!'
    } catch (error) {
      exportMessage.value = `Export failed: ${error.message}`
    } finally {
      isExporting.value = false
    }
  }

  /**
   * Export all data as JSON backup
   */
  function exportBackupJSON() {
    isExporting.value = true
    exportMessage.value = ''

    try {
      const allData = getAllStoredData()
      const backup = {
        version: BACKUP_VERSION,
        exportDate: new Date().toISOString(),
        type: 'backup',
        data: allData
      }

      const jsonStr = JSON.stringify(backup, null, 2)
      const filename = `algorithmcamp-backup-${new Date().toISOString().split('T')[0]}.json`
      downloadFile(jsonStr, filename, 'application/json')
      lastExportDate.value = new Date().toISOString()
      exportMessage.value = 'Backup exported successfully!'
    } catch (error) {
      exportMessage.value = `Backup failed: ${error.message}`
    } finally {
      isExporting.value = false
    }
  }

  /**
   * Import data from JSON backup
   */
  function importBackupJSON(file) {
    return new Promise((resolve, reject) => {
      isImporting.value = true
      importMessage.value = ''

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target.result)

          // Validate backup structure
          if (!backup.version || !backup.data) {
            throw new Error('Invalid backup file format')
          }

          // Confirm before overwriting
          const keyCount = Object.keys(backup.data).length
          if (confirm(`This will import ${keyCount} data entries and may overwrite existing data. Continue?`)) {
            // Restore each key
            for (const [key, value] of Object.entries(backup.data)) {
              saveToStorage(key, value)
            }
            lastImportDate.value = new Date().toISOString()
            importMessage.value = `Successfully imported ${keyCount} data entries!`
            resolve(true)
          } else {
            importMessage.value = 'Import cancelled by user'
            resolve(false)
          }
        } catch (error) {
          importMessage.value = `Import failed: ${error.message}`
          reject(error)
        } finally {
          isImporting.value = false
        }
      }

      reader.onerror = () => {
        importMessage.value = 'Failed to read file'
        isImporting.value = false
        reject(new Error('Failed to read file'))
      }

      reader.readAsText(file)
    })
  }

  /**
   * Import progress from JSON file (merge with existing)
   */
  function importProgressJSON(file) {
    return new Promise((resolve, reject) => {
      isImporting.value = true
      importMessage.value = ''

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result)

          if (importData.type !== 'progress' || !Array.isArray(importData.data)) {
            throw new Error('Invalid progress file format')
          }

          // Get existing progress
          const existingProgress = loadFromStorage(STORAGE_KEYS.PROGRESS) || {}
          let mergedCount = 0

          for (const item of importData.data) {
            if (!existingProgress[item.chapterId]) {
              existingProgress[item.chapterId] = {}
            }
            if (item.status === 'solved') {
              existingProgress[item.chapterId][item.problemId] = {
                checked: true,
                solvedAt: item.solvedAt || new Date().toISOString()
              }
              mergedCount++
            }
          }

          saveToStorage(STORAGE_KEYS.PROGRESS, existingProgress)
          lastImportDate.value = new Date().toISOString()
          importMessage.value = `Merged ${mergedCount} solved problems!`
          resolve(true)
        } catch (error) {
          importMessage.value = `Import failed: ${error.message}`
          reject(error)
        } finally {
          isImporting.value = false
        }
      }

      reader.onerror = () => {
        importMessage.value = 'Failed to read file'
        isImporting.value = false
        reject(new Error('Failed to read file'))
      }

      reader.readAsText(file)
    })
  }

  /**
   * Download file to user's computer
   */
  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Clear all app data
   */
  function clearAllData() {
    if (confirm('Are you sure you want to delete ALL app data? This cannot be undone!')) {
      if (confirm('This will permanently delete all your progress, notes, goals, and settings. Continue?')) {
        for (const key of Object.values(STORAGE_KEYS)) {
          localStorage.removeItem(key)
        }
        // Also remove any other mc-algo-* keys
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key.startsWith('mc-algo-')) {
            keysToRemove.push(key)
          }
        }
        for (const key of keysToRemove) {
          localStorage.removeItem(key)
        }
        importMessage.value = 'All data cleared!'
        return true
      }
    }
    importMessage.value = 'Data clear cancelled'
    return false
  }

  return {
    // State
    isExporting,
    isImporting,
    lastExportDate,
    lastImportDate,
    exportMessage,
    importMessage,

    // Computed
    dataSummary,

    // Methods
    exportProgressJSON,
    exportProgressCSV,
    exportBackupJSON,
    importBackupJSON,
    importProgressJSON,
    clearAllData,
    progressToArray
  }
}