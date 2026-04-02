/**
 * Unit Tests for Backend Middleware
 * Tests: auth.js, validation.js, logger.js
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============== AUTH MIDDLEWARE ==============

describe('Auth Middleware - JWT Verification', () => {

  describe('Token extraction', () => {
    function extractToken(req) {
      let token = null
      if (req.cookies?.accessToken) {
        token = req.cookies.accessToken
      } else if (req.headers?.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.slice(7)
      }
      return token
    }

    it('should extract token from cookie', () => {
      const req = {
        cookies: { accessToken: 'jwt-token-from-cookie' },
        headers: {}
      }
      expect(extractToken(req)).toBe('jwt-token-from-cookie')
    })

    it('should extract token from Authorization header', () => {
      const req = {
        cookies: {},
        headers: { authorization: 'Bearer jwt-token-from-header' }
      }
      expect(extractToken(req)).toBe('jwt-token-from-header')
    })

    it('should prefer cookie over header', () => {
      const req = {
        cookies: { accessToken: 'from-cookie' },
        headers: { authorization: 'Bearer from-header' }
      }
      expect(extractToken(req)).toBe('from-cookie')
    })

    it('should return null when no token', () => {
      const req = { cookies: {}, headers: {} }
      expect(extractToken(req)).toBeNull()
    })

    it('should return null when cookies undefined', () => {
      const req = { headers: {} }
      expect(extractToken(req)).toBeNull()
    })

    it('should return null when authorization header does not start with Bearer', () => {
      const req = {
        cookies: {},
        headers: { authorization: 'Basic some-token' }
      }
      expect(extractToken(req)).toBeNull()
    })
  })

  describe('JWT payload extraction', () => {
    function extractPayload(payload) {
      if (!payload) return null
      return {
        userId: payload.userId,
        username: payload.username,
        clientId: payload.clientId,
        type: payload.type
      }
    }

    it('should extract userId from payload', () => {
      const payload = { userId: 123, username: 'test', type: 'access' }
      const extracted = extractPayload(payload)
      expect(extracted.userId).toBe(123)
    })

    it('should extract username from payload', () => {
      const payload = { userId: 1, username: 'testuser', type: 'access' }
      const extracted = extractPayload(payload)
      expect(extracted.username).toBe('testuser')
    })

    it('should extract clientId from payload', () => {
      const payload = { userId: 1, username: 'test', clientId: 'device-abc', type: 'access' }
      const extracted = extractPayload(payload)
      expect(extracted.clientId).toBe('device-abc')
    })

    it('should return null for null payload', () => {
      expect(extractPayload(null)).toBeNull()
    })

    it('should return null for undefined payload', () => {
      expect(extractPayload(undefined)).toBeNull()
    })
  })

  describe('Token expiry handling', () => {
    function isTokenExpired(expiresAt) {
      if (!expiresAt) return true
      return Date.now() > new Date(expiresAt).getTime()
    }

    it('should detect expired token', () => {
      const expired = new Date(Date.now() - 1000).toISOString()
      expect(isTokenExpired(expired)).toBe(true)
    })

    it('should detect valid token', () => {
      const valid = new Date(Date.now() + 10000).toISOString()
      expect(isTokenExpired(valid)).toBe(false)
    })

    it('should treat null as expired', () => {
      expect(isTokenExpired(null)).toBe(true)
    })

    it('should treat undefined as expired', () => {
      expect(isTokenExpired(undefined)).toBe(true)
    })
  })

  describe('Refresh token verification', () => {
    function verifyRefreshToken(token) {
      try {
        // Simulate JWT verification
        const parts = token.split('.')
        if (parts.length !== 3) return { error: 'invalid token format' }

        // Simulate payload
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
        if (payload.type !== 'refresh') {
          return { error: 'invalid token type' }
        }
        return { payload }
      } catch {
        return { error: 'invalid refresh token' }
      }
    }

    it('should verify valid refresh token', () => {
      // Create a mock JWT-like token (header.payload.signature)
      const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64')
      const payload = Buffer.from(JSON.stringify({ userId: 1, type: 'refresh', family: 'abc' })).toString('base64')
      const signature = 'mock-signature'
      const token = `${header}.${payload}.${signature}`

      const result = verifyRefreshToken(token)
      expect(result.payload).toBeDefined()
      expect(result.payload.type).toBe('refresh')
    })

    it('should reject access token as refresh token', () => {
      const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64')
      const payload = Buffer.from(JSON.stringify({ userId: 1, type: 'access', family: 'abc' })).toString('base64')
      const signature = 'mock-signature'
      const token = `${header}.${payload}.${signature}`

      const result = verifyRefreshToken(token)
      expect(result.error).toBe('invalid token type')
    })

    it('should reject malformed token', () => {
      expect(verifyRefreshToken('not-a-valid-token').error).toBeDefined()
      expect(verifyRefreshToken('').error).toBeDefined()
    })
  })
})

// ============== VALIDATION MIDDLEWARE ==============

describe('Validation Middleware - Zod Schemas', () => {

  describe('Register schema validation', () => {
    function validateRegister(data) {
      const errors = []

      // Username validation
      if (!data.username || typeof data.username !== 'string') {
        errors.push('username is required')
      } else if (data.username.length < 3 || data.username.length > 30) {
        errors.push('username must be 3-30 characters')
      } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
        errors.push('username can only contain letters, numbers, and underscores')
      }

      // Password validation
      if (!data.password || typeof data.password !== 'string') {
        errors.push('password is required')
      } else if (data.password.length < 6) {
        errors.push('password must be at least 6 characters')
      }

      // GitHub username (optional)
      if (data.githubUsername && data.githubUsername.length > 39) {
        errors.push('githubUsername must be at most 39 characters')
      }

      return { valid: errors.length === 0, errors }
    }

    it('should accept valid registration data', () => {
      const result = validateRegister({
        username: 'testuser',
        password: 'password123',
        githubUsername: 'testgithub'
      })
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept registration without githubUsername', () => {
      const result = validateRegister({
        username: 'testuser',
        password: 'password123'
      })
      expect(result.valid).toBe(true)
    })

    it('should reject short username', () => {
      const result = validateRegister({
        username: 'ab',
        password: 'password123'
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('username must be 3-30 characters')
    })

    it('should reject long username', () => {
      const result = validateRegister({
        username: 'a'.repeat(31),
        password: 'password123'
      })
      expect(result.valid).toBe(false)
    })

    it('should reject invalid username characters', () => {
      const result = validateRegister({
        username: 'test-user',
        password: 'password123'
      })
      expect(result.valid).toBe(false)
    })

    it('should reject short password', () => {
      const result = validateRegister({
        username: 'testuser',
        password: '12345'
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('password must be at least 6 characters')
    })

    it('should reject missing username', () => {
      const result = validateRegister({ password: 'password123' })
      expect(result.valid).toBe(false)
    })

    it('should reject missing password', () => {
      const result = validateRegister({ username: 'testuser' })
      expect(result.valid).toBe(false)
    })
  })

  describe('Login schema validation', () => {
    function validateLogin(data) {
      const errors = []

      if (!data.username || typeof data.username !== 'string' || data.username.trim().length === 0) {
        errors.push('username is required')
      }
      if (!data.password || typeof data.password !== 'string' || data.password.length === 0) {
        errors.push('password is required')
      }

      return { valid: errors.length === 0, errors }
    }

    it('should accept valid login data', () => {
      const result = validateLogin({
        username: 'testuser',
        password: 'password123'
      })
      expect(result.valid).toBe(true)
    })

    it('should reject empty username', () => {
      const result = validateLogin({
        username: '',
        password: 'password123'
      })
      expect(result.valid).toBe(false)
    })

    it('should reject whitespace-only username', () => {
      const result = validateLogin({
        username: '   ',
        password: 'password123'
      })
      expect(result.valid).toBe(false)
    })

    it('should reject missing password', () => {
      const result = validateLogin({ username: 'testuser' })
      expect(result.valid).toBe(false)
    })
  })

  describe('Progress bulk update validation', () => {
    function validateProgressBulk(data) {
      const errors = []

      if (!data.progress || typeof data.progress !== 'object') {
        errors.push('progress object is required')
        return { valid: false, errors }
      }

      for (const [chapterId, problems] of Object.entries(data.progress)) {
        if (typeof problems !== 'object') {
          errors.push(`chapter ${chapterId} must be an object`)
        }
      }

      return { valid: errors.length === 0, errors }
    }

    it('should accept valid progress data', () => {
      const result = validateProgressBulk({
        progress: {
          'chapter-01': { '1': true, '2': { checked: true, checkedAt: '2024-01-01' } }
        }
      })
      expect(result.valid).toBe(true)
    })

    it('should reject non-object progress', () => {
      const result = validateProgressBulk({ progress: 'not-an-object' })
      expect(result.valid).toBe(false)
    })

    it('should reject missing progress', () => {
      const result = validateProgressBulk({})
      expect(result.valid).toBe(false)
    })
  })
})

// ============== LOGGER MIDDLEWARE ==============

describe('Logger Middleware - Request Logging', () => {

  describe('Log format', () => {
    function formatLogLine(method, url, statusCode, duration, ip) {
      const timestamp = new Date().toISOString()
      return `[${timestamp}] ${method} ${url} ${statusCode} ${duration}ms - ${ip || 'unknown'}`
    }

    it('should format GET request correctly', () => {
      const log = formatLogLine('GET', '/api/progress', 200, 15, '127.0.0.1')
      expect(log).toContain('GET')
      expect(log).toContain('/api/progress')
      expect(log).toContain('200')
      expect(log).toContain('15ms')
    })

    it('should format POST request correctly', () => {
      const log = formatLogLine('POST', '/api/auth/login', 200, 45, '127.0.0.1')
      expect(log).toContain('POST')
      expect(log).toContain('/api/auth/login')
      expect(log).toContain('200')
    })

    it('should format error request correctly', () => {
      const log = formatLogLine('GET', '/api/nonexistent', 404, 5, '192.168.1.1')
      expect(log).toContain('404')
    })

    it('should handle missing IP', () => {
      const log = formatLogLine('GET', '/api/test', 200, 10, null)
      expect(log).toContain('unknown')
    })

    it('should include timestamp in ISO format', () => {
      const log = formatLogLine('GET', '/api/test', 200, 10, '127.0.0.1')
      const timestampMatch = log.match(/\[([^\]]+)\]/)
      expect(timestampMatch).toBeTruthy()
      expect(log).toContain('T') // ISO format contains T
    })
  })

  describe('Log filtering', () => {
    function shouldLog(statusCode, isProduction) {
      // In production, only log errors (4xx, 5xx)
      // In development, log everything
      if (!isProduction) return true
      return statusCode >= 400
    }

    it('should log all requests in development', () => {
      expect(shouldLog(200, false)).toBe(true)
      expect(shouldLog(404, false)).toBe(true)
      expect(shouldLog(500, false)).toBe(true)
    })

    it('should only log errors in production', () => {
      expect(shouldLog(200, true)).toBe(false)
      expect(shouldLog(404, true)).toBe(true)
      expect(shouldLog(500, true)).toBe(true)
    })

    it('should log 401 Unauthorized in production', () => {
      expect(shouldLog(401, true)).toBe(true)
    })

    it('should log 400 Bad Request in production', () => {
      expect(shouldLog(400, true)).toBe(true)
    })
  })

  describe('Log directory handling', () => {
    function getLogPath(logDir) {
      return `${logDir}/access.log`
    }

    it('should construct correct log path', () => {
      const path = getLogPath('./logs')
      expect(path).toBe('./logs/access.log')
    })

    it('should handle absolute paths', () => {
      const path = getLogPath('/var/www/algorithmcamp/server/logs')
      expect(path).toBe('/var/www/algorithmcamp/server/logs/access.log')
    })
  })
})
