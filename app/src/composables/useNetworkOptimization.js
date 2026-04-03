/**
 * useNetworkOptimization - Network performance utilities for API request optimization
 *
 * Features:
 * - Request cancellation with AbortController
 * - Error retry mechanism with exponential backoff
 * - Request batching for multiple API calls
 * - Loading state optimization
 */
import { ref, onUnmounted, getCurrentInstance } from 'vue'

// Singleton state for request tracking
const activeRequests = ref(new Map())
const requestQueue = ref([])
const batchTimers = {}

// Default configuration
const DEFAULT_CONFIG = {
  retryAttempts: 3,
  retryDelay: 1000,
  retryBackoff: 2,
  batchWindow: 100, // ms to wait for batching requests
  timeout: 30000,   // 30s default timeout
}

/**
 * Create a fetch request with AbortController support
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {AbortSignal} signal - Optional external signal
 * @returns {Promise<Object>} Response data
 */
export async function fetchWithAbort(url, options = {}, signal = null) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || DEFAULT_CONFIG.timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: signal || controller.signal,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
      const error = new Error(errorData.error || `HTTP ${response.status}`)
      error.status = response.status
      throw error
    }

    return await response.json()
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Fetch with automatic retry on failure
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {Object} retryConfig - { attempts, delay, backoff }
 * @returns {Promise<Object>} Response data
 */
