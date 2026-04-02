/**
 * useResponsive - Responsive design utilities
 * Provides breakpoint-aware responsive state management
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'

// Breakpoint values
const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
}

export function useResponsive() {
  const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)
  const viewportHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 800)

  const isMobile = computed(() => viewportWidth.value < BREAKPOINTS.tablet)
  const isTablet = computed(() => viewportWidth.value >= BREAKPOINTS.tablet && viewportWidth.value < BREAKPOINTS.desktop)
  const isDesktop = computed(() => viewportWidth.value >= BREAKPOINTS.desktop && viewportWidth.value < BREAKPOINTS.wide)
  const isWide = computed(() => viewportWidth.value >= BREAKPOINTS.wide)

  const isSplitScreen = computed(() => viewportWidth.value < 900 && viewportWidth.value >= BREAKPOINTS.tablet)

  const splitScreenType = computed(() => {
    if (viewportWidth.value < 500) return 'narrow'
    if (viewportWidth.value < 700) return 'compact'
    if (viewportWidth.value < 900) return 'normal'
    return 'none'
  })

  function handleResize() {
    viewportWidth.value = window.innerWidth
    viewportHeight.value = window.innerHeight
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize, { passive: true })
      handleResize()
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize)
    }
  })

  return {
    viewportWidth,
    viewportHeight,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    isSplitScreen,
    splitScreenType,
    BREAKPOINTS,
  }
}

export default useResponsive
