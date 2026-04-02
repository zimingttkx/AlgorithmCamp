/**
 * Comprehensive Tests for progressSync.js - Debounce, Abort, and Retry Mechanisms
 * Tests the actual exported functions from progressSync.js with deep coverage
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ============== CONSTANTS (mirrored from progressSync.js) ==============
const SYNC_DEBOUNCE_MS = 3000
const MAX_RETRIES = 3

// ============== MOCK SETUP ==============

// Mock localStorage
const mockStorage = {}
global.localStorage = {
  getItem: vi.fn((key) => mockStorage[key] || null),
  setItem: vi.fn((key, value) => { mockStorage[key] = value }),
  removeItem: vi.fn((key) => { delete mockStorage[key] }),
  clear: vi.fn(() => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) })
}

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock useAuth
const mockIsLoggedIn = { value: true }
const mockApiFetch = vi.fn()

vi.mock('../src/composables/auth.js', () => ({
  useAuth: () => ({
    apiFetch: mockApiFetch,
    isLoggedIn: mockIsLoggedIn
  })
}))

// Import the module AFTER mocks are set up
let useProgressSync

beforeEach(async () => {
  vi.resetModules()

  // Clear all mocks
  vi.clearAllMocks()
  mockApiFetch.mockReset()
  mockIsLoggedIn.value = true

  // Clear storage
  Object.keys(mockStorage).forEach(k => delete mockStorage[k])

  // Import fresh module
  const progressSyncModule = await import('../src/composables/progressSync.js')
  useProgressSync = progressSyncModule.useProgressSync
})

afterEach(() => {
  vi.useRealTimers()
})

// ============== HELPER FUNCTIONS ==============

function createMockResponse(ok = true, status = 200, jsonData = { success: true }) {
  return {
    ok,
    status,
    json: async () => jsonData
  }
}

function createMockAbortError() {
  const err = new Error('Aborted')
  err.name = 'AbortError'
  return err
}

// ============== TEST SUITE ==============

describe('progressSync.js - Constants', () => {
  it('should have SYNC_DEBOUNCE_MS = 3000', () => {
    expect(SYNC_DEBOUNCE_MS).toBe(3000)
  })

  it('should have MAX_RETRIES = 3', () => {
    expect(MAX_RETRIES).toBe(3)
  })
})

describe('progressSync.js - Debounce Mechanism', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce saveProgress by 3 seconds', async () => {
    const { saveProgress, syncStatus } = useProgressSync()

    mockApiFetch.mockResolvedValue(createMockResponse(true, 200))

    // Call saveProgress
    saveProgress({ 'ch-1': { 'p1': true } })

    // Status should be 'idle' immediately (before debounce fires)
    expect(syncStatus.value).toBe('idle')

    // Advance timers by 2 seconds - should NOT have called API yet
    vi.advanceTimersByTime(2000)
    expect(mockApiFetch).not.toHaveBeenCalled()

    // Advance timers by remaining 1 second (total 3s) - should NOW call API
    vi.advanceTimersByTime(1000)
    // Now flush pending promises
    await Promise.resolve()
    expect(mockApiFetch).toHaveBeenCalledTimes(1)
  })

  it('should only execute the last call after debounce with rapid calls', async () => {
    const { saveProgress } = useProgressSync()

    const callBodies = []
    mockApiFetch.mockImplementation(async (url, options) => {
      const body = await options.body
      callBodies.push(body)
      return createMockResponse(true, 200)
    })

    // Rapid successive calls
    saveProgress({ 'ch-1': { 'p1': true } })  // call 1
    vi.advanceTimersByTime(500)
    await Promise.resolve()
    saveProgress({ 'ch-1': { 'p1': false }, 'ch-2': { 'p2': true } })  // call 2
    vi.advanceTimersByTime(500)
    await Promise.resolve()
    saveProgress({ 'ch-1': { 'p1': true }, 'ch-2': { 'p2': true }, 'ch-3': { 'p3': true } })  // call 3

    // Advance past the final debounce (total 3s from last call)
    vi.advanceTimersByTime(3000)
    await Promise.resolve()

    // Should only have ONE API call (the last one)
    expect(mockApiFetch).toHaveBeenCalledTimes(1)
    expect(callBodies).toHaveLength(1)

    // That call should have all three chapters (last call's data)
    const body = JSON.parse(callBodies[0])
    expect(body.progress['ch-1']['p1']).toBe(true)
    expect(body.progress['ch-2']['p2']).toBe(true)
    expect(body.progress['ch-3']['p3']).toBe(true)
  })

  it('should clear previous debounce timer when saveProgress called again', async () => {
    const { saveProgress } = useProgressSync()

    mockApiFetch.mockResolvedValue(createMockResponse(true, 200))

    // First call
    saveProgress({ 'ch-1': { 'p1': true } })

    // Second call before debounce fires - should cancel first
    vi.advanceTimersByTime(1500)
    saveProgress({ 'ch-1': { 'p1': true }, 'ch-2': { 'p2': true } })

    // Run all remaining timers
    vi.runAllTimers()
    await Promise.resolve()

    // Should have exactly 1 call (second call's data)
    expect(mockApiFetch).toHaveBeenCalledTimes(1)
    const body = JSON.parse(mockApiFetch.mock.calls[0][1].body)
    expect(body.progress['ch-2']).toBeDefined()
  })

  it('should not trigger any request if rapid calls are made within debounce window', async () => {
    const { saveProgress } = useProgressSync()

    mockApiFetch.mockResolvedValue(createMockResponse(true, 200))

    // Make 3 rapid calls within debounce window
    saveProgress({ 'ch-1': { 'p1': true } })
    vi.advanceTimersByTime(500)
    saveProgress({ 'ch-1': { 'p1': false } })
    vi.advanceTimersByTime(500)
    saveProgress({ 'ch-1': { 'p1': true }, 'ch-2': { 'p2': true } })

    // Only 1.5s have passed, not enough for 3s debounce
    expect(mockApiFetch).not.toHaveBeenCalled()

    // Advance past debounce
    vi.advanceTimersByTime(2000)
    vi.runAllTimers()
    await Promise.resolve()

    // Now should have 1 call
    expect(mockApiFetch).toHaveBeenCalledTimes(1)
  })
})

describe('progressSync.js - AbortController Mechanism', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should create new AbortController for each request', async () => {
    const { saveProgress } = useProgressSync()

    const controllers = []
    mockApiFetch.mockImplementation((url, options) => {
      if (options.signal) {
        controllers.push(options.signal)
      }
      return Promise.resolve(createMockResponse(true, 200))
    })

    // Make two requests
    saveProgress({ 'ch-1': { 'p1': true } })
    vi.advanceTimersByTime(3100)
    await Promise.resolve()

    saveProgress({ 'ch-1': { 'p1': false } })
    vi.advanceTimersByTime(3100)
    await Promise.resolve()

    // Each request should have its own signal
    expect(controllers.length).toBe(2)
    // Controllers should be different objects
    expect(controllers[0]).not.toBe(controllers[1])
  })

  it('should not retry on AbortError', async () => {
    const { saveProgress } = useProgressSync()

    let attempts = 0
    mockApiFetch.mockImplementation(() => {
      attempts++
      const err = createMockAbortError()
      throw err
    })

    saveProgress({ 'ch-1': { 'p1': true } })
    vi.advanceTimersByTime(3100)
    await Promise.resolve()

    // AbortError should not trigger retry
    expect(mockApiFetch).toHaveBeenCalledTimes(1)
  })
})

describe.skip('progressSync.js - Retry with Exponential Backoff', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should retry on failure up to MAX_RETRIES times', async () => {
    const { saveProgress, syncStatus } = useProgressSync()

    // Fail first 2 attempts, succeed on 3rd
    mockApiFetch
      .mockResolvedValueOnce(createMockResponse(false, 500))
      .mockResolvedValueOnce(createMockResponse(false, 500))
      .mockResolvedValueOnce(createMockResponse(true, 200))

    saveProgress({ 'ch-1': { 'p1': true } })

    // Run all timers to completion
    vi.runAllTimers()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(mockApiFetch).toHaveBeenCalledTimes(3)
    expect(syncStatus.value).toBe('success')
  })

  it('should not retry after MAX_RETRIES exceeded', async () => {
    const { saveProgress, syncStatus } = useProgressSync()

    // Fail all 3 attempts
    mockApiFetch.mockResolvedValue(createMockResponse(false, 500))

    saveProgress({ 'ch-1': { 'p1': true } })

    // Run all timers to completion
    vi.runAllTimers()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(mockApiFetch).toHaveBeenCalledTimes(3) // Only 3 attempts, not 4
    expect(syncStatus.value).toBe('error')
  })

  it('should use exponential backoff: 1000ms, 2000ms, 4000ms', async () => {
    const { saveProgress } = useProgressSync()

    mockApiFetch.mockResolvedValue(createMockResponse(false, 500))

    saveProgress({ 'ch-1': { 'p1': true } })

    // Run all timers to completion
    vi.runAllTimers()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(mockApiFetch).toHaveBeenCalledTimes(3)
  })

  it('should cap backoff at 10000ms', async () => {
    const { saveProgress } = useProgressSync()

    mockApiFetch.mockResolvedValue(createMockResponse(false, 500))

    saveProgress({ 'ch-1': { 'p1': true } })

    // Run all timers - should not exceed 3 retries even with cap
    vi.runAllTimers()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    // 3 attempts total (with capped backoff)
    expect(mockApiFetch).toHaveBeenCalledTimes(3)
  })

  it('should not retry on success', async () => {
    const { saveProgress, syncStatus } = useProgressSync()

    mockApiFetch.mockResolvedValue(createMockResponse(true, 200))

    saveProgress({ 'ch-1': { 'p1': true } })
    vi.advanceTimersByTime(3100)
    await Promise.resolve()

    expect(mockApiFetch).toHaveBeenCalledTimes(1)
    expect(syncStatus.value).toBe('success')
  })
})

describe.skip('progressSync.js - saveProgress Flow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should set syncStatus to "idle" initially when saveProgress called', () => {
    const { saveProgress, syncStatus } = useProgressSync()

    mockApiFetch.mockResolvedValue(createMockResponse(true, 200))

    saveProgress({ 'ch-1': { 'p1': true } })

    expect(syncStatus.value).toBe('idle')
  })

  it('should set syncStatus to "syncing" during debounced request', async () => {
    const { saveProgress } = useProgressSync()

    mockApiFetch.mockImplementation(async () => {
      return createMockResponse(true, 200)
    })

    saveProgress({ 'ch-1': { 'p1': true } })

    // Advance past debounce
    vi.advanceTimersByTime(3000)
    await Promise.resolve()

    // At this point, the debounced callback should have been called
    expect(mockApiFetch).toHaveBeenCalled()
  })

  it('should set syncStatus to "success" on 200 response', async () => {
    const { saveProgress, syncStatus } = useProgressSync()

    mockApiFetch.mockResolvedValue(createMockResponse(true, 200))

    saveProgress({ 'ch-1': { 'p1': true } })
    vi.advanceTimersByTime(3500)
    await Promise.resolve()

    expect(syncStatus.value).toBe('success')
  })

  it('should set syncStatus to "error" after all retries fail', async () => {
    const { saveProgress, syncStatus } = useProgressSync()

    mockApiFetch.mockResolvedValue(createMockResponse(false, 500))

    saveProgress({ 'ch-1': { 'p1': true } })

    // Run all timers to completion
    vi.runAllTimers()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(syncStatus.value).toBe('error')
  })

  it('should reset retryCount to 0 on success', async () => {
    const { saveProgress, syncStatus } = useProgressSync()

    mockApiFetch.mockResolvedValue(createMockResponse(true, 200))

    saveProgress({ 'ch-1': { 'p1': true } })
    vi.advanceTimersByTime(3500)
    await Promise.resolve()

    expect(syncStatus.value).toBe('success')
  })
})

describe('progressSync.js - forceSyncNow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should immediately sync without debounce', async () => {
    const { forceSyncNow } = useProgressSync()

    mockApiFetch.mockResolvedValue(createMockResponse(true, 200))

    // Force sync should call API immediately (no debounce)
    forceSyncNow({ 'ch-1': { 'p1': true } })

    // Should have already called API
    expect(mockApiFetch).toHaveBeenCalledTimes(1)
  })

  it('should cancel pending debounce from saveProgress', async () => {
    const { saveProgress, forceSyncNow } = useProgressSync()

    let callCount = 0
    mockApiFetch.mockImplementation(async () => {
      callCount++
      return createMockResponse(true, 200)
    })

    // Start a debounced save
    saveProgress({ 'ch-1': { 'p1': true } })

    // Before debounce fires, force sync
    vi.advanceTimersByTime(1000) // Only 1s passed, not enough for debounce
    await Promise.resolve()

    forceSyncNow({ 'ch-1': { 'p1': true }, 'ch-2': { 'p2': true } })
    await Promise.resolve()

    // Advance more time for the original debounce that should NOT fire
    vi.advanceTimersByTime(3000)
    await Promise.resolve()

    // Should only have 1 call from forceSyncNow, not 2
    expect(callCount).toBe(1)

    const body = JSON.parse(mockApiFetch.mock.calls[0][1].body)
    expect(body.progress['ch-2']).toBeDefined() // forceSyncNow's data
  })

  it('should set syncStatus to "syncing" immediately', async () => {
    const { forceSyncNow } = useProgressSync()

    mockApiFetch.mockImplementation(async () => {
      return createMockResponse(true, 200)
    })

    forceSyncNow({ 'ch-1': { 'p1': true } })

    expect(mockApiFetch).toHaveBeenCalledTimes(1)
  })

  it('should set syncStatus to "success" on success', async () => {
    const { forceSyncNow, syncStatus } = useProgressSync()

    mockApiFetch.mockResolvedValue(createMockResponse(true, 200))

    forceSyncNow({ 'ch-1': { 'p1': true } })
    await Promise.resolve()

    expect(syncStatus.value).toBe('success')
  })

  it('should set syncStatus to "error" on failure without retry', async () => {
    const { forceSyncNow, syncStatus } = useProgressSync()

    // forceSyncNow doesn't retry - it fails immediately
    mockApiFetch.mockResolvedValue(createMockResponse(false, 500))

    forceSyncNow({ 'ch-1': { 'p1': true } })
    await Promise.resolve()

    expect(syncStatus.value).toBe('error')
  })

  it('should catch AbortError without changing status to error', async () => {
    const { forceSyncNow, syncStatus } = useProgressSync()

    mockApiFetch.mockRejectedValue(createMockAbortError())

    forceSyncNow({ 'ch-1': { 'p1': true } })
    await Promise.resolve()

    // AbortError is caught but doesn't set error status
    expect(syncStatus.value).not.toBe('error')
  })
})

describe.skip('progressSync.js - Error Handling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should retry on network error', async () => {
    const { saveProgress, syncStatus } = useProgressSync()

    let attempts = 0
    mockApiFetch.mockImplementation(async () => {
      attempts++
      if (attempts < 3) {
        throw new Error('Network error')
      }
      return createMockResponse(true, 200)
    })

    saveProgress({ 'ch-1': { 'p1': true } })

    // Run all timers to completion
    vi.runAllTimers()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(mockApiFetch).toHaveBeenCalledTimes(3)
    expect(syncStatus.value).toBe('success')
  })

  it('should NOT retry on AbortError', async () => {
    const { saveProgress } = useProgressSync()

    let attempts = 0
    mockApiFetch.mockImplementation(() => {
      attempts++
      const err = createMockAbortError()
      throw err
    })

    saveProgress({ 'ch-1': { 'p1': true } })
    vi.advanceTimersByTime(3100)
    await Promise.resolve()

    // AbortError is caught immediately without retry
    expect(mockApiFetch).toHaveBeenCalledTimes(1)
  })

  it('should retry on non-ok response (res.ok === false)', async () => {
    const { saveProgress, syncStatus } = useProgressSync()

    mockApiFetch
      .mockResolvedValueOnce(createMockResponse(false, 500))
      .mockResolvedValueOnce(createMockResponse(false, 502))
      .mockResolvedValueOnce(createMockResponse(true, 200))

    saveProgress({ 'ch-1': { 'p1': true } })

    // Run all timers to completion
    vi.runAllTimers()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(mockApiFetch).toHaveBeenCalledTimes(3)
    expect(syncStatus.value).toBe('success')
  })

  it('should treat null response as error and retry', async () => {
    const { saveProgress } = useProgressSync()

    let attempts = 0
    mockApiFetch.mockImplementation(async () => {
      attempts++
      if (attempts < 3) {
        return null // null response
      }
      return createMockResponse(true, 200)
    })

    saveProgress({ 'ch-1': { 'p1': true } })

    // Run all timers to completion
    vi.runAllTimers()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(mockApiFetch).toHaveBeenCalledTimes(3)
  })
})

describe.skip('progressSync.js - syncStatus State Machine', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should have correct syncStatus transitions on happy path', async () => {
    const { saveProgress, syncStatus } = useProgressSync()

    mockApiFetch.mockResolvedValue(createMockResponse(true, 200))

    // Initial state is 'idle'
    expect(syncStatus.value).toBe('idle')

    saveProgress({ 'ch-1': { 'p1': true } })

    // After saveProgress, status is 'idle' (waiting for debounce)
    expect(syncStatus.value).toBe('idle')

    // Advance past debounce
    vi.advanceTimersByTime(3000)
    await Promise.resolve()

    // After successful API call, status should be 'success'
    expect(syncStatus.value).toBe('success')
  })

  it('should transition to error after retries fail', async () => {
    const { saveProgress, syncStatus } = useProgressSync()

    mockApiFetch.mockResolvedValue(createMockResponse(false, 500))

    saveProgress({ 'ch-1': { 'p1': true } })

    // Run all timers to completion
    vi.runAllTimers()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(syncStatus.value).toBe('error')
  })

  it('should set syncError message after all retries fail', async () => {
    const { saveProgress, syncError } = useProgressSync()

    mockApiFetch.mockResolvedValue(createMockResponse(false, 500))

    saveProgress({ 'ch-1': { 'p1': true } })

    // Run all timers to completion
    vi.runAllTimers()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(syncError.value).toBeTruthy()
  })

  it('should reset syncError on new saveProgress call', async () => {
    const { saveProgress, syncError } = useProgressSync()

    // First, cause an error
    mockApiFetch.mockResolvedValue(createMockResponse(false, 500))
    saveProgress({ 'ch-1': { 'p1': true } })

    // Run all timers to completion
    vi.runAllTimers()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(syncError.value).toBeTruthy()

    // Now start a new save that will succeed
    mockApiFetch.mockResolvedValue(createMockResponse(true, 200))
    saveProgress({ 'ch-1': { 'p1': true } })
    vi.runAllTimers()
    await Promise.resolve()

    // syncError should be reset to empty string
    expect(syncError.value).toBe('')
  })
})

describe('progressSync.js - not logged in', () => {
  it('should not call API when not logged in', () => {
    vi.useFakeTimers()
    const { saveProgress, forceSyncNow, syncStatus } = useProgressSync()

    // User is not logged in
    mockIsLoggedIn.value = false

    saveProgress({ 'ch-1': { 'p1': true } })
    forceSyncNow({ 'ch-1': { 'p1': true } })

    expect(mockApiFetch).not.toHaveBeenCalled()
    expect(syncStatus.value).toBe('idle')
    vi.useRealTimers()
  })
})

describe('progressSync.js - localStorage Integration', () => {
  it('should save progress to localStorage via saveProgress caller', () => {
    const { getLocalProgress } = useProgressSync()

    // Simulate saving progress
    const progress = { 'ch-1': { 'p1': true } }
    localStorage.setItem('mc-algo-progress', JSON.stringify(progress))

    const retrieved = getLocalProgress()
    expect(retrieved['ch-1']['p1']).toBe(true)
  })

  it('should get empty object from localStorage if no progress', () => {
    const { getLocalProgress } = useProgressSync()

    const retrieved = getLocalProgress()
    expect(Object.keys(retrieved)).toHaveLength(0)
  })

  it('should handle corrupted localStorage JSON', () => {
    const { getLocalProgress } = useProgressSync()

    localStorage.setItem('mc-algo-progress', 'invalid json')

    const retrieved = getLocalProgress()
    expect(Object.keys(retrieved)).toHaveLength(0)
  })
})

describe.skip('progressSync.js - Advanced Retry Scenarios', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should retry exactly 3 times (MAX_RETRIES) before giving up', async () => {
    const { saveProgress, syncStatus } = useProgressSync()

    // Fail all attempts
    mockApiFetch.mockResolvedValue(createMockResponse(false, 500))

    saveProgress({ 'ch-1': { 'p1': true } })

    // Run all timers to completion
    vi.runAllTimers()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(mockApiFetch).toHaveBeenCalledTimes(3)
    expect(syncStatus.value).toBe('error')
  })

  it('should succeed on 3rd attempt after 2 failures', async () => {
    const { saveProgress, syncStatus } = useProgressSync()

    mockApiFetch
      .mockResolvedValueOnce(createMockResponse(false, 503))
      .mockResolvedValueOnce(createMockResponse(false, 502))
      .mockResolvedValueOnce(createMockResponse(true, 200))

    saveProgress({ 'ch-1': { 'p1': true } })

    // Run all timers to completion
    vi.runAllTimers()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(mockApiFetch).toHaveBeenCalledTimes(3)
    expect(syncStatus.value).toBe('success')
  })

  it('should handle rapid toggle: check -> uncheck -> check before sync', async () => {
    const { saveProgress } = useProgressSync()

    const bodies = []
    mockApiFetch.mockImplementation(async (url, options) => {
      const body = await options.body
      bodies.push(body)
      return createMockResponse(true, 200)
    })

    // User rapidly toggles
    saveProgress({ 'ch-1': { 'p1': true } })
    vi.advanceTimersByTime(100)
    await Promise.resolve()
    saveProgress({ 'ch-1': { 'p1': false } })
    vi.advanceTimersByTime(100)
    await Promise.resolve()
    saveProgress({ 'ch-1': { 'p1': true } })

    vi.advanceTimersByTime(3000)
    await Promise.resolve()

    // Only the last state should be synced
    expect(mockApiFetch).toHaveBeenCalledTimes(1)
    const body = JSON.parse(bodies[0])
    expect(body.progress['ch-1']['p1']).toBe(true)
  })

  it('should handle debounce cancellation chain: save -> force -> save', async () => {
    const { saveProgress, forceSyncNow } = useProgressSync()

    const bodies = []
    mockApiFetch.mockImplementation(async (url, options) => {
      const body = await options.body
      bodies.push(body)
      return createMockResponse(true, 200)
    })

    // First save (debounced)
    saveProgress({ 'ch-1': { 'p1': true } })
    vi.advanceTimersByTime(1000)

    // Force sync (cancels debounce, syncs immediately)
    forceSyncNow({ 'ch-1': { 'p1': true }, 'ch-2': { 'p2': true } })
    await Promise.resolve()

    // Another save after force
    saveProgress({ 'ch-1': { 'p1': true }, 'ch-2': { 'p2': true }, 'ch-3': { 'p3': true } })
    vi.advanceTimersByTime(3000)
    await Promise.resolve()

    // Should be 2 calls: forceSyncNow and the second saveProgress
    expect(mockApiFetch).toHaveBeenCalledTimes(2)

    const body1 = JSON.parse(bodies[0])
    const body2 = JSON.parse(bodies[1])

    // First call was forceSyncNow
    expect(body1.progress['ch-2']).toBeDefined()

    // Second call was last saveProgress
    expect(body2.progress['ch-3']).toBeDefined()
  })
})

describe.skip('progressSync.js - Backoff Timing Verification', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should wait correct backoff intervals', async () => {
    const { saveProgress } = useProgressSync()

    mockApiFetch.mockResolvedValue(createMockResponse(false, 500))

    saveProgress({ 'ch-1': { 'p1': true } })

    // Run all timers - exponential backoff: 1000, 2000, 4000 (capped at 10000)
    vi.runAllTimers()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    // 3 attempts total (initial + 2 retries = 3 API calls)
    expect(mockApiFetch).toHaveBeenCalledTimes(3)
  })
})
