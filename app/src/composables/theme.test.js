/**
 * useTheme Composable Tests
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useTheme } from './theme.js'

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('isDark', () => {
    it('should default to dark theme', () => {
      const { isDark } = useTheme()
      expect(isDark.value).toBe(true)
    })
  })

  describe('toggle', () => {
    it('should provide toggle function', () => {
      const { toggle } = useTheme()
      expect(typeof toggle).toBe('function')
    })
  })

  describe('init', () => {
    it('should provide init function', () => {
      const { init } = useTheme()
      expect(typeof init).toBe('function')
    })
  })
})
