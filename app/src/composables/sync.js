import { ref } from 'vue'

const TOKEN_KEY = 'mc-gist-token'
const GIST_ID_KEY = 'mc-gist-id'
const GIST_FILENAME = 'algo-progress.json'

const syncStatus = ref('idle')
const gistToken = ref(localStorage.getItem(TOKEN_KEY) || '')
const gistId = ref(localStorage.getItem(GIST_ID_KEY) || '')

let debounceTimer = null

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

  // First-time: create a private gist, save its ID
  async function initGist(token) {
    saveToken(token)
    syncStatus.value = 'syncing'
    try {
      // Read current local progress to include in initial gist
      const localData = JSON.parse(localStorage.getItem('mc-algo-progress') || '{}')
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

  // Upload: push local progress to gist
  async function pushProgress(data) {
    if (!gistToken.value || !gistId.value) return false
    syncStatus.value = 'syncing'
    try {
      const r = await fetch(`https://api.github.com/gists/${gistId.value}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({
          files: { [GIST_FILENAME]: { content: JSON.stringify(data) } },
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

  // Download: pull progress from gist
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

  // Merge: cloud wins on conflict for same key
  function mergeProgress(local, cloud) {
    if (!cloud) return local
    const merged = { ...local }
    for (const chId of Object.keys(cloud)) {
      merged[chId] = { ...(merged[chId] || {}), ...cloud[chId] }
    }
    return merged
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
    saveToken,
    clearSync,
    initGist,
    pushProgress,
    pullProgress,
    mergeProgress,
    debouncePush,
  }
}
