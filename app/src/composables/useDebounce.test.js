/**
 * useDebounce Composable Tests
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useDebounce, useThrottle } from './useDebounce.js'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('should create a debounced function', () => {
    const mockFn = vi.fn()
    const { debouncedFn, isPending } = useDebounce(mockFn, 300)

    expect(typeof debouncedFn).toBe('function')
    expect(isPending.value).toBe(false)
  })

  it('should delay function execution', () => {
    const mockFn = vi.fn()
    const { debouncedFn } = useDebounce(mockFn, 300)

    debouncedFn('test')
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledWith('test')
  })

  it('should set isPending to true while waiting', () => {
    const mockFn = vi.fn()
    const { debouncedFn, isPending } = useDebounce(mockFn, 300)

    debouncedFn()
    expect(isPending.value).toBe(true)

    vi.advanceTimersByTime(300)
    expect(isPending.value).toBe(false)
  })

  it('should cancel pending execution', () => {
    const mockFn = vi.fn()
    const { debouncedFn, cancel } = useDebounce(mockFn, 300)

    debouncedFn()
    expect(mockFn).not.toHaveBeenCalled()

    cancel()
    expect(mockFn).not.toHaveBeenCalled()
  })

  it('should flush and execute immediately', () => {
    const mockFn = vi.fn()
    const { debouncedFn, flush } = useDebounce(mockFn, 300)

    debouncedFn('test')
    expect(mockFn).not.toHaveBeenCalled()

    flush('test')
    expect(mockFn).toHaveBeenCalledWith('test')
  })

  it('should reset timer on repeated calls', () => {
    const mockFn = vi.fn()
    const { debouncedFn } = useDebounce(mockFn, 300)

    debouncedFn('first')
    vi.advanceTimersByTime(100)
    debouncedFn('second')
    vi.advanceTimersByTime(100)
    debouncedFn('third')

    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('third')
  })

  it('should use default delay of 300ms', () => {
    const mockFn = vi.fn()
    const { debouncedFn } = useDebounce(mockFn)

    debouncedFn()
    vi.advanceTimersByTime(299)
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(mockFn).toHaveBeenCalled()
  })
})

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('should create a throttled function', () => {
    const mockFn = vi.fn()
    const { throttledFn, isPending } = useThrottle(mockFn, 300)

    expect(typeof throttledFn).toBe('function')
    expect(isPending.value).toBe(false)
  })

  it('should execute immediately on first call (leading edge)', () => {
    const mockFn = vi.fn()
    const { throttledFn } = useThrottle(mockFn, 300, { leading: true, trailing: true })

    throttledFn('first')
    expect(mockFn).toHaveBeenCalledWith('first')
  })

  it('should not execute again within limit', () => {
    const mockFn = vi.fn()
    const { throttledFn } = useThrottle(mockFn, 300, { leading: true, trailing: true })

    throttledFn('first')
    vi.advanceTimersByTime(100)
    throttledFn('second')
    vi.advanceTimersByTime(100)
    throttledFn('third')

    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should execute again after limit passes (trailing edge)', () => {
    const mockFn = vi.fn()
    const { throttledFn } = useThrottle(mockFn, 300, { leading: true, trailing: true })

    throttledFn('first')
    vi.advanceTimersByTime(300)
    throttledFn('second')

    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  it('should cancel pending execution', () => {
    const mockFn = vi.fn()
    const { throttledFn, cancel } = useThrottle(mockFn, 300, { leading: false, trailing: true })

    throttledFn('first')
    vi.advanceTimersByTime(100)
    cancel()

    vi.advanceTimersByTime(200)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should flush pending execution', () => {
    const mockFn = vi.fn()
    const { throttledFn, flush } = useThrottle(mockFn, 300, { leading: false, trailing: true })

    throttledFn('first')
    vi.advanceTimersByTime(100)
    flush()

    expect(mockFn).toHaveBeenCalledTimes(2)
  })
})