export async function fetchWithRetry(url, options = {}, retryConfig = {}) {
  const { attempts = DEFAULT_CONFIG.retryAttempts, delay = DEFAULT_CONFIG.retryDelay, backoff = DEFAULT_CONFIG.retryBackoff } = retryConfig

  let lastError

  for (let i = 0; i < attempts; i++) {
    try {
      return await fetchWithAbort(url, options)
    } catch (error) {
      lastError = error

      // Don't retry on abort (cancellation) or client errors (4xx)
      if (error.name === 'AbortError' || (error.status >= 400 && error.status < 500)) {
        throw error
      }

      // Wait before retry with exponential backoff
      if (i < attempts - 1) {
        await sleep(delay * Math.pow(backoff, i))
      }
    }
  }

  throw lastError
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Create a batched fetch request
 * @param {string} batchKey - Key to identify the batch
 * @param {Function} requestFn - Function that returns a promise
 * @param {Object} config - { batchWindow, onBatchComplete }
 */
export function useBatchedRequest(batchKey, requestFn, config = {}) {
  const { batchWindow = DEFAULT_CONFIG.batchWindow, onBatchComplete } = config

  return new Promise((resolve, reject) => {
    requestQueue.value.push({ batchKey, requestFn, resolve, reject, timestamp: Date.now() })

    if (!batchTimers[batchKey]) {
      batchTimers[batchKey] = setTimeout(async () => {
        const batch = requestQueue.value.filter(r => r.batchKey === batchKey)
        requestQueue.value = requestQueue.value.filter(r => r.batchKey !== batchKey)
        delete batchTimers[batchKey]

        try {
          const results = await Promise.all(batch.map(r => r.requestFn()))
          batch.forEach((r, i) => r.resolve(results[i]))
          onBatchComplete?.(results)
        } catch (error) {
          batch.forEach(r => r.reject(error))
        }
      }, batchWindow)
    }
  })
}

/**
 * Main composable for network optimization
 */
export function useNetworkOptimization() {

  /**
   * Create a cancellable request with loading and error states
   * @param {Function} fetchFn - Async function that returns a promise
   * @returns {Object} { execute, cancel, isLoading, error, data }
   */
  function useCancellableRequest(fetchFn) {
    const controller = ref(new AbortController())
    const isLoading = ref(false)
    const error = ref(null)
    const data = ref(null)

    async function execute(...args) {
      // Cancel any pending request
      cancel()

      controller.value = new AbortController()
      isLoading.value = true
      error.value = null

      try {
        const result = await fetchFn(...args, controller.value.signal)
        data.value = result
        return result
      } catch (err) {
        if (err.name !== 'AbortError') {
          error.value = err.message || 'Request failed'
          throw err
        }
        error.value = 'Request cancelled'
        throw err
      } finally {
        isLoading.value = false
      }
    }

    function cancel() {
      if (controller.value) {
        controller.value.abort()
      }
    }

    // Only register cleanup if in component context
    if (getCurrentInstance()) {
      onUnmounted(cancel)
    }

    return {
      execute,
      cancel,
      isLoading,
      error,
      data,
    }
  }

  /**
   * Create a request with automatic retry
   * @param {Function} fetchFn - Async function that returns a promise
   * @param {Object} retryConfig - Retry configuration
   * @returns {Object} { execute, isLoading, error, data, retryCount }
   */
  function useRetryableRequest(fetchFn, retryConfig = {}) {
    const { attempts = DEFAULT_CONFIG.retryAttempts, delay = DEFAULT_CONFIG.retryDelay, backoff = DEFAULT_CONFIG.retryBackoff } = retryConfig

    const isLoading = ref(false)
    const error = ref(null)
    const data = ref(null)
    const retryCount = ref(0)
    const isRetrying = ref(false)

    async function execute(...args) {
      isLoading.value = true
      error.value = null
      retryCount.value = 0

      for (let i = 0; i < attempts; i++) {
        try {
          const result = await fetchFn(...args)
          data.value = result
          isLoading.value = false
          return result
        } catch (err) {
          retryCount.value = i + 1

          // Don't retry on abort or client errors (4xx)
          if (err.name === 'AbortError') {
            error.value = 'Request cancelled'
            isLoading.value = false
            throw err
          }

          const errMsg = err.message || ''
          if (errMsg.match(/HTTP [45]\d\d/) || errMsg.includes('cancel')) {
            error.value = errMsg
            isLoading.value = false
            throw err
          }

          if (i < attempts - 1) {
            isRetrying.value = true
            const waitTime = delay * Math.pow(backoff, i)
            console.log(`[Network] Retry ${i + 1}/${attempts} after ${waitTime}ms`)
            await sleep(waitTime)
          } else {
            error.value = err.message || 'Request failed after retries'
            isLoading.value = false
            throw err
          }
        }
      }

      isLoading.value = false
      isRetrying.value = false
    }

    function cancel() {
      error.value = 'Request cancelled'
      isLoading.value = false
      isRetrying.value = false
    }

    return {
      execute,
      cancel,
      isLoading,
      error,
      data,
      retryCount,
      isRetrying,
    }
  }

  /**
   * Track multiple requests with aggregated loading state
   * @returns {Object} { trackRequest, cancelAll, isLoading, loadingCount, errors }
   */
  function useRequestTracker() {
    const requests = ref(new Map())
    const isLoading = ref(false)
    const loadingCount = ref(0)
    const errors = ref([])

    function trackRequest(id, promise) {
      requests.value.set(id, { status: 'pending', promise })
      loadingCount.value++
      isLoading.value = true

      promise
        .then(result => {
          const req = requests.value.get(id)
          if (req) {
            req.status = 'success'
            req.result = result
          }
          loadingCount.value--
          if (loadingCount.value <= 0) {
            loadingCount.value = 0
            isLoading.value = false
          }
        })
        .catch(err => {
          const req = requests.value.get(id)
          if (req) {
            req.status = 'error'
            req.error = err
          }
          errors.value.push(err)
          loadingCount.value--
          if (loadingCount.value <= 0) {
            loadingCount.value = 0
            isLoading.value = false
          }
        })

      return promise
    }

    function cancelAll() {
      requests.value.forEach(req => {
        if (req.status === 'pending') {
          req.status = 'cancelled'
        }
      })
      loadingCount.value = 0
      isLoading.value = false
    }

    function getRequestStatus(id) {
      return requests.value.get(id)?.status || null
    }

    function clearErrors() {
      errors.value = []
    }

    return {
      trackRequest,
      cancelAll,
      getRequestStatus,
      clearErrors,
      isLoading,
      loadingCount,
      errors,
      requests,
    }
  }

  /**
   * Create a loading state manager for UI feedback
   * @returns {Object} Loading state helpers
   */
  function useLoadingState() {
    const isLoading = ref(false)
    const isError = ref(false)
    const isSuccess = ref(false)
    const errorMessage = ref('')
    const progress = ref(0)

    function startLoading() {
      isLoading.value = true
      isError.value = false
      isSuccess.value = false
      errorMessage.value = ''
      progress.value = 0
    }

    function setProgress(value) {
      progress.value = Math.min(100, Math.max(0, value))
    }

    function setError(message) {
      isLoading.value = false
      isError.value = true
      isSuccess.value = false
      errorMessage.value = message || 'An error occurred'
    }

    function setSuccess() {
      isLoading.value = false
      isError.value = false
      isSuccess.value = true
      progress.value = 100
    }

    function reset() {
      isLoading.value = false
      isError.value = false
      isSuccess.value = false
      errorMessage.value = ''
      progress.value = 0
    }

    return {
      isLoading,
      isError,
      isSuccess,
      errorMessage,
      progress,
      startLoading,
      setProgress,
      setError,
      setSuccess,
      reset,
    }
  }

  return {
    // Utilities
    fetchWithAbort,
    fetchWithRetry,
    useBatchedRequest,
    sleep,

    // Composables
    useCancellableRequest,
    useRetryableRequest,
    useRequestTracker,
    useLoadingState,

    // Constants
    DEFAULT_CONFIG,
  }
}

export default useNetworkOptimization