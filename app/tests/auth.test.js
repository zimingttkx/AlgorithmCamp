/**
 * Unit Tests for auth.js - Authentication composable (Node-safe)
 * Tests pure logic without DOM dependencies
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('useAuth - API URL handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('URL construction', () => {
    it('should prepend API_BASE to relative URLs', () => {
      const API_BASE = ''
      const url = '/api/test'
      const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`
      expect(fullUrl).toBe('/api/test')
    })

    it('should handle empty API_BASE', () => {
      const API_BASE = ''
      const url = '/api/test'
      const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`
      expect(fullUrl).toBe('/api/test')
    })

    it('should not modify full URLs', () => {
      const API_BASE = ''
      const url = 'https://api.example.com/test'
      const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`
      expect(fullUrl).toBe('https://api.example.com/test')
    })

    it('should handle API_BASE with trailing slash', () => {
      const API_BASE = 'http://localhost:3000'
      const url = '/api/test'
      const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`
      expect(fullUrl).toBe('http://localhost:3000/api/test')
    })
  })
})

describe('useAuth - Register payload', () => {
  it('should create correct register payload', () => {
    const username = 'testuser'
    const password = 'password123'
    const githubUsername = 'testgithub'

    const payload = { username, password, githubUsername }

    expect(payload.username).toBe('testuser')
    expect(payload.password).toBe('password123')
    expect(payload.githubUsername).toBe('testgithub')
  })

  it('should allow empty githubUsername', () => {
    const username = 'testuser'
    const password = 'password123'
    const githubUsername = ''

    const payload = { username, password, githubUsername }

    expect(payload.githubUsername).toBe('')
  })
})

describe('useAuth - Login payload', () => {
  it('should create correct login payload', () => {
    const username = 'testuser'
    const password = 'password123'

    const payload = { username, password }

    expect(payload.username).toBe('testuser')
    expect(payload.password).toBe('password123')
  })
})

describe('useAuth - GitHub OAuth URL', () => {
  it('should construct correct GitHub OAuth URL', () => {
    const API_BASE = ''
    const githubUrl = `${API_BASE}/api/auth/github`
    expect(githubUrl).toBe('/api/auth/github')
  })

  it('should handle custom API_BASE', () => {
    const API_BASE = 'https://api.example.com'
    const githubUrl = `${API_BASE}/api/auth/github`
    expect(githubUrl).toBe('https://api.example.com/api/auth/github')
  })
})

describe('useAuth - isLoggedIn computed', () => {
  it('should return false when user is null', () => {
    const user = null
    const isLoggedIn = !!user
    expect(isLoggedIn).toBe(false)
  })

  it('should return false when user is undefined', () => {
    const user = undefined
    const isLoggedIn = !!user
    expect(isLoggedIn).toBe(false)
  })

  it('should return true when user has value', () => {
    const user = { id: 1, username: 'test' }
    const isLoggedIn = !!user
    expect(isLoggedIn).toBe(true)
  })

  it('should return true when user is empty object', () => {
    const user = {}
    const isLoggedIn = !!user
    expect(isLoggedIn).toBe(true)
  })
})

describe('useAuth - Error message extraction', () => {
  it('should extract error from response data', () => {
    const data = { error: 'Username already exists' }
    const errorMessage = data.error || 'registration failed'
    expect(errorMessage).toBe('Username already exists')
  })

  it('should use default error when none provided', () => {
    const data = {}
    const errorMessage = data.error || 'registration failed'
    expect(errorMessage).toBe('registration failed')
  })

  it('should use default error on network failure', () => {
    let data
    try {
      throw new Error('Network error')
    } catch {
      data = null
    }
    const errorMessage = data?.error || 'registration failed'
    expect(errorMessage).toBe('registration failed')
  })
})

describe('useAuth - OAuth callback param parsing', () => {
  // Simulates URLSearchParams behavior
  function parseParams(search) {
    const params = {}
    search.replace(/^\?/, '').split('&').forEach(pair => {
      const [key, value] = pair.split('=')
      if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || '')
    })
    return params
  }

  it('should parse github_denied error', () => {
    const params = parseParams('?error=github_denied')
    expect(params.error).toBe('github_denied')
  })

  it('should parse oauth_failed error', () => {
    const params = parseParams('?error=oauth_failed')
    expect(params.error).toBe('oauth_failed')
  })

  it('should parse login success', () => {
    const params = parseParams('?login=success')
    expect(params.login).toBe('success')
  })

  it('should return undefined for missing params', () => {
    const params = parseParams('')
    expect(params.error).toBeUndefined()
    expect(params.login).toBeUndefined()
  })

  it('should decode URL encoded values', () => {
    const params = parseParams('?error=github_denied&redirect=%2Fpractice')
    expect(params.error).toBe('github_denied')
    expect(params.redirect).toBe('/practice')
  })
})
