/**
 * useCoreWebVitals - Core Web Vitals monitoring and optimization utilities
 *
 * Core Web Vitals are Google's metrics for measuring user experience:
 * - LCP (Largest Contentful Paint) < 2.5s - Measures loading performance
 * - FID (First Input Delay) < 100ms - Measures interactivity (replaced by INP)
 * - CLS (Cumulative Layout Shift) < 0.1 - Measures visual stability
 * - INP (Interaction to Next Paint) < 200ms - Measures responsiveness
 *
 * This composable provides:
 * - Real-time metric monitoring
 * - Performance optimization utilities
 * - Metric reporting for analytics
 */

import { ref, shallowRef, onMounted, onUnmounted } from 'vue'

// Singleton state for web vitals tracking
let metrics = shallowRef({
  LCP: null,
  FID: null,
  CLS: null,
  INP: null,
  TBT: null, // Total Blocking Time
})

let metricEntries = shallowRef([])
let observer = null
let inpObserver = null
let clsRafId = null
let isInitialized = false

/**
 * Initialize Core Web Vitals observers
 * Uses Performance Observer API to capture real user metrics
 */
function initWebVitals() {
  if (isInitialized || typeof window === 'undefined') return
  isInitialized = true

  // LCP Observer - Track largest contentful paint
  try {
    observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]

      if (lastEntry) {
        metrics.value.LCP = {
          value: lastEntry.startTime,
          element: lastEntry.element ? lastEntry.element.tagName : 'unknown',
          size: lastEntry.size,
          url: lastEntry.url || null,
        }

        metricEntries.value = [...metricEntries.value, {
          name: 'LCP',
          value: lastEntry.startTime,
          timestamp: Date.now(),
        }]
      }
    })

    observer.observe({ type: 'largest-contentful-paint', buffered: true })
  } catch (e) {
    console.warn('[WebVitals] LCP observer not supported:', e)
  }

  // FID Observer (First Input Delay)
  try {
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.processingStart > entry.startTime) {
          const fid = entry.processingStart - entry.startTime

          metrics.value.FID = {
            value: fid,
            element: entry.target ? entry.target.tagName : 'unknown',
          }

          metricEntries.value = [...metricEntries.value, {
            name: 'FID',
            value: fid,
            timestamp: Date.now(),
          }]
        }
      }
    })

    fidObserver.observe({ type: 'first-input', buffered: true })
  } catch (e) {
    console.warn('[WebVitals] FID observer not supported:', e)
  }

  // CLS Observer with session window tracking
  let clsValue = 0
  let clsEntries = []
  let sessionValue = 0
  let sessionStart = 0
  let sessionEntries = []

  function resetClsSession() {
    sessionValue = 0
    sessionStart = Date.now()
    sessionEntries = []
  }

  resetClsSession()

  try {
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Only count layout shifts without recent user input
        if (!entry.hadRecentInput) {
          clsEntries.push(entry)
          sessionEntries.push(entry)

          // Calculate session score
          const now = Date.now()
          const windowStart = now - 1000

          // Remove old entries outside the session window
          sessionEntries = sessionEntries.filter(e => e.startTime > windowStart)

          // Calculate session window value
          let sessionScore = 0
          for (const e of sessionEntries) {
            if (e.hadRecentInput) continue
            sessionScore += e.value
          }

          // If session exceeds 1 second, start new session
          if (sessionEntries.length > 0 &&
              sessionEntries[0].startTime < now - 1000) {
            resetClsSession()
          }

          // Use cumulative value for reporting
          clsValue += entry.value

          metrics.value.CLS = {
            value: clsValue,
            sessionValue: sessionScore,
            sources: entry.sources ? entry.sources.length : 0,
          }

          metricEntries.value = [...metricEntries.value, {
            name: 'CLS',
            value: clsValue,
            timestamp: Date.now(),
          }]
        }
      }
    })

    clsObserver.observe({ type: 'layout-shift', buffered: true })
  } catch (e) {
    console.warn('[WebVitals] CLS observer not supported:', e)
  }

  // INP Observer (Interaction to Next Paint) - replaces FID
  let inpValue = 0
  let inpEntries = []

  try {
    inpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.interactionId > 0) {
          inpEntries.push(entry)

          // INP is the max interaction delay over all interactions
          const duration = entry.processingStart + entry.duration - entry.startTime

          if (duration > inpValue) {
            inpValue = duration
          }

          metrics.value.INP = {
            value: inpValue,
            element: entry.target ? entry.target.tagName : 'unknown',
            duration: duration,
          }

          metricEntries.value = [...metricEntries.value, {
            name: 'INP',
            value: inpValue,
            timestamp: Date.now(),
          }]
        }
      }
    })

    inpObserver.observe({ type: 'event', buffered: true })
  } catch (e) {
    console.warn('[WebVitals] INP observer not supported:', e)
  }
}

