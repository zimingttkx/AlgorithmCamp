/**
 * LeetCode Sync Composable
 * Syncs LeetCode solved problems with local progress
 *
 * Features:
 * - Auto-sync LeetCode solved problems to local progress
 * - Manual mark local problems as solved
 * - Sync status tracking (idle/syncing/synced/error/pending)
 * - LeetCode username binding
 */

import { ref, computed } from 'vue'

const LEETCODE_BIND_KEY = 'mc-leetcode-username'
const LAST_SYNC_KEY = 'mc-leetcode-last-sync'

// Singleton state
const leetcodeUsername = ref(localStorage.getItem(LEETCODE_BIND_KEY) || '')
const syncStatus = ref('idle') // idle | syncing | synced | error | pending
const syncError = ref('')
const lastSyncTime = ref(localStorage.getItem(LAST_SYNC_KEY) || null)
const leetcodeSolvedCount = ref(0)
const localMatchedCount = ref(0)

// API base URL
const API_BASE = import.meta.env.VITE_API_URL || ''

export function useLeetCodeSync() {

  /**
   * Bind a LeetCode username
   */
  function bindUsername(username) {
    leetcodeUsername.value = username
    localStorage.setItem(LEETCODE_BIND_KEY, username)
    syncStatus.value = 'pending'
  }

  /**
   * Unbind LeetCode username
   */
  function unbindUsername() {
    leetcodeUsername.value = ''
    localStorage.removeItem(LEETCODE_BIND_KEY)
    localStorage.removeItem(LAST_SYNC_KEY)
    syncStatus.value = 'idle'
    syncError.value = ''
    leetcodeSolvedCount.value = 0
    localMatchedCount.value = 0
  }

  /**
   * Get stored username
   */
  function getStoredUsername() {
    return localStorage.getItem(LEETCODE_BIND_KEY) || ''
  }

  /**
   * Fetch LeetCode solved problems from API
   */
  async function fetchLeetCodeSolved(username) {
    if (!username) return []

    try {
      const res = await fetch(`${API_BASE}/api/leetcode/${encodeURIComponent(username)}/solved`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to fetch' }))
        throw new Error(err.error || 'Failed to fetch solved problems')
      }
      const data = await res.json()
      return data.problems || []
    } catch (e) {
      console.error('[LeetCodeSync] Fetch error:', e)
      throw e
    }
  }

  /**
   * Normalize title for matching - remove special chars and lowercase
   */
  function normalizeTitle(title) {
    return title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '')
  }

  /**
   * Match LeetCode problem title/number with local problem
   * Returns true if matched
   */
  function isProblemMatched(leetProblem, localProblem) {
    const leetTitle = normalizeTitle(leetProblem.title)
    const leetSlug = leetProblem.titleSlug ? leetProblem.titleSlug.toLowerCase().replace(/-/g, '') : ''
    const localTitle = normalizeTitle(localProblem.title)
    const localNum = String(localProblem.num).replace(/[^a-zA-Z0-9]/g, '')

    // Match by exact normalized title
    if (localTitle === leetTitle) return true

    // Match by problem number (e.g., "1456" in title)
    if (localNum && leetTitle.includes(localNum)) return true

    // Match by slug similarity
    if (leetSlug && localTitle.length > 3) {
      if (leetSlug.includes(localTitle) || localTitle.includes(leetSlug)) return true
    }

    return false
  }

  /**
   * Sync LeetCode solved problems to local progress
   * @param {Object} mdCache - Map of chapterId -> sections array
   * @returns {Object} - { matched: number, total: number }
   */
  async function syncLeetCodeToProgress(mdCache) {
    if (!leetcodeUsername.value) {
      syncStatus.value = 'idle'
      return { matched: 0, total: 0 }
    }

    if (!mdCache || Object.keys(mdCache).length === 0) {
      syncStatus.value = 'error'
      syncError.value = '请先加载章节数据'
      return { matched: 0, total: 0 }
    }

    syncStatus.value = 'syncing'
    syncError.value = ''

    try {
      // Fetch LeetCode solved problems
      const solved = await fetchLeetCodeSolved(leetcodeUsername.value)
      leetcodeSolvedCount.value = solved.length

      // Build a flat index of all problems with their chapter info
      const problemIndex = [] // { chapterId, secIndex, rowIndex, prob, probId }

      for (const [chapterId, sections] of Object.entries(mdCache)) {
        for (const sec of sections) {
          for (const row of sec.rows || []) {
            problemIndex.push({
              chapterId,
              prob: row,
              probId: row.probId
            })
          }
        }
      }

      // Match and mark problems as solved
      const progress = getLocalProgress()
      let matched = 0

      for (const leetProb of solved) {
        for (const item of problemIndex) {
          if (isProblemMatched(leetProb, item.prob)) {
            // Already checked, skip
            if (progress[item.chapterId]?.[item.probId]?.checked) continue

            if (!progress[item.chapterId]) progress[item.chapterId] = {}
            progress[item.chapterId][item.probId] = {
              checked: true,
              checkedAt: new Date().toISOString(),
              source: 'leetcode'
            }
            matched++
            break // Found match, move to next LeetCode problem
          }
        }
      }

      // Save to localStorage
      localStorage.setItem('mc-algo-progress', JSON.stringify(progress))

      // Update sync status
      localMatchedCount.value = matched
      syncStatus.value = 'synced'
      lastSyncTime.value = new Date().toISOString()
      localStorage.setItem(LAST_SYNC_KEY, lastSyncTime.value)

      return { matched, total: solved.length }

    } catch (e) {
      console.error('[LeetCodeSync] Sync error:', e)
      syncStatus.value = 'error'
      syncError.value = e.message
      return { matched: 0, total: 0 }
    }
  }

  /**
   * Get local progress from localStorage
   */
  function getLocalProgress() {
    try {
      return JSON.parse(localStorage.getItem('mc-algo-progress') || '{}')
    } catch {
      return {}
    }
  }

  /**
   * Mark a single problem as solved manually
   */
  function markProblemSolved(chapterId, probId, solved = true) {
    const progress = getLocalProgress()
    if (!progress[chapterId]) progress[chapterId] = {}

    if (solved) {
      progress[chapterId][probId] = {
        checked: true,
        checkedAt: new Date().toISOString(),
        source: 'local'
      }
    } else {
      delete progress[chapterId][probId]
    }

    localStorage.setItem('mc-algo-progress', JSON.stringify(progress))
    syncStatus.value = 'pending' // Mark as pending since local change not yet synced to LeetCode
  }

  /**
   * Get sync status title for display
   */
  const syncStatusTitle = computed(() => {
    if (!leetcodeUsername.value) return '未绑定LeetCode'
    switch (syncStatus.value) {
      case 'idle': return '点击同步'
      case 'syncing': return '同步中...'
      case 'synced': return lastSyncTime.value ? `已同步 ${formatTime(lastSyncTime.value)}` : '已同步'
      case 'error': return `同步失败: ${syncError.value}`
      case 'pending': return '有本地更改未同步'
      default: return ''
    }
  })

  /**
   * Format ISO time to readable string
   */
  function formatTime(isoString) {
    if (!isoString) return ''
    const date = new Date(isoString)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    return date.toLocaleDateString('zh-CN')
  }

  /**
   * Check if sync is needed (has pending changes)
   */
  function needsSync() {
    return syncStatus.value === 'pending' || syncStatus.value === 'idle'
  }

  return {
    // State
    leetcodeUsername,
    syncStatus,
    syncError,
    lastSyncTime,
    leetcodeSolvedCount,
    localMatchedCount,

    // Methods
    bindUsername,
    unbindUsername,
    getStoredUsername,
    fetchLeetCodeSolved,
    syncLeetCodeToProgress,
    markProblemSolved,
    getLocalProgress,
    needsSync,

    // Computed
    syncStatusTitle,
  }
}
