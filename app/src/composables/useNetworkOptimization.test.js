/**
 * useNetworkOptimization Composable Tests
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fetchWithAbort, fetchWithRetry, useNetworkOptimization, useBatchedRequest } from './useNetworkOptimization.js'

// Mock fetch
global.fetch = vi.fn()

// Mock setTimeout/clearTimeout
global.setTimeout = vi.fn((cb, delay) => cb())
global.clearTimeout = vi.fn()

describe('useNetworkOptimization', () => {
  let networkOpt

  beforeEach(() => {
    vi.clearAllMocks()
    networkOpt = useNetworkOptimization()
  })

  afterEach(() => {
    // Clean up any pending timers
    vi.restoreAllMocks()
  })

  describe('fetchWithAbort', () => {
    it('should fetch data successfully', async () => {
      const mockData = { solved: 100 }
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData)
      })

      const result = await fetchWithAbort('https://api.example.com/data')
      expect(result).toEqual(mockData)
      expect(global.fetch).toHaveBeenCalled()
    })

    it('should throw error on non-ok response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' })
      })

      await expect(fetchWithAbort('https://api.example.com/data')).rejects.toThrow('Not found')
    })

    it('should handle abort signal', async () => {
      const controller = new AbortController()
      let rejectFn = null

      global.fetch = vi.fn().mockImplementation((url, options) => {
        return new Promise((resolve, reject) => {
          rejectFn = reject
          if (options.signal) {
            options.signal.addEventListener('abort', () => {
              const err = new Error('The user aborted the request.')
              err.name = 'AbortError'
              reject(err)
            })
          }
          // Never resolves (simulating long request)
        })
      })

      const promise = fetchWithAbort('https://api.example.com/data', {}, controller.signal)

      // Trigger abort immediately via the external controller
      controller.abort()

      // The promise should reject with AbortError
      await expect(promise).rejects.toThrow()
    })
  })

  describe('fetchWithRetry', () => {
    it('should retry on failure and succeed', async () => {
      const mockData = { solved: 50 }
      global.fetch = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockData)
        })

      const result = await fetchWithRetry('https://api.example.com/data', {}, { attempts: 3, delay: 10, backoff: 2 })
      expect(result).toEqual(mockData)
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should throw after exhausting retries', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Persistent error'))

      await expect(fetchWithRetry('https://api.example.com/data', {}, { attempts: 3, delay: 10, backoff: 2 }))
        .rejects.toThrow('Persistent error')

      expect(global.fetch).toHaveBeenCalledTimes(3)
    })

    it('should not retry on 4xx errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Bad request' })
      })

      await expect(fetchWithRetry('https://api.example.com/data', {}, { attempts: 3, delay: 10, backoff: 2 }))
        .rejects.toThrow()

      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('useCancellableRequest', () => {
    it('should provide loading and error states', async () => {
      let resolveFn
      const mockPromise = new Promise(resolve => { resolveFn = resolve })

      global.fetch = vi.fn().mockImplementation(() => mockPromise)

      const { execute, cancel, isLoading, error, data } = networkOpt.useCancellableRequest(
        (url, signal) => fetch(url, { signal })
      )

      expect(isLoading.value).toBe(false)
      expect(error.value).toBe(null)
      expect(data.value).toBe(null)
    })

    it('should allow cancellation', () => {
      const { cancel, isLoading } = networkOpt.useCancellableRequest(
        () => new Promise(() => {})
      )

      // Cancellation doesn't throw
      expect(() => cancel()).not.toThrow()
    })
  })

  describe('useRetryableRequest', () => {
    it('should track retry count', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Temporary error'))

      const { execute, retryCount, isLoading } = networkOpt.useRetryableRequest(
        () => fetch('https://api.example.com/data').then(r => r.json()),
        { attempts: 3, delay: 10, backoff: 2 }
      )

      await expect(execute()).rejects.toThrow()

      expect(retryCount.value).toBe(3)
      expect(isLoading.value).toBe(false)
    })
  })

  describe('useRequestTracker', () => {
    it('should track multiple requests', async () => {
      const { trackRequest, isLoading, loadingCount, cancelAll } = networkOpt.useRequestTracker()

      let resolve1, resolve2
      const promise1 = new Promise(resolve => { resolve1 = resolve })
      const promise2 = new Promise(resolve => { resolve2 = resolve })

      const tracked1 = trackRequest('req1', promise1)
      const tracked2 = trackRequest('req2', promise2)

      expect(isLoading.value).toBe(true)
      expect(loadingCount.value).toBe(2)

      resolve1({ data: 'result1' })
      await tracked1

      expect(loadingCount.value).toBe(1)

      resolve2({ data: 'result2' })
      await tracked2

      expect(isLoading.value).toBe(false)
      expect(loadingCount.value).toBe(0)
    })

    it('should cancel all requests', () => {
      const { trackRequest, cancelAll, loadingCount } = networkOpt.useRequestTracker()

      trackRequest('req1', new Promise(() => {}))
      trackRequest('req2', new Promise(() => {}))

      expect(loadingCount.value).toBe(2)

      cancelAll()

      expect(loadingCount.value).toBe(0)
    })
  })

  describe('useLoadingState', () => {
    it('should manage loading states correctly', () => {
      const { startLoading, setProgress, setError, setSuccess, reset, isLoading, isError, isSuccess, progress } = networkOpt.useLoadingState()

      startLoading()
      expect(isLoading.value).toBe(true)
      expect(isError.value).toBe(false)
      expect(isSuccess.value).toBe(false)

      setProgress(50)
      expect(progress.value).toBe(50)

      setError('Something went wrong')
      expect(isError.value).toBe(true)
      expect(isLoading.value).toBe(false)

      reset()
      expect(isError.value).toBe(false)
      expect(progress.value).toBe(0)
    })

    it('should set success state', () => {
      const { setSuccess, isLoading, isSuccess, progress } = networkOpt.useLoadingState()

      setSuccess()

      expect(isSuccess.value).toBe(true)
      expect(isLoading.value).toBe(false)
      expect(progress.value).toBe(100)
    })
  })

  describe('DEFAULT_CONFIG', () => {
    it('should have correct default values', () => {
      expect(networkOpt.DEFAULT_CONFIG.retryAttempts).toBe(3)
      expect(networkOpt.DEFAULT_CONFIG.retryDelay).toBe(1000)
      expect(networkOpt.DEFAULT_CONFIG.retryBackoff).toBe(2)
      expect(networkOpt.DEFAULT_CONFIG.batchWindow).toBe(100)
      expect(networkOpt.DEFAULT_CONFIG.timeout).toBe(30000)
    })
  })

  describe('sleep', () => {
    it('should be a function', () => {
      expect(typeof networkOpt.sleep).toBe('function')
    })
  })
})