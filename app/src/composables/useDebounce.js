/**
 * useDebounce - Debounce and throttle utilities for performance optimization
 * Helps reduce the frequency of function calls during rapid events like scrolling, resizing, and typing
 */
import { ref, watch, onUnmounted, getCurrentInstance } from 'vue'

/**
 * Creates a debounced version of a function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Object} Debounced function with cancel method
 */
export function useDebounce(fn, delay = 300) {
  let timer = null
  const isPending = ref(false)

  const debouncedFn = function (...args) {
    if (timer) {
      clearTimeout(timer)
    }

    isPending.value = true

    timer = setTimeout(() => {
      fn.apply(this, args)
      isPending.value = false
      timer = null
    }, delay)
  }

  const cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
      isPending.value = false
    }
  }

  const flush = (...args) => {
    cancel()
    fn.apply(this, args)
  }

  // Only register cleanup if in component context
  if (getCurrentInstance()) {
    onUnmounted(cancel)
  }

  return {
    debouncedFn,
    isPending,
    cancel,
    flush
  }
}

/**
 * Creates a throttled version of a function
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Minimum time between calls in milliseconds
 * @param {Object} options - { leading: true, trailing: true }
 * @returns {Object} Throttled function with cancel method
 */
export function useThrottle(fn, limit = 300, options = { leading: true, trailing: true }) {
  let lastCall = 0
  let timer = null
  let lastArgs = null
  const isPending = ref(false)

  const throttledFn = function (...args) {
    const now = Date.now()
    lastArgs = args

    // Leading edge - execute immediately if within limit
    if (options.leading && now - lastCall >= limit) {
      fn.apply(this, args)
      lastCall = now
    } else if (options.trailing) {
      // Trailing edge - execute after limit
      isPending.value = true

      if (timer) clearTimeout(timer)

      timer = setTimeout(() => {
        fn.apply(this, lastArgs)
        lastCall = Date.now()
        isPending.value = false
        timer = null
      }, limit - (now - lastCall))
    }
  }

  const cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
      isPending.value = false
    }
  }

  const flush = () => {
    cancel()
    if (lastArgs) {
      fn.apply(this, lastArgs)
    }
  }

  // Only register cleanup if in component context
  if (getCurrentInstance()) {
    onUnmounted(cancel)
  }

  return {
    throttledFn,
    isPending,
    cancel,
    flush
  }
}

/**
 * Creates a reactive debounced value
 * @param {Ref} source - Source ref to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Object} { debouncedValue, isDebouncing }
 */
export function useDebouncedRef(source, delay = 300) {
  const debouncedValue = ref(source.value)
  const isDebouncing = ref(false)
  let timer = null

  watch(source, (newVal) => {
    isDebouncing.value = true

    if (timer) clearTimeout(timer)

    timer = setTimeout(() => {
      debouncedValue.value = newVal
      isDebouncing.value = false
      timer = null
    }, delay)
  })

  // Only register cleanup if in component context
  if (getCurrentInstance()) {
    onUnmounted(() => {
      if (timer) {
        clearTimeout(timer)
      }
    })
  }

  return {
    debouncedValue,
    isDebouncing
  }
}

/**
 * Creates a throttled ref that only updates at most once per limit
 * @param {Ref} source - Source ref to throttle
 * @param {number} limit - Minimum time between updates in milliseconds
 * @returns {Object} { throttledValue, isThrottling }
 */
export function useThrottledRef(source, limit = 100) {
  const throttledValue = ref(source.value)
  const isThrottling = ref(false)
  let lastUpdate = 0
  let pendingUpdate = null
  let timer = null

  watch(source, (newVal) => {
    const now = Date.now()
    const timeSinceLastUpdate = now - lastUpdate

    if (timeSinceLastUpdate >= limit) {
      // Update immediately
      throttledValue.value = newVal
      lastUpdate = now
      isThrottling.value = false

      // Clear any pending update
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    } else {
      // Schedule update for later
      isThrottling.value = true
      pendingUpdate = newVal

      if (timer) clearTimeout(timer)

      timer = setTimeout(() => {
        throttledValue.value = pendingUpdate
        lastUpdate = Date.now()
        isThrottling.value = false
        pendingUpdate = null
        timer = null
      }, limit - timeSinceLastUpdate)
    }
  })

  // Only register cleanup if in component context
  if (getCurrentInstance()) {
    onUnmounted(() => {
      if (timer) {
        clearTimeout(timer)
      }
    })
  }

  return {
    throttledValue,
    isThrottling
  }
}

export default {
  useDebounce,
  useThrottle,
  useDebouncedRef,
  useThrottledRef
}
