/**
 * useResponsive Composable Tests
 */
import { describe, it, expect } from 'vitest'
import { useResponsive } from './useResponsive.js'

describe('useResponsive', () => {
  describe('BREAKPOINTS', () => {
    it('should have correct breakpoint values', () => {
      const responsive = useResponsive()
      expect(responsive.BREAKPOINTS.mobile).toBe(480)
      expect(responsive.BREAKPOINTS.tablet).toBe(768)
      expect(responsive.BREAKPOINTS.desktop).toBe(1024)
      expect(responsive.BREAKPOINTS.wide).toBe(1280)
    })
  })

  describe('viewport dimensions', () => {
    it('should return viewport state objects', () => {
      const { viewportWidth, viewportHeight } = useResponsive()
      expect(viewportWidth.value).toBeDefined()
      expect(viewportHeight.value).toBeDefined()
    })
  })

  describe('breakpoint computed properties', () => {
    it('should have isMobile computed property', () => {
      const { isMobile } = useResponsive()
      expect(isMobile.value).toBeDefined()
      expect(typeof isMobile.value).toBe('boolean')
    })

    it('should have isTablet computed property', () => {
      const { isTablet } = useResponsive()
      expect(isTablet.value).toBeDefined()
      expect(typeof isTablet.value).toBe('boolean')
    })

    it('should have isDesktop computed property', () => {
      const { isDesktop } = useResponsive()
      expect(isDesktop.value).toBeDefined()
      expect(typeof isDesktop.value).toBe('boolean')
    })

    it('should have isWide computed property', () => {
      const { isWide } = useResponsive()
      expect(isWide.value).toBeDefined()
      expect(typeof isWide.value).toBe('boolean')
    })

    it('should have isSplitScreen computed property', () => {
      const { isSplitScreen } = useResponsive()
      expect(isSplitScreen.value).toBeDefined()
      expect(typeof isSplitScreen.value).toBe('boolean')
    })

    it('should have splitScreenType computed property', () => {
      const { splitScreenType } = useResponsive()
      expect(splitScreenType.value).toBeDefined()
    })
  })
})
