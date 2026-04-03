/**
 * 数据同步逻辑
 * - 未登录: 使用 localStorage
 * - 登录后: 每分钟自动同步到数据库
 * - 登录时: 从数据库恢复数据到 localStorage
 */

import { ref, watch } from 'vue'
import { useAuth } from './auth.js'

const API_BASE = import.meta.env.VITE_API_URL || ''
const STORAGE_KEY = 'mc-algo-progress'
const SYNC_INTERVAL = 60 * 1000 // 1分钟

const syncing = ref(false)
const lastSync = ref(null)
const syncError = ref(null)
let syncTimer = null

// 加载本地数据
function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

// 保存本地数据
function saveLocal(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  localStorage.setItem('_lastUpdate', Date.now().toString())
}

// 从数据库下载数据
async function downloadFromServer() {
  try {
    const res = await fetch(`${API_BASE}/api/progress`, { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      return data.progress || {}
    }
  } catch (e) {
    console.error('[Sync] Download failed:', e)
  }
  return null
}

// 上传数据到数据库
async function uploadToServer(progress) {
  try {
    const res = await fetch(`${API_BASE}/api/progress`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress })
    })
    return res.ok
  } catch (e) {
    console.error('[Sync] Upload failed:', e)
    syncError.value = e.message
    return false
  }
}

// 同步函数
async function doSync() {
  const { user } = useAuth()
  if (!user.value) return

  if (syncing.value) return
  syncing.value = true
  syncError.value = null

  try {
    const localData = loadLocal()
    const serverData = await downloadFromServer()

    if (serverData && Object.keys(serverData).length > 0) {
      // 合并数据: 本地和服务器合并，取最新
      const merged = mergeProgress(localData, serverData)
      saveLocal(merged)
      // 触发UI刷新
      window.dispatchEvent(new Event('storage'))
      window.dispatchEvent(new CustomEvent('progress-updated'))
    }

    // 上传本地数据
    if (Object.keys(localData).length > 0) {
      await uploadToServer(localData)
    }

    lastSync.value = new Date()
    console.log('[Sync] Done at', lastSync.value.toLocaleTimeString())
  } catch (e) {
    console.error('[Sync] Error:', e)
    syncError.value = e.message
  } finally {
    syncing.value = false
  }
}

// 合并进度数据 (取最新值)
function mergeProgress(local, server) {
  const merged = { ...server }
  
  for (const chapterId in local) {
    if (!merged[chapterId]) {
      merged[chapterId] = local[chapterId]
      continue
    }
    
    // 合并章节内的问题
    for (const problemId in local[chapterId]) {
      const localTime = merged[chapterId][problemId]?.timestamp || 0
      const serverTime = local[chapterId][problemId]?.timestamp || 0
      
      if (serverTime >= localTime) {
        merged[chapterId][problemId] = local[chapterId][problemId]
      }
    }
  }
  
  return merged
}

// 开始定时同步
function startAutoSync() {
  stopAutoSync()
  console.log('[Sync] Auto-sync started (every 60s)')
  syncTimer = setInterval(doSync, SYNC_INTERVAL)
}

// 停止定时同步
function stopAutoSync() {
  if (syncTimer) {
    clearInterval(syncTimer)
    syncTimer = null
    console.log('[Sync] Auto-sync stopped')
  }
}

// 手动触发同步
async function syncNow() {
  await doSync()
}

// 初始化同步系统
export function useSync() {
  const { user, fetchMe } = useAuth()

  // 监听登录状态变化
  watch(user, async (newUser, oldUser) => {
    if (newUser) {
      // 登录了
      console.log('[Sync] User logged in:', newUser.username)
      
      // 登录时先下载服务器数据
      const serverData = await downloadFromServer()
      if (serverData) {
        const localData = loadLocal()
        const merged = mergeProgress(localData, serverData)
        saveLocal(merged)
        window.dispatchEvent(new Event('storage'))
        window.dispatchEvent(new CustomEvent('progress-updated'))
      }
      
      // 开始自动同步
      startAutoSync()
    } else if (oldUser) {
      // 登出了
      console.log('[Sync] User logged out')
      stopAutoSync()
    }
  }, { immediate: true })

  return {
    syncing,
    lastSync,
    syncError,
    syncNow,
    startAutoSync,
    stopAutoSync
  }
}

// 导出单例，供其他地方使用
export { doSync, syncNow }