/**
 * Main composable for Core Web Vitals
 * @param {Object} options - Configuration options
 * @returns {Object} Web Vitals API
 */
export function useCoreWebVitals(options = {}) {
  const {
    reportOnUnload = true,
    debug = false,
    onMetric,
  } = options

  const isSupported = ref(false)
  const latestMetrics = shallowRef({})
  const metricHistory = shallowRef([])

  onMounted(() => {
    if (typeof window === 'undefined') return

    isSupported.value = 'PerformanceObserver' in window

    if (isSupported.value) {
      initWebVitals()

      // Watch for metric updates and report
      if (onMetric) {
        const interval = setInterval(() => {
          const current = metrics.value
          if (current.LCP && current.LCP.value !== latestMetrics.value.LCP?.value) {
            onMetric({ name: 'LCP', value: current.LCP?.value })
          }
          if (current.CLS && current.CLS.value !== latestMetrics.value.CLS?.value) {
            onMetric({ name: 'CLS', value: current.CLS?.value })
          }
        }, 1000)

        onUnmounted(() => clearInterval(interval))
      }

      latestMetrics.value = metrics.value
    }
  })

  // Clean up observers on unmount
  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
    if (inpObserver) {
      inpObserver.disconnect()
      inpObserver = null
    }
    if (clsRafId) {
      cancelAnimationFrame(clsRafId)
      clsRafId = null
    }
  })

  /**
   * Get current metric values
   */
  function getMetrics() {
    return {
      LCP: metrics.value.LCP ? metrics.value.LCP.value : null,
      FID: metrics.value.FID ? metrics.value.FID.value : null,
      CLS: metrics.value.CLS ? metrics.value.CLS.value : null,
      INP: metrics.value.INP ? metrics.value.INP.value : null,
      TBT: metrics.value.TBT || null,
    }
  }

  /**
   * Check if metrics meet thresholds
   * @returns {Object} Pass/fail status for each metric
   */
  function checkThresholds() {
    const m = getMetrics()
    return {
      LCP: m.LCP !== null && m.LCP <= 2500,
      FID: m.FID !== null && m.FID <= 100,
      CLS: m.CLS !== null && m.CLS <= 0.1,
      INP: m.INP !== null && m.INP <= 200,
    }
  }

  /**
   * Get performance score (0-100) based on metrics
   */
  function getScore() {
    const m = getMetrics()
    let score = 100

    if (m.LCP !== null) {
      // LCP: 0 points if > 4s, -25 points if > 2.5s
      if (m.LCP > 4000) score -= 50
      else if (m.LCP > 2500) score -= 25
    }

    if (m.CLS !== null) {
      // CLS: heavy penalty for layout shifts
      if (m.CLS > 0.25) score -= 30
      else if (m.CLS > 0.1) score -= 15
    }

    if (m.INP !== null) {
      // INP: penalties for slow interactions
      if (m.INP > 500) score -= 20
      else if (m.INP > 200) score -= 10
    }

    return Math.max(0, score)
  }

  /**
   * Log metrics for debugging
   */
  function debugLog() {
    if (!debug) return
    const m = getMetrics()
    console.log('[Core Web Vitals]', {
      LCP: m.LCP ? `${m.LCP.toFixed(0)}ms` : 'N/A',
      FID: m.FID ? `${m.FID.toFixed(0)}ms` : 'N/A',
      CLS: m.CLS ? m.CLS.toFixed(3) : 'N/A',
      INP: m.INP ? `${m.INP.toFixed(0)}ms` : 'N/A',
      Score: getScore(),
    })
  }

  return {
    // State
    metrics: latestMetrics,
    isSupported,
    metricHistory: metricEntries,

    // Methods
    getMetrics,
    checkThresholds,
    getScore,
    debugLog,

    // Thresholds
    THRESHOLDS: {
      LCP: 2500,   // 2.5s
      FID: 100,    // 100ms
      CLS: 0.1,    // 0.1
      INP: 200,    // 200ms
      TBT: 200,    // 200ms for Total Blocking Time
    },
  }
}

