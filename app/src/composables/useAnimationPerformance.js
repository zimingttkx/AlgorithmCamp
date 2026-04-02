/**
 * useAnimationPerformance - Animation performance monitoring
 * Provides FPS tracking, performance detection, and animation quality management
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * Create animation performance monitor
 * @param {Object} options - Configuration options
 * @param {string} options.name - Name for debugging
 * @param {number} options.threshold - FPS threshold for low performance (default: 45)
 * @returns {Object} Animation performance API
 */
export function useAnimationPerformance(options = {}) {
  const {
    name = 'Animation',
    threshold = 45,
  } = options

  const currentFPS = ref(60)
  const isLowPerformance = ref(false)
  const shouldAnimate = ref(true)
  const prefersReducedMotion = ref(false)
  const animationQuality = ref('high') // high, medium, low

  let frameCount = 0
  let lastTime = performance.now()
  let rafId = null
  let lowPerformanceStart = null
  const LOW_PERFORMANCE_THRESHOLD_MS = 2000

  // Check for prefers-reduced-motion
  function checkReducedMotion() {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
  }

  // FPS measurement loop
  function measureFPS() {
    frameCount++
    const now = performance.now()
    const delta = now - lastTime

    if (delta >= 1000) {
      const fps = Math.round((frameCount * 1000) / delta)
      currentFPS.value = fps

      // Detect low performance
      if (fps < threshold && !isLowPerformance.value) {
        if (!lowPerformanceStart) {
          lowPerformanceStart = now
        } else if (now - lowPerformanceStart > LOW_PERFORMANCE_THRESHOLD_MS) {
          isLowPerformance.value = true
          updateAnimationQuality()
        }
      } else if (fps >= threshold && isLowPerformance.value) {
        // Recover from low performance
        if (lowPerformanceStart && now - lowPerformanceStart < LOW_PERFORMANCE_THRESHOLD_MS) {
          isLowPerformance.value = false
          lowPerformanceStart = null
          updateAnimationQuality()
        }
      }

      frameCount = 0
      lastTime = now
    }

    rafId = requestAnimationFrame(measureFPS)
  }

  // Update animation quality based on performance
  function updateAnimationQuality() {
    if (isLowPerformance.value || prefersReducedMotion.value) {
      animationQuality.value = 'low'
      shouldAnimate.value = false
    } else if (currentFPS.value < 55) {
      animationQuality.value = 'medium'
      shouldAnimate.value = true
    } else {
      animationQuality.value = 'high'
      shouldAnimate.value = true
    }
  }

  onMounted(() => {
    checkReducedMotion()

    if (!prefersReducedMotion.value) {
      rafId = requestAnimationFrame(measureFPS)
    }

    // Listen for reduced motion preference changes
    if (typeof window !== 'undefined') {
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        prefersReducedMotion.value = e.matches
        if (e.matches) {
          shouldAnimate.value = false
          animationQuality.value = 'low'
          if (rafId) {
            cancelAnimationFrame(rafId)
            rafId = null
          }
        } else {
          shouldAnimate.value = true
          animationQuality.value = 'high'
          rafId = requestAnimationFrame(measureFPS)
        }
      })
    }
  })

  onUnmounted(() => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  })

  return {
    currentFPS,
    isLowPerformance,
    shouldAnimate,
    prefersReducedMotion,
    animationQuality,
  }
}

export default useAnimationPerformance
