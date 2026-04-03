/**
 * Progress Sync - 清晰的数据流
 * 
 * 数据流规则：
 * 1. 未登录 → 使用本地缓存
 * 2. 已登录 → 使用数据库数据
 * 3. 用户操作 → 自动同步到数据库（定时）
 * 4. 退出 → 清除显示
 */

import { ref, watch } from 'vue'
import { useAuth } from './auth.js'

const API_BASE = import.meta.env.VITE_API_URL || ''
const PROGRESS_KEY = 'mc-algo-progress'
const SYNC_INTERVAL = 60000 // 60秒同步一次

const syncStatus = ref('idle') // idle | syncing | success | error
const syncError = ref('')
let syncTimer = null

export function useProgressSync() {
  const { user } = useAuth()

  // 本地进度
  function getLocalProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}')
    } catch {
      return {}
    }
  }

  function setLocalProgress(data) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data))
  }

  // API请求
  async function apiFetch(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`
    return fetch(fullUrl, {
      ...options,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers }
    })
  }

  // 是否已登录
  function isLoggedIn() {
    return !!user.value
  }

  // 从数据库加载进度
  async function loadFromServer() {
    if (!isLoggedIn()) {
      console.log('[Sync] 未登录，不加载服务器数据')
      return null
    }

    syncStatus.value = 'syncing'
    try {
      const res = await apiFetch('/api/progress')
      if (!res.ok) {
        throw new Error('加载失败')
      }
      const data = await res.json()
      const serverProgress = data.progress || {}
      console.log('[Sync] 从服务器加载:', Object.keys(serverProgress).length, '个章节')
      syncStatus.value = 'success'
      return serverProgress
    } catch (e) {
      console.error('[Sync] 加载失败:', e)
      syncStatus.value = 'error'
      syncError.value = e.message
      return null
    }
  }

  // 保存到数据库
  async function saveToServer(progress) {
    if (!isLoggedIn()) {
      console.log('[Sync] 未登录，不保存到服务器')
      return false
    }

    try {
      const res = await apiFetch('/api/progress', {
        method: 'PUT',
        body: JSON.stringify({ progress })
      })
      if (!res.ok) {
        throw new Error('保存失败')
      }
      console.log('[Sync] 已保存到服务器')
      return true
    } catch (e) {
      console.error('[Sync] 保存失败:', e)
      return false
    }
  }

  // 开始定时同步
  function startAutoSync() {
    if (syncTimer) {
      clearInterval(syncTimer)
    }
    console.log('[Sync] 开始自动同步（每60秒）')
    syncTimer = setInterval(() => {
      if (isLoggedIn()) {
        const local = getLocalProgress()
        if (Object.keys(local).length > 0) {
          console.log('[Sync] 定时同步...')
          saveToServer(local)
        }
      }
    }, SYNC_INTERVAL)
  }

  // 停止定时同步
  function stopAutoSync() {
    if (syncTimer) {
      clearInterval(syncTimer)
      syncTimer = null
      console.log('[Sync] 停止自动同步')
    }
  }

  // 手动触发同步
  async function syncNow() {
    if (!isLoggedIn()) return
    const local = getLocalProgress()
    await saveToServer(local)
  }

  // 监听登录状态
  watch(user, (newUser, oldUser) => {
    if (newUser) {
      console.log('[Sync] 用户登录:', newUser.username)
      startAutoSync()
    } else if (oldUser) {
      console.log('[Sync] 用户登出')
      stopAutoSync()
    }
  }, { immediate: true })

  return {
    syncStatus,
    syncError,
    getLocalProgress,
    setLocalProgress,
    loadFromServer,
    saveToServer,
    syncNow,
    startAutoSync,
    stopAutoSync,
    isLoggedIn
  }
}
