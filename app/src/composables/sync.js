import { ref } from 'vue'

const TOKEN_KEY = 'mc-gist-token'
const GIST_ID_KEY = 'mc-gist-id'
const GIST_FILENAME = 'algo-progress.json'
const META_KEY = '_meta'

const syncStatus = ref('idle')
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

  // Create a new private gist
  async function initGist(token) {
    saveToken(token)
    syncStatus.value = 'syncing'
    try {
      const localData = JSON.parse(localStorage.getItem('mc-algo-progress') || '{}')
      // Ensure _meta exists
      if (!localData[META_KEY]) localData[META_KEY] = {}
      localData[META_KEY]._lastSync = Date.now()
      localData[META_KEY]._device = deviceId

      const r = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          description: 'AlgorithmCamp Progress Sync',
          public: false,
          files: { [GIST_FILENAME]: { content: JSON.stringify(localData) } },
        }),
      })
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        throw new Error(err.message || `GitHub API ${r.status}`)
      }
      const data = await r.json()
      saveGistId(data.id)
      syncStatus.value = 'success'
      return data.id
    } catch (e) {
      syncStatus.value = 'error'
      throw e
    }
  }

  // Push local progress to gist
  async function pushProgress(data) {
    if (!gistToken.value || !gistId.value) return false
    syncStatus.value = 'syncing'
    try {
      // Ensure _meta._lastSync is updated before push
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
    } catch {
      syncStatus.value = 'error'
      return false
    }
  }

  // Pull progress from gist
  async function pullProgress() {
    if (!gistToken.value || !gistId.value) return null
    syncStatus.value = 'syncing'
    try {
      const r = await fetch(`https://api.github.com/gists/${gistId.value}`, {
        headers: headers(),
      })
      if (!r.ok) throw new Error(`GitHub API ${r.status}`)
      const data = await r.json()
      const content = data.files?.[GIST_FILENAME]?.content
      syncStatus.value = 'success'
      return content ? JSON.parse(content) : null
    } catch {
      syncStatus.value = 'error'
      return null
    }
  }

  /**
   * Smart merge — per-chapter mtime comparison
   *
   * For each chapter:
   *   - If only local has it → keep local
   *   - If only cloud has it → take cloud
   *   - If both have it:
   *     - Compare mtime: newer wins
   *     - If same mtime (within 1s): take the one with more done, then union merge
   *   - Always take the union of both sides' checked items for the winning chapter
   *     (only adds, never removes checked items)
   *
   * _meta is also merged: latest mtime per chapter wins
   */
  function mergeProgress(local, cloud) {
    if (!cloud) return local
    if (!local || Object.keys(local).length === 0) return cloud

    const localMeta = local[META_KEY] || {}
    const cloudMeta = cloud[META_KEY] || {}

    // Collect all chapter IDs (exclude _meta)
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
        // Only cloud has this chapter
        merged[chId] = { ...cloudCh }
        continue
      }
      if (localHas && !cloudHas) {
        // Only local has this chapter
        merged[chId] = { ...localCh }
        continue
      }

      // Both have this chapter — compare mtime
      const localMT = localMeta[chId]?.mtime || 0
      const cloudMT = cloudMeta[chId]?.mtime || 0
      const localDone = localMeta[chId]?.done || Object.values(localCh).filter(Boolean).length
      const cloudDone = cloudMeta[chId]?.done || Object.values(cloudCh).filter(Boolean).length

      if (cloudMT > localMT + 1000) {
        // Cloud is significantly newer → cloud wins, but still union merge (safe)
        merged[chId] = unionChapter(localCh, cloudCh)
      } else if (localMT > cloudMT + 1000) {
        // Local is significantly newer → local wins, union merge
        merged[chId] = unionChapter(localCh, cloudCh)
      } else {
        // Similar timestamps → union merge (take ALL checked items from both)
        merged[chId] = unionChapter(localCh, cloudCh)
      }
    }

    // Merge _meta: take the latest mtime per chapter
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
    // Take latest sync timestamp
    mergedMeta._lastSync = Math.max(localMeta._lastSync || 0, cloudMeta._lastSync || 0)
    mergedMeta._device = deviceId
    merged[META_KEY] = mergedMeta

    return merged
  }

  // Union two chapter objects: if either side has true, result is true
  function unionChapter(a, b) {
    const result = { ...a }
    for (const [k, v] of Object.entries(b)) {
      if (v) {
        // Cloud says checked → always keep checked
        result[k] = true
      } else if (!(k in result)) {
        // Cloud says unchecked and local doesn't have this key
        result[k] = false
      }
      // If local has true and cloud has false, keep local true
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
