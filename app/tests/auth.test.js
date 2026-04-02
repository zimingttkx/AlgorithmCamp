/**
 * Comprehensive Unit Tests for auth.js - Authentication composable
 * Tests useAuth() with mocked fetch and browser APIs (Node environment)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Setup browser globals before importing the module
const mockLocation = { href: '', search: '' }
globalThis.window = {
  location: mockLocation
}

// Mock import.meta.env
vi.mock('import.meta.env', () => ({
  VITE_API_URL: ''
}))

// Import useAuth after mocks are set up
const { useAuth } = await import('../src/composables/auth.js')

describe('useAuth', () => {
  let originalFetch

  beforeEach(() => {
    originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn()
    mockLocation.href = ''
    mockLocation.search = ''
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.clearAllMocks()
  })

  describe('apiFetch(url, options)', () => {
    it('should construct full URL from relative path', async () => {
      const { apiFetch } = useAuth()
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      })

      await apiFetch('/api/test')

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({ credentials: 'include' })
      )
    })

    it('should pass through full URLs unchanged', async () => {
      const { apiFetch } = useAuth()
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      })

      await apiFetch('https://api.example.com/api/test')

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/test',
        expect.any(Object)
      )
    })

    it('should always include credentials: include', async () => {
      const { apiFetch } = useAuth()
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      })

      await apiFetch('/api/test', {})

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({ credentials: 'include' })
      )
    })

    it('should set Content-Type header to application/json', async () => {
      const { apiFetch } = useAuth()
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      })

      await apiFetch('/api/test', {})

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({ 'Content-Type': 'application/json' })
        })
      )
    })

    it('should merge custom headers with default headers', async () => {
      const { apiFetch } = useAuth()
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      })

      await apiFetch('/api/test', {
        headers: { 'Authorization': 'Bearer token' }
      })

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token'
          })
        })
      )
    })

    it('should pass through HTTP method correctly', async () => {
      const { apiFetch } = useAuth()
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      })

      await apiFetch('/api/test', { method: 'POST' })

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('should pass through body correctly', async () => {
      const { apiFetch } = useAuth()
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      })

      const body = JSON.stringify({ username: 'test', password: 'pass' })
      await apiFetch('/api/test', { method: 'POST', body })

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({ body })
      )
    })

    it('should return the response object', async () => {
      const { apiFetch } = useAuth()
      const mockResponse = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: 'test' })
      }
      globalThis.fetch.mockResolvedValueOnce(mockResponse)

      const result = await apiFetch('/api/test')

      expect(result).toBe(mockResponse)
    })
  })

  describe('register(username, password, githubUsername)', () => {
    it('should register successfully with all fields', async () => {
      const { register } = useAuth()
      const mockUser = { id: 1, username: 'testuser' }
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockUser)
      })

      const result = await register('testuser', 'password123', 'githubuser')

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            username: 'testuser',
            password: 'password123',
            githubUsername: 'githubuser'
          })
        })
      )
      expect(result).toEqual(mockUser)
    })

    it('should register successfully without githubUsername', async () => {
      const { register } = useAuth()
      const mockUser = { id: 1, username: 'testuser' }
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockUser)
      })

      const result = await register('testuser', 'password123')

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            username: 'testuser',
            password: 'password123',
            githubUsername: ''
          })
        })
      )
      expect(result).toEqual(mockUser)
    })

    it('should throw error on 409 conflict', async () => {
      const { register } = useAuth()
      globalThis.fetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ error: 'Username already exists' })
      })

      await expect(register('existinguser', 'password123'))
        .rejects.toThrow('Username already exists')
    })

    it('should throw error on 400 bad request', async () => {
      const { register } = useAuth()
      globalThis.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Invalid input' })
      })

      await expect(register('', 'password123'))
        .rejects.toThrow('Invalid input')
    })

    it('should throw error with default message when error field is missing', async () => {
      const { register } = useAuth()
      globalThis.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({})
      })

      await expect(register('testuser', 'password123'))
        .rejects.toThrow('registration failed')
    })

    it('should throw error on network failure', async () => {
      const { register } = useAuth()
      globalThis.fetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(register('testuser', 'password123'))
        .rejects.toThrow('Network error')
    })
  })

  describe('login(username, password)', () => {
    it('should login successfully', async () => {
      const { login } = useAuth()
      const mockUser = { id: 1, username: 'testuser', token: 'jwt-token' }
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUser)
      })

      const result = await login('testuser', 'password123')

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            username: 'testuser',
            password: 'password123'
          })
        })
      )
      expect(result).toEqual(mockUser)
    })

    it('should throw error on 401 unauthorized', async () => {
      const { login } = useAuth()
      globalThis.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Invalid credentials' })
      })

      await expect(login('testuser', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials')
    })

    it('should throw error on 403 forbidden', async () => {
      const { login } = useAuth()
      globalThis.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: 'Account disabled' })
      })

      await expect(login('testuser', 'password123'))
        .rejects.toThrow('Account disabled')
    })

    it('should throw error with default message on failed login', async () => {
      const { login } = useAuth()
      globalThis.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({})
      })

      await expect(login('testuser', 'password123'))
        .rejects.toThrow('login failed')
    })

    it('should throw error on network failure', async () => {
      const { login } = useAuth()
      globalThis.fetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(login('testuser', 'password123'))
        .rejects.toThrow('Network error')
    })
  })

  describe('loginWithGithub()', () => {
    it('should set window.location.href to GitHub OAuth URL', () => {
      const { loginWithGithub } = useAuth()

      loginWithGithub()

      expect(window.location.href).toBe('/api/auth/github')
    })
  })

  describe('fetchMe()', () => {
    it('should fetch current user successfully', async () => {
      const { fetchMe } = useAuth()
      const mockUser = { id: 1, username: 'testuser' }
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUser)
      })

      const result = await fetchMe()

      expect(globalThis.fetch).toHaveBeenCalledWith('/api/auth/me', expect.any(Object))
      expect(result).toEqual(mockUser)
    })

    it('should return null on 401 unauthorized', async () => {
      const { fetchMe } = useAuth()
      globalThis.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({})
      })

      const result = await fetchMe()

      expect(result).toBeNull()
    })

    it('should return null on network error', async () => {
      const { fetchMe } = useAuth()
      globalThis.fetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await fetchMe()

      expect(result).toBeNull()
    })

    it('should return null when response is null/undefined', async () => {
      const { fetchMe } = useAuth()
      globalThis.fetch.mockResolvedValueOnce(null)

      const result = await fetchMe()

      expect(result).toBeNull()
    })

    it('should return null when response has no ok property', async () => {
      const { fetchMe } = useAuth()
      globalThis.fetch.mockResolvedValueOnce({})

      const result = await fetchMe()

      expect(result).toBeNull()
    })
  })

  describe('logout()', () => {
    it('should logout successfully without throwing', async () => {
      const { logout } = useAuth()
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({})
      })

      await expect(logout()).resolves.toBeUndefined()

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/auth/logout',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('should not throw even when fetch fails', async () => {
      const { logout } = useAuth()
      globalThis.fetch.mockRejectedValueOnce(new Error('Network error'))
      // Spy on console.error to verify it's called
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(logout()).resolves.toBeUndefined()

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Auth] Logout error:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('should not throw even when response is not ok', async () => {
      const { logout } = useAuth()
      globalThis.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({})
      })

      await expect(logout()).resolves.toBeUndefined()
    })
  })

  describe('handleOAuthCallback()', () => {
    it('should throw error when error param is present (github_denied)', async () => {
      const { handleOAuthCallback } = useAuth()
      window.location.search = '?error=github_denied'

      await expect(handleOAuthCallback())
        .rejects.toThrow('GitHub authorization denied')
    })

    it('should throw error when error param is present (generic)', async () => {
      const { handleOAuthCallback } = useAuth()
      window.location.search = '?error=oauth_failed'

      await expect(handleOAuthCallback())
        .rejects.toThrow('OAuth failed')
    })

    it('should return true and fetch user when login=success', async () => {
      const { handleOAuthCallback } = useAuth()
      const mockUser = { id: 1, username: 'testuser' }
      window.location.search = '?login=success'
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUser)
      })

      const result = await handleOAuthCallback()

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/auth/me',
        expect.any(Object)
      )
      expect(result).toBe(true)
    })

    it('should return false when no params present', async () => {
      const { handleOAuthCallback } = useAuth()
      window.location.search = ''

      const result = await handleOAuthCallback()

      expect(result).toBe(false)
    })

    it('should return false when login param is not success', async () => {
      const { handleOAuthCallback } = useAuth()
      window.location.search = '?login=pending'

      const result = await handleOAuthCallback()

      expect(result).toBe(false)
    })
  })

  describe('isLoggedIn computed', () => {
    it('should return false when user.value is null', () => {
      const { isLoggedIn, user } = useAuth()
      user.value = null

      expect(isLoggedIn.value).toBe(false)
    })

    it('should return false when user.value is undefined', () => {
      const { isLoggedIn, user } = useAuth()
      user.value = undefined

      expect(isLoggedIn.value).toBe(false)
    })

    it('should return true when user.value has a value', () => {
      const { isLoggedIn, user } = useAuth()
      user.value = { id: 1, username: 'testuser' }

      expect(isLoggedIn.value).toBe(true)
    })

    it('should return true when user.value is an empty object', () => {
      const { isLoggedIn, user } = useAuth()
      user.value = {}

      expect(isLoggedIn.value).toBe(true)
    })

    it('should update reactively when user.value changes', () => {
      const { isLoggedIn, user } = useAuth()
      user.value = null

      expect(isLoggedIn.value).toBe(false)

      user.value = { id: 1, username: 'testuser' }

      expect(isLoggedIn.value).toBe(true)
    })
  })

  describe('user ref (singleton)', () => {
    it('should be shared across useAuth calls', () => {
      const auth1 = useAuth()
      const auth2 = useAuth()

      auth1.user.value = { id: 1, username: 'testuser' }

      expect(auth2.user.value).toEqual({ id: 1, username: 'testuser' })
    })
  })

  describe('clientId ref', () => {
    it('should be defined and empty by default', () => {
      const { clientId } = useAuth()

      expect(clientId.value).toBe('')
    })
  })
})
