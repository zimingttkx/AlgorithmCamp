/**
 * Progress Sync Composable
 * Database-backed sync with conflict resolution
 *
 * Key guarantees:
 * - localStorage is always the immediate source of truth for UI
 * - Server is updated async via debounced PUT
 * - In-flight PUT requests are cancelled when new ones are triggered (AbortController)
 * - Failed syncs are queued for retry
 * - Smart merge: checked problems from both local and server are preserved
 */

import { ref } from 'vue'
import { useAuth } from './auth.js'

const API_BASE = import.meta.env.VITE_API_URL || ''
const PROGRESS_KEY = 'mc-algo-progress'
const SYNC_DEBOUNCE_MS = 3000
const MAX_RETRIES = 3

// Singleton state
const syncStatus = ref('idle') // idle | syncing | success | error
const syncError = ref('')
let currentAbortController = null
let retryCount = 0

export function useProgressSync() {
  const { apiFetch, isLoggedIn } = useAuth()

  let debounceTimer = null

  /**
   * Cancel any in-flight PUT request to prevent out-of-order response races
   */
  function cancelInFlight() {
    if (currentAbortController) {
      currentAbortController.abort()
      currentAbortController = null
    }
  }

  /**
   * Load progress from server and MERGE with localStorage (smart union).
   * For each problem: if checked in either local OR server → keep checked.
   * This is called on mount when user is logged in.
   */
  async function loadFromServer() {
    if (!isLoggedIn.value) return null

    syncStatus.value = 'syncing'
    syncError.value = ''

    try {
      const res = await apiFetch('/api/progress')
      if (!res || !res.ok) {
        if (res === null) {
          syncStatus.value = 'idle'
          return null
        }
        throw new Error('failed to load progress')
      }

      const data = await res.json()
      const serverProgress = data.progress || {}

      // Get local progress for merge
      const localProgress = getLocalProgress()

      // Smart merge: union of checked problems
      const merged = smartMerge(localProgress, serverProgress)

      // Save merged result to localStorage
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(merged))

      syncStatus.value = 'success'
      retryCount = 0
      return serverProgress
    } catch (e) {
      console.error('[ProgressSync] Load error:', e)
      syncStatus.value = 'error'
      syncError.value = e.message
      return null
    }
  }

  /**
   * Smart merge: union of checked problems from local and server.
   * A problem is checked if it's checked in EITHER local or server.
   * For boolean-only local format, we use current timestamp as checkedAt.
   */
  function smartMerge(local, server) {
    const result = {}

    // Collect all chapter IDs from both sources
    const allChapters = new Set([
      ...Object.keys(local || {}),
      ...Object.keys(server || {})
    ])

    for (const chId of allChapters) {
      result[chId] = {}
      const localProblems = local?.[chId] || {}
      const serverProblems = server?.[chId] || {}
      const allProblems = new Set([
        ...Object.keys(localProblems),
        ...Object.keys(serverProblems)
      ])

      for (const probId of allProblems) {
        const localVal = localProblems[probId]
        const serverVal = serverProblems[probId]

        // Normalize to boolean
        const localChecked = typeof localVal === 'object' ? !!localVal.checked : !!localVal
        const serverChecked = typeof serverVal === 'object' ? !!serverVal.checked : !!serverVal

        // Union: if checked in either → keep checked
        if (localChecked || serverChecked) {
          // Normalize timestamps to numbers for comparison
          const localTime = typeof localVal === 'object' && localVal.checkedAt
            ? new Date(localVal.checkedAt).getTime()
            : Date.now()
          const serverTime = typeof serverVal === 'object' && serverVal.checkedAt
            ? new Date(serverVal.checkedAt).getTime()
            : 0

          // Only compare timestamps when BOTH agree on checked=true
          // Otherwise, prefer the one that IS checked (union principle)
          let newerVal
          if (localChecked && serverChecked) {
            // Both have checked=true - use newer timestamp to preserve most recent action
            newerVal = serverTime > localTime ? serverVal : localVal
          } else {
            // Only one is checked - use that one (union: checked wins)
            newerVal = localChecked ? localVal : serverVal
          }
          result[chId][probId] = newerVal
        }
      }
    }

    return result
  }

  /**
   * Save progress to server (debounced).
   * Uses AbortController to cancel any in-flight request.
   * On failure: retries up to MAX_RETRIES times with exponential backoff.
   */
  async function saveProgress(progress) {
    if (!isLoggedIn.value) return

    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    syncStatus.value = 'idle'
    syncError.value = ''

    debounceTimer = setTimeout(async () => {
      syncStatus.value = 'syncing'
      syncError.value = ''

      await doSaveWithRetry(progress, 0)
    }, SYNC_DEBOUNCE_MS)
  }

  async function doSaveWithRetry(progress, attempt) {
    // Cancel any existing in-flight request
    cancelInFlight()

    const controller = new AbortController()
    currentAbortController = controller

    try {
      const res = await apiFetch('/api/progress', {
        method: 'PUT',
        body: JSON.stringify({ progress }),
        signal: controller.signal
      })

      currentAbortController = null

      if (!res || !res.ok) {
        throw new Error('sync failed')
      }

      syncStatus.value = 'success'
      retryCount = 0
    } catch (e) {
      currentAbortController = null

      if (e.name === 'AbortError') {
        // Request was cancelled — this is expected when a newer request is triggered
        return
      }

      console.error(`[ProgressSync] Save attempt ${attempt + 1} failed:`, e.message)

      if (attempt < MAX_RETRIES - 1) {
        const backoff = Math.min(1000 * Math.pow(2, attempt), 10000)
        syncStatus.value = `retry`
        await new Promise(r => setTimeout(r, backoff))
        return doSaveWithRetry(progress, attempt + 1)
      }

      syncStatus.value = 'error'
      syncError.value = e.message
      retryCount = attempt + 1
    }
  }

  /**
   * Force immediate sync (bypass debounce). Cancels any pending request.
   */
  async function forceSyncNow(progress) {
    if (!isLoggedIn.value) return

    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }

    cancelInFlight()
    syncStatus.value = 'syncing'
    syncError.value = ''

    const controller = new AbortController()
    currentAbortController = controller

    try {
      const res = await apiFetch('/api/progress', {
        method: 'PUT',
        body: JSON.stringify({ progress }),
        signal: controller.signal
      })

      currentAbortController = null

      if (!res || !res.ok) {
        throw new Error('sync failed')
      }

      syncStatus.value = 'success'
      retryCount = 0
    } catch (e) {
      currentAbortController = null

      if (e.name === 'AbortError') {
        return
      }

      console.error('[ProgressSync] Force sync failed:', e.message)
      syncStatus.value = 'error'
      syncError.value = e.message
    }
  }

  /**
   * Get progress from localStorage (offline / unauthenticated fallback)
   */
  function getLocalProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}')
    } catch {
      return {}
    }
  }

  /**
   * Check if user has existing local progress data (for migration prompt)
   */
  function hasLocalProgress() {
    const progress = getLocalProgress()
    return Object.keys(progress).length > 0 &&
      Object.values(progress).some(ch => Object.keys(ch).length > 0)
  }

  /**
   * Upload existing local progress to server (migration from old system).
   * Uses forceSyncNow to bypass debounce for immediate migration.
   */
  async function migrateLocalProgress() {
    const localProgress = getLocalProgress()
    if (!localProgress || Object.keys(localProgress).length === 0) return false

    // Cancel any pending sync first
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    cancelInFlight()

    syncStatus.value = 'syncing'
    retryCount = 0

    try {
      const res = await apiFetch('/api/progress', {
        method: 'PUT',
        body: JSON.stringify({ progress: localProgress })
      })

      if (!res || !res.ok) {
        throw new Error('migration failed')
      }

      syncStatus.value = 'success'
      return true
    } catch (e) {
      console.error('[ProgressSync] Migration error:', e)
      syncStatus.value = 'error'
      syncError.value = e.message
      return false
    }
  }

  /**
   * Push local progress to server (used after smart merge on mount)
   */
  async function pushMergedProgress(mergedProgress) {
    if (!isLoggedIn.value) return

    cancelInFlight()
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }

    syncStatus.value = 'syncing'
    try {
      const res = await apiFetch('/api/progress', {
        method: 'PUT',
        body: JSON.stringify({ progress: mergedProgress })
      })
      if (!res || !res.ok) throw new Error('push failed')
      syncStatus.value = 'success'
    } catch (e) {
      syncStatus.value = 'error'
      syncError.value = e.message
    }
  }

  return {
    syncStatus,
    syncError,
    loadFromServer,
    saveProgress,
    forceSyncNow,
    getLocalProgress,
    hasLocalProgress,
    migrateLocalProgress,
    pushMergedProgress,
    smartMerge
  }
}
