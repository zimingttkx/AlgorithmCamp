/**
 * Authentication composable
 * Manages JWT tokens and user state
 *
 * Token storage: accessToken in memory, refreshToken in httpOnly cookie
 * Auto-refresh: Tokens are automatically refreshed when < 5 minutes remain
 */

import { ref, computed } from 'vue'

const API_BASE = import.meta.env.VITE_API_URL || ''

// Singleton state
const user = ref(null)
const clientId = ref('')

// Token refresh state
let refreshTimer = null
const REFRESH_CHECK_INTERVAL = 60 * 1000 // Check every minute
const REFRESH_BEFORE_EXPIRY = 5 * 60 * 1000 // Refresh when < 5 minutes remain

export function useAuth() {
  const isLoggedIn = computed(() => !!user.value)

  /**
   * API fetch with cookie credentials
   */
  async function apiFetch(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`

    const res = await fetch(fullUrl, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    return res
  }

  /**
   * Check token status and auto-refresh if needed
   */
  async function checkAndRefreshToken() {
    try {
      const res = await apiFetch('/api/auth/token-status')
      if (!res.ok) return false

      const data = await res.json()
      if (data.needsRefresh) {
        // Token expired or about to expire, try to refresh
        return await refreshTokens()
      }
      return true
    } catch (e) {
      console.error('[Auth] Token status check failed:', e)
      return false
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async function refreshTokens() {
    try {
      const res = await apiFetch('/api/auth/refresh', {
        method: 'POST'
      })

      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          user.value = data.user
          return true
        }
      }

      // Refresh failed - user needs to re-login
      user.value = null
      return false
    } catch (e) {
      console.error('[Auth] Token refresh failed:', e)
      user.value = null
      return false
    }
  }

  /**
   * Start periodic token refresh check
   */
  function startTokenRefreshTimer() {
    if (refreshTimer) return

    // Check immediately
    checkAndRefreshToken()

    // Then check periodically
    refreshTimer = setInterval(() => {
      checkAndRefreshToken()
    }, REFRESH_CHECK_INTERVAL)
  }

  /**
   * Stop periodic token refresh check
   */
  function stopTokenRefreshTimer() {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  /**
   * Register new user
   */
  async function register(username, password, githubUsername = '') {
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, githubUsername })
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'registration failed')
    }

    return data
  }

  /**
   * Login with username/password
   */
  async function login(username, password) {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'login failed')
    }

    return data
  }

  /**
   * Login with GitHub OAuth
   */
  function loginWithGithub() {
    window.location.href = `${API_BASE}/api/auth/github`
  }

  /**
   * Get current user info
   */
  async function fetchMe() {
    try {
      const res = await apiFetch('/api/auth/me')
      if (!res || !res.ok) return null
      return res.json()
    } catch (e) {
      return null
    }
  }

  /**
   * Logout
   */
  async function logout() {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' })
    } catch (e) {
      console.error('[Auth] Logout error:', e)
    }
  }

  /**
   * Handle OAuth callback - call after redirect from GitHub
   */
  async function handleOAuthCallback() {
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    const success = params.get('login')

    if (error) {
      throw new Error(error === 'github_denied' ? 'GitHub authorization denied' : 'OAuth failed')
    }

    if (success === 'success') {
      await fetchMe()
      return true
    }

    return false
  }

  return {
    user,
    clientId,
    isLoggedIn,
    apiFetch,
    register,
    login,
    loginWithGithub,
    fetchMe,
    logout,
    handleOAuthCallback,
    refreshTokens,
    checkAndRefreshToken,
    startTokenRefreshTimer,
    stopTokenRefreshTimer
  }
}
