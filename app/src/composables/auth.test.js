/**
 * useAuth Composable Tests
 */
import { describe, it, expect } from 'vitest'
import { useAuth } from './auth.js'

describe('useAuth', () => {
  it('should export useAuth function', () => {
    expect(typeof useAuth).toBe('function')
  })

  describe('isLoggedIn', () => {
    it('should return false when user is null', () => {
      const { isLoggedIn } = useAuth()
      expect(isLoggedIn.value).toBe(false)
    })
  })

  describe('apiFetch', () => {
    it('should provide apiFetch function', () => {
      const { apiFetch } = useAuth()
      expect(typeof apiFetch).toBe('function')
    })
  })

  describe('auth methods', () => {
    it('should provide register function', () => {
      const { register } = useAuth()
      expect(typeof register).toBe('function')
    })

    it('should provide login function', () => {
      const { login } = useAuth()
      expect(typeof login).toBe('function')
    })

    it('should provide loginWithGithub function', () => {
      const { loginWithGithub } = useAuth()
      expect(typeof loginWithGithub).toBe('function')
    })

    it('should provide logout function', () => {
      const { logout } = useAuth()
      expect(typeof logout).toBe('function')
    })

    it('should provide fetchMe function', () => {
      const { fetchMe } = useAuth()
      expect(typeof fetchMe).toBe('function')
    })
  })

  describe('token management', () => {
    it('should provide refreshTokens function', () => {
      const { refreshTokens } = useAuth()
      expect(typeof refreshTokens).toBe('function')
    })

    it('should provide checkAndRefreshToken function', () => {
      const { checkAndRefreshToken } = useAuth()
      expect(typeof checkAndRefreshToken).toBe('function')
    })

    it('should provide startTokenRefreshTimer function', () => {
      const { startTokenRefreshTimer } = useAuth()
      expect(typeof startTokenRefreshTimer).toBe('function')
    })

    it('should provide stopTokenRefreshTimer function', () => {
      const { stopTokenRefreshTimer } = useAuth()
      expect(typeof stopTokenRefreshTimer).toBe('function')
    })
  })
})
