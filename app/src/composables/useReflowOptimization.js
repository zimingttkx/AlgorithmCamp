/**
 * useReflowOptimization - Composables for minimizing browser reflow and repaint
 * Provides utilities for batch DOM reads/writes and CSS property optimization
 */

/**
 * Batch DOM operations to minimize reflows
 * Implements the read/write cycle pattern where all reads are done first,
 * then all writes are done together
 *
 * @returns {Object} Batch API with read, write, and flush methods
 */
export function useBatchedDOM() {
  let reads = []
  let writes = []
  let rafId = null

  function read(fn) {
    reads.push(fn)
  }

  function write(fn) {
    writes.push(fn)
  }

  function flush() {
    // Execute all reads first
    const readResults = reads.map(fn => fn())

    // Then execute all writes
    writes.forEach(fn => fn())

    // Clear queues
    reads = []
    writes = []

    return readResults
  }

  function scheduleFlush() {
    if (rafId) return

    rafId = requestAnimationFrame(() => {
      flush()
      rafId = null
    })
  }

  function cancelFlush() {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    reads = []
    writes = []
  }

  return {
    read,
    write,
    flush,
    scheduleFlush,
    cancelFlush
  }
}

/**
 * Use CSS containment for isolated rendering
 * Helps browser optimize painting by containing layout/paint to element subtree
 *
 * @param {Element} el - Element to apply containment
 * @param {string} type - Containment type: 'layout', 'paint', 'strict', 'content'
 * @returns {Object} Containment API
 */
export function useContainment(el, type = 'layout') {
  const containmentTypes = {
    layout: 'layout',
    paint: 'paint',
    strict: 'strict',
    content: 'content'
  }

  function applyContainment() {
    if (!el) return

    const containValue = containmentTypes[type] || 'layout'
    el.style.contain = containValue
  }

  function removeContainment() {
    if (!el) return
    el.style.contain = 'none'
  }

  return {
    applyContainment,
    removeContainment
  }
}

/**
 * Use CSS will-change for hinting browser about upcoming animations
 * Should be applied sparingly and removed after animation completes
 *
 * @param {Element} el - Element to optimize
 * @param {string} property - Property that will change: 'transform', 'opacity', 'transform, opacity'
 * @returns {Object} Will-change API
 */
export function useWillChange(el, property = 'transform, opacity') {
  function applyWillChange() {
    if (!el) return
    el.style.willChange = property
  }

  function removeWillChange() {
    if (!el) return
    // Clear will-change after animation
    el.style.willChange = 'auto'
  }

  return {
    applyWillChange,
    removeWillChange
  }
}

/**
 * Batch multiple classList operations to reduce reflows
 *
 * @param {Element} el - Element to optimize
 * @returns {Object} Class batch API
 */
export function useClassBatch(el) {
  if (!el) {
    return {
      add: () => {},
      remove: () => {},
      toggle: () => {},
      flush: () => {}
    }
  }

  let pendingAdds = new Set()
  let pendingRemoves = new Set()
  let pendingToggles = new Map()
  let rafId = null

  function add(className) {
    pendingAdds.add(className)
    pendingRemoves.delete(className)
    scheduleFlush()
  }

  function remove(className) {
    pendingRemoves.add(className)
    pendingAdds.delete(className)
    scheduleFlush()
  }

  function toggle(className, force) {
    pendingToggles.set(className, force)
    scheduleFlush()
  }

  function flush() {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }

    // Process all removals
    if (pendingRemoves.size > 0) {
      pendingRemoves.forEach(className => {
        el.classList.remove(className)
      })
      pendingRemoves.clear()
    }

    // Process all additions
    if (pendingAdds.size > 0) {
      pendingAdds.forEach(className => {
        el.classList.add(className)
      })
      pendingAdds.clear()
    }

    // Process all toggles
    if (pendingToggles.size > 0) {
      pendingToggles.forEach((force, className) => {
        el.classList.toggle(className, force)
      })
      pendingToggles.clear()
    }
  }

  function scheduleFlush() {
    if (rafId) return
    rafId = requestAnimationFrame(flush)
  }

  function cancelFlush() {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    pendingAdds.clear()
    pendingRemoves.clear()
    pendingToggles.clear()
  }

  return {
    add,
    remove,
    toggle,
    flush,
    cancelFlush
  }
}

/**
 * Create a stable layout measurement cache
 * Caches layout measurements to avoid repeated reflows
 *
 * @returns {Object} Measurement cache API
 */
export function useLayoutCache() {
  const cache = new Map()
  const layoutProps = [
    'offsetWidth', 'offsetHeight', 'offsetTop', 'offsetLeft',
    'clientWidth', 'clientHeight', 'clientTop', 'clientLeft',
    'getBoundingClientRect'
  ]

  function getMeasuredValue(element, prop) {
    const key = `${element.__uid || element.__vue__?.uid || 'unknown'}_${prop}`

    if (cache.has(key)) {
      return cache.get(key)
    }

    let value
    if (prop === 'getBoundingClientRect') {
      value = element.getBoundingClientRect()
    } else {
      value = element[prop]
    }

    cache.set(key, value)
    return value
  }

  function invalidate(element) {
    if (!element) return

    const uid = element.__uid || element.__vue__?.uid || 'unknown'

    // Remove all entries for this element
    for (const key of cache.keys()) {
      if (key.startsWith(`${uid}_`)) {
        cache.delete(key)
      }
    }
  }

  function clear() {
    cache.clear()
  }

  return {
    getMeasuredValue,
    invalidate,
    clear
  }
}

/**
 * Use requestAnimationFrame for smooth visual updates
 * Batches updates within the same frame
 *
 * @param {Function} callback - Function to call on next animation frame
 * @returns {Object} RAF API
 */
export function useRafCallback(callback) {
  let rafId = null
  let lastArgs = null

  function schedule(...args) {
    lastArgs = args

    if (rafId) return

    rafId = requestAnimationFrame(() => {
      if (lastArgs && callback) {
        callback(...lastArgs)
      }
      rafId = null
      lastArgs = null
    })
  }

  function cancel() {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
      lastArgs = null
    }
  }

  function flush(...args) {
    cancel()
    if (callback) {
      callback(...args)
    }
  }

  return {
    schedule,
    cancel,
    flush
  }
}

/**
 * GPU-accelerated transform shortcuts for common animations
 * Uses translate3d to force GPU acceleration
 *
 * @param {Element} el - Element to animate
 * @returns {Object} Transform API
 */
export function useGpuTransform(el) {
  function translate3d(x, y, z = 0) {
    if (!el) return
    el.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`
  }

  function translateX(x) {
    if (!el) return
    el.style.transform = `translate3d(${x}px, 0, 0)`
  }

  function translateY(y) {
    if (!el) return
    el.style.transform = `translate3d(0, ${y}px, 0)`
  }

  function scale(factor) {
    if (!el) return
    el.style.transform = `scale(${factor})`
  }

  function reset() {
    if (!el) return
    el.style.transform = ''
  }

  return {
    translate3d,
    translateX,
    translateY,
    scale,
    reset
  }
}

export default {
  useBatchedDOM,
  useContainment,
  useWillChange,
  useClassBatch,
  useLayoutCache,
  useRafCallback,
  useGpuTransform
}
