import { ref } from 'vue'

const TOKEN_KEY = 'mc-gist-token'
const GIST_ID_KEY = 'mc-gist-id'
const GIST_FILENAME = 'algo-progress.json'
const META_KEY = '_meta'
const GIST_DESC = 'AlgorithmCamp Progress Sync'

const syncStatus = ref('idle')
const syncError = ref('')
const gistToken = ref(localStorage.getItem(TOKEN_KEY) || '')
const gistId = ref(localStorage.getItem(GIST_ID_KEY) || '')

let debounceTimer = null

// Generate a stable device ID (random, persisted in localStorage)
const DEVICE_KEY = 'mc-device-id'
function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY)
  if (!id) {
    id = 'dev-' + Math.random().toString(36).slice(2, 10)
    localStorage.setItem(DEVICE_KEY, id)
  }
  return id
}
const deviceId = getDeviceId()

export function useSync() {

  function saveToken(token) {
    gistToken.value = token
    localStorage.setItem(TOKEN_KEY, token)
  }

  function saveGistId(id) {
    gistId.value = id
    localStorage.setItem(GIST_ID_KEY, id)
  }

  function clearSync() {
    gistToken.value = ''
    gistId.value = ''
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(GIST_ID_KEY)
    syncStatus.value = 'idle'
    syncError.value = ''
  }

  function headers() {
    return {
      'Authorization': `token ${gistToken.value}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    }
  }

  // Update _meta for a specific chapter
  function touchChapter(progress, chId) {
    if (!progress[META_KEY]) progress[META_KEY] = {}
    const chData = progress[chId] || {}
    const done = Object.values(chData).filter(Boolean).length
    progress[META_KEY][chId] = {
      mtime: Date.now(),
      done,
      dev: deviceId,
    }
  }

  // Look for an existing gist for this app
  async function findExistingGist() {
    try {
      const r = await fetch('https://api.github.com/gists?per_page=100', {
        headers: headers(),
      })
      if (!r.ok) return null
      const gists = await r.json()
      const existing = gists.find(g =>
        g.description === GIST_DESC &&
        g.files?.[GIST_FILENAME]
      )
      return existing || null
    } catch {
      return null
    }
  }

  // Create a new private gist (or reuse existing)
  async function initGist(token) {
    // Set ref temporarily for headers() — don't persist yet
    gistToken.value = token
    syncStatus.value = 'syncing'
    syncError.value = ''

    try {
      // First check if an existing gist exists for this app
      const existing = await findExistingGist()
      if (existing) {
        // Reuse existing gist
        localStorage.setItem(TOKEN_KEY, token)
        saveGistId(existing.id)
        syncStatus.value = 'success'
        return existing.id
      }

      // No existing gist — create new one
      const localData = JSON.parse(localStorage.getItem('mc-algo-progress') || '{}')
      if (!localData[META_KEY]) localData[META_KEY] = {}
      localData[META_KEY]._lastSync = Date.now()
      localData[META_KEY]._device = deviceId

      const r = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          description: GIST_DESC,
          public: false,
          files: { [GIST_FILENAME]: { content: JSON.stringify(localData) } },
        }),
      })
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        throw new Error(err.message || `GitHub API ${r.status}`)
      }
      const data = await r.json()
      // Only persist after success
      localStorage.setItem(TOKEN_KEY, token)
      saveGistId(data.id)
      syncStatus.value = 'success'
      return data.id
    } catch (e) {
      // Reset token on failure so user sees input again
      gistToken.value = ''
      syncStatus.value = 'error'
      syncError.value = e.message
      throw e
    }
  }

  // Push local progress to gist
  async function pushProgress(data) {
    if (!gistToken.value || !gistId.value) {
      syncStatus.value = 'error'
      syncError.value = '未配置同步（缺少 Token 或 Gist ID）'
      return false
    }
    syncStatus.value = 'syncing'
    syncError.value = ''
    try {
      const payload = { ...data }
      if (!payload[META_KEY]) payload[META_KEY] = {}
      payload[META_KEY]._lastSync = Date.now()
      payload[META_KEY]._device = deviceId

      const r = await fetch(`https://api.github.com/gists/${gistId.value}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({
          files: { [GIST_FILENAME]: { content: JSON.stringify(payload) } },
        }),
      })
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        throw new Error(err.message || `GitHub API ${r.status}`)
      }
      syncStatus.value = 'success'
      return true
    } catch (e) {
      syncStatus.value = 'error'
      syncError.value = e.message
      return false
    }
  }

  // Pull progress from gist
  async function pullProgress() {
    if (!gistToken.value || !gistId.value) {
      syncStatus.value = 'error'
      syncError.value = '未配置同步（缺少 Token 或 Gist ID）'
      return null
    }
    syncStatus.value = 'syncing'
    syncError.value = ''
    try {
      const r = await fetch(`https://api.github.com/gists/${gistId.value}`, {
        headers: headers(),
      })
      if (!r.ok) throw new Error(`GitHub API ${r.status}`)
      const data = await r.json()
      const content = data.files?.[GIST_FILENAME]?.content
      syncStatus.value = 'success'
      return content ? JSON.parse(content) : null
    } catch (e) {
      syncStatus.value = 'error'
      syncError.value = e.message
      return null
    }
  }

  /**
   * Smart merge — per-chapter mtime comparison
   */
  function mergeProgress(local, cloud) {
    if (!cloud) return local
    if (!local || Object.keys(local).length === 0) return cloud

    const localMeta = local[META_KEY] || {}
    const cloudMeta = cloud[META_KEY] || {}

    const allChapters = new Set([
      ...Object.keys(local).filter(k => k !== META_KEY),
      ...Object.keys(cloud).filter(k => k !== META_KEY),
    ])

    const merged = {}

    for (const chId of allChapters) {
      const localHas = chId in local
      const cloudHas = chId in cloud
      const localCh = local[chId] || {}
      const cloudCh = cloud[chId] || {}

      if (!localHas && cloudHas) {
        merged[chId] = { ...cloudCh }
        continue
      }
      if (localHas && !cloudHas) {
        merged[chId] = { ...localCh }
        continue
      }

      // Both have — union merge (only adds, never removes checked items)
      merged[chId] = unionChapter(localCh, cloudCh)
    }

    // Merge _meta
    const mergedMeta = {}
    for (const chId of allChapters) {
      const lm = localMeta[chId]
      const cm = cloudMeta[chId]
      if (lm && cm) {
        mergedMeta[chId] = lm.mtime >= cm.mtime ? { ...lm } : { ...cm }
      } else {
        mergedMeta[chId] = lm || cm
      }
    }
    mergedMeta._lastSync = Math.max(localMeta._lastSync || 0, cloudMeta._lastSync || 0)
    mergedMeta._device = deviceId
    merged[META_KEY] = mergedMeta

    return merged
  }

  function unionChapter(a, b) {
    const result = { ...a }
    for (const [k, v] of Object.entries(b)) {
      if (v) {
        result[k] = true
      } else if (!(k in result)) {
        result[k] = false
      }
    }
    return result
  }

  // Debounced auto-push: 3s cooldown
  function debouncePush(data) {
    if (!gistToken.value || !gistId.value) return
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => pushProgress(data), 3000)
  }

  return {
    syncStatus,
    syncError,
    gistToken,
    gistId,
    deviceId,
    saveToken,
    clearSync,
    initGist,
    pushProgress,
    pullProgress,
    mergeProgress,
    debouncePush,
    touchChapter,
  }
}
