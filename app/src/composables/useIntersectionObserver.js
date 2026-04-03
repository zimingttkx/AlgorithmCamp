/**
 * useIntersectionObserver - Intersection Observer composable for performance optimization
 * Enables lazy loading, animation pausing for off-screen elements, and scroll-driven effects
 */
import { ref, onMounted, onUnmounted, watch, getCurrentInstance } from 'vue'

/**
 * Create an Intersection Observer for a target element
 * @param {Object} options - Configuration options
 * @param {string|Element} options.target - CSS selector or element ref
 * @param {Function} options.onIntersect - Callback when intersection changes
 * @param {Object} options.intersectionOptions - IntersectionObserver options
 * @param {boolean} options.immediate - Start observing immediately on mount
 * @returns {Object} Intersection Observer API
 */
export function useIntersectionObserver(options = {}) {
  const {
    target = null,
    onIntersect = null,
    intersectionOptions = {},
    immediate = true
  } = options

  const {
    root = null,
    rootMargin = '0px',
    threshold = 0
  } = intersectionOptions

  const isIntersecting = ref(false)
  const hasIntersected = ref(false)
  const intersectionRatio = ref(0)
  const observationTarget = ref(null)

  let observer = null
  let targetElement = null

  const defaultOptions = {
    root,
    rootMargin,
    threshold
  }

  // Create observer
  function createObserver() {
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('IntersectionObserver not supported')
      return null
    }

    return new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isIntersecting.value = entry.isIntersecting
        intersectionRatio.value = entry.intersectionRatio

        if (entry.isIntersecting) {
          hasIntersected.value = true
        }

        if (onIntersect) {
          onIntersect({
            isIntersecting: entry.isIntersecting,
            intersectionRatio: entry.intersectionRatio,
            target: entry.target
          })
        }
      })
    }, defaultOptions)
  }

  // Start observing
  function observe(el) {
    if (!el) return

    targetElement = el
    observationTarget.value = el

    if (!observer) {
      observer = createObserver()
    }

    if (observer) {
      observer.observe(el)
    }
  }

  // Stop observing
  function unobserve() {
    if (observer && targetElement) {
      observer.unobserve(targetElement)
      targetElement = null
    }
  }

  // Disconnect observer
  function disconnect() {
    if (observer) {
      observer.disconnect()
      observer = null
    }
    isIntersecting.value = false
    hasIntersected.value = false
    intersectionRatio.value = 0
  }

  // Set observation target after mount
  onMounted(() => {
    if (immediate) {
      // If target is a selector string, wait for DOM
      if (typeof target === 'string') {
        // Defer to next tick for DOM to settle
        setTimeout(() => {
          const el = document.querySelector(target)
          if (el) observe(el)
        }, 0)
      } else if (target && target.value) {
        observe(target.value)
      }
    }
  })

  // Cleanup
  onUnmounted(() => {
    disconnect()
  })

  return {
    // State
    isIntersecting,
    hasIntersected,
    intersectionRatio,
    observationTarget,

    // Methods
    observe,
    unobserve,
    disconnect
  }
}

/**
 * useScrollAnimation - Scroll-driven animation with Intersection Observer
 * Automatically pauses animations for off-screen elements
 * @param {Object} options - Configuration options
 * @param {string|Element} options.target - Target element
 * @param {string} options.animationClass - Class to add when visible
 * @param {Object} options.intersectionOptions - Observer options
 * @returns {Object} Scroll animation API
 */
export function useScrollAnimation(options = {}) {
  const {
    target = null,
    animationClass = 'is-visible',
    intersectionOptions = {
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    }
  } = options

  const isVisible = ref(false)
  const wasEverVisible = ref(false)

  const { onIntersect } = useIntersectionObserver({
    target,
    immediate: false,
    intersectionOptions
  })

  // Callback when intersection changes
  onIntersect((entry) => {
    isVisible.value = entry.isIntersecting

    if (entry.isIntersecting) {
      wasEverVisible.value = true
    }
  })

  function observe(el) {
    if (!el) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible.value = entry.isIntersecting

        if (entry.isIntersecting) {
          wasEverVisible.value = true
          el.classList.add(animationClass)
        } else {
          el.classList.remove(animationClass)
        }
      })
    }, intersectionOptions)

    observer.observe(el)

    return () => observer.disconnect()
  }

  return {
    isVisible,
    wasEverVisible,
    observe
  }
}

/**
 * useLazyLoad - Lazy load images and content with Intersection Observer
 * @param {Object} options - Configuration options
 * @param {string} options.src - Source URL for lazy loading
 * @param {string} options.rootMargin - Margin before intersection
 * @returns {Object} Lazy load API
 */
export function useLazyLoad(options = {}) {
  const {
    src = '',
    rootMargin = '100px'
  } = options

  const isLoaded = ref(false)
  const isInView = ref(false)
  const hasError = ref(false)
  const loadedSrc = ref('')

  let observer = null

  function loadImage() {
    if (!src || isLoaded.value) return

    const img = new Image()

    img.onload = () => {
      loadedSrc.value = src
      isLoaded.value = true
      hasError.value = false
    }

    img.onerror = () => {
      hasError.value = true
      isLoaded.value = false
    }

    img.src = src
  }

  function observe(el) {
    if (!el || typeof IntersectionObserver === 'undefined') {
      // Fallback: load immediately
      loadImage()
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isInView.value = true
            loadImage()
            // Once loaded, no need to keep observing
            if (observer) {
              observer.disconnect()
            }
          }
        })
      },
      { rootMargin }
    )

    observer.observe(el)
  }

  function disconnect() {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  // Only register cleanup if in component context
  if (getCurrentInstance()) {
    onUnmounted(disconnect)
  }

  return {
    isLoaded,
    isInView,
    hasError,
    loadedSrc,
    observe,
    disconnect
  }
}

/**
 * useInfiniteScroll - Infinite scroll pagination with Intersection Observer
 * @param {Object} options - Configuration options
 * @param {Function} options.onLoadMore - Callback to load more items
 * @param {Object} options.intersectionOptions - Observer options
 * @returns {Object} Infinite scroll API
 */
export function useInfiniteScroll(options = {}) {
  const {
    onLoadMore = null,
    intersectionOptions = {
      rootMargin: '200px'
    }
  } = options

  const isLoading = ref(false)
  const hasMore = ref(true)
  const isInView = ref(false)

  let observer = null
  let sentinel = null

  function observe(el) {
    if (!el || typeof IntersectionObserver === 'undefined') {
      console.warn('IntersectionObserver not supported')
      return
    }

    sentinel = el

    observer = new IntersectionObserver(
      async (entries) => {
        for (const entry of entries) {
          isInView.value = entry.isIntersecting

          if (entry.isIntersecting && hasMore.value && !isLoading.value) {
            isLoading.value = true

            if (onLoadMore) {
              const result = await onLoadMore()
              // If result is false or undefined, assume no more items
              if (result === false) {
                hasMore.value = false
              }
            }

            isLoading.value = false
          }
        }
      },
      intersectionOptions
    )

    observer.observe(el)
  }

  function disconnect() {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  function reset() {
    isLoading.value = false
    hasMore.value = true
    isInView.value = false
  }

  // Only register cleanup if in component context
  if (getCurrentInstance()) {
    onUnmounted(disconnect)
  }

  return {
    isLoading,
    hasMore,
    isInView,
    observe,
    disconnect,
    reset
  }
}

export default {
  useIntersectionObserver,
  useScrollAnimation,
  useLazyLoad,
  useInfiniteScroll
}
