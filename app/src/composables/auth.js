/**
 * Authentication composable
 * Manages JWT tokens and user state
 *
 * Token storage: accessToken in memory, refreshToken in httpOnly cookie
 */

import { ref, computed } from 'vue'

const API_BASE = import.meta.env.VITE_API_URL || ''

// Singleton state
const user = ref(null)
const clientId = ref('')

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
    const res = await apiFetch('/api/auth/me')
    if (!res || !res.ok) return null
    return res.json()
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
    handleOAuthCallback
  }
}
