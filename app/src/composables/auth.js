/**
 * 简单的用户名密码认证
 */
import { ref } from 'vue'

const API_BASE = import.meta.env.VITE_API_URL || ''

// 全局状态
const user = ref(null)
const loading = ref(false)

export function useAuth() {
  // 检查是否已登录
  async function fetchMe() {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        user.value = data.user
      } else {
        user.value = null
      }
    } catch {
      user.value = null
    }
  }

  // 登录
  async function login(username, password) {
    loading.value = true
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '登录失败')
      await fetchMe()
      return data
    } finally {
      loading.value = false
    }
  }

  // 注册
  async function register(username, password) {
    loading.value = true
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '注册失败')
      await fetchMe()
      return data
    } finally {
      loading.value = false
    }
  }

  // 登出
  async function logout() {
    console.log('[Auth] logout() called')
    try {
      const res = await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' })
      console.log('[Auth] logout response:', res.status, await res.clone().text())
      if (!res.ok) {
        console.error('[Auth] logout failed')
      }
    } catch (e) {
      console.error('[Auth] logout error:', e)
    }
    console.log('[Auth] Setting user to null')
    user.value = null
    console.log('[Auth] logout complete, user:', user.value)
    
    // 清除本地缓存，强制刷新
    localStorage.removeItem('mc-algo-progress')
    location.reload()
  }

  // 刷新token
  async function refresh() {
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, { method: 'POST', credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        user.value = data.user
        return true
      }
      // 401/403 = 真正的认证失败
      if (res.status === 401 || res.status === 403) {
        user.value = null
      }
      return false
    } catch (e) {
      // 网络错误不应登出用户
      console.warn('[Auth] Refresh network error:', e.message)
      return false
    }
  }

  // 启动时检查登录状态
  fetchMe()

  return {
    user,
    loading,
    isLoggedIn: () => !!user.value,
    fetchMe,
    login,
    register,
    logout,
    refresh
  }
}