/**
 * Preload critical resources for better LCP
 * @param {string} href - Resource URL
 * @param {string} as - Resource type (script, style, image, font, etc.)
 * @param {string} fetchpriority - Priority hint (high, low, auto)
 */
export function preloadResource(href, as, fetchpriority = 'auto') {
  if (typeof document === 'undefined') return

  // Check if already preloaded
  const existing = document.querySelector(`link[href="${href}"]`)
  if (existing) return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  if (fetchpriority !== 'auto') {
    link.setAttribute('fetchpriority', fetchpriority)
  }
  document.head.appendChild(link)
}

/**
 * Add async attribute to script for non-critical JS
 * @param {string} src - Script URL
 * @param {Function} onLoad - Callback when loaded
 */
export function loadScriptAsync(src, onLoad) {
  if (typeof document === 'undefined') return

  const script = document.createElement('script')
  script.src = src
  script.async = true
  if (onLoad) {
    script.onload = onLoad
    script.onerror = onLoad
  }
  document.body.appendChild(script)
}

/**
 * Reserve space for an element to prevent CLS
 * @param {Element} el - Element to reserve space for
 * @param {string} minHeight - Minimum height to reserve (e.g., '200px')
 */
export function reserveSpace(el, minHeight) {
  if (!el) return

  // Store original min-height if not already set
  if (!el.dataset.originalMinHeight) {
    el.dataset.originalMinHeight = el.style.minHeight || getComputedStyle(el).minHeight || ''
  }

  el.style.minHeight = minHeight

  // Return cleanup function
  return () => {
    el.style.minHeight = el.dataset.originalMinHeight || ''
  }
}

/**
 * Set explicit dimensions on images to prevent CLS
 * @param {Element} img - Image element
 * @param {number} width - Expected width
 * @param {number} height - Expected height
 */
export function setImageDimensions(img, width, height) {
  if (!img) return

  // Store original dimensions if not set
  if (!img.dataset.originalWidth) {
    img.dataset.originalWidth = img.getAttribute('width') || ''
  }
  if (!img.dataset.originalHeight) {
    img.dataset.originalHeight = img.getAttribute('height') || ''
  }

  // Only set if not already specified
  if (!img.getAttribute('width')) {
    img.setAttribute('width', String(width))
  }
  if (!img.getAttribute('height')) {
    img.setAttribute('height', String(height))
  }

  // Ensure aspect-ratio is set to prevent layout shift
  if (!img.style.aspectRatio && width && height) {
    img.style.aspectRatio = `${width} / ${height}`
  }
}

/**
 * Defer a callback until the next idle period
 * Helps break up long tasks to improve FID/INP
 * @param {Function} callback - Function to execute
 * @param {Object} options - requestIdleCallback options
 */
export function requestIdleCallbackPolyfill(callback, options = {}) {
  if (typeof requestIdleCallback !== 'undefined') {
    return requestIdleCallback(callback, options)
  }

  // Fallback to setTimeout for Safari
  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => 50,
    })
  }, 1)
}

/**
 * Cancel a scheduled idle callback
 * @ {number} id - Callback ID from requestIdleCallbackPolyfill
 */
export function cancelIdleCallbackPolyfill(id) {
  if (typeof cancelIdleCallback !== 'undefined') {
    cancelIdleCallback(id)
  } else {
    clearTimeout(id)
  }
}

/**
 * Break up long tasks to improve responsiveness
 * @param {Function} task - Task to execute
 * @param {number} yieldMs - Milliseconds to yield control
 */
export function yieldToMain(task, yieldMs = 0) {
  return new Promise((resolve) => {
    if (yieldMs > 0) {
      setTimeout(() => {
        requestAnimationFrame(() => {
          task()
          resolve()
        })
      }, yieldMs)
    } else {
      requestAnimationFrame(() => {
        task()
        resolve()
      })
    }
  })
}

export default {
  useCoreWebVitals,
  preloadResource,
  loadScriptAsync,
  reserveSpace,
  setImageDimensions,
  requestIdleCallbackPolyfill,
  cancelIdleCallbackPolyfill,
  yieldToMain,
}
