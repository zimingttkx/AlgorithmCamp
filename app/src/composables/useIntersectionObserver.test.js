/**
 * useIntersectionObserver Composable Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useIntersectionObserver, useScrollAnimation, useLazyLoad, useInfiniteScroll } from './useIntersectionObserver.js'

describe('useIntersectionObserver', () => {
  it('should export useIntersectionObserver function', () => {
    expect(typeof useIntersectionObserver).toBe('function')
  })

  it('should create observer with default options', () => {
    const observer = useIntersectionObserver({
      onIntersect: () => {}
    })
    expect(observer.isIntersecting.value).toBe(false)
    expect(observer.hasIntersected.value).toBe(false)
  })

  it('should provide observe method', () => {
    const observer = useIntersectionObserver()
    expect(typeof observer.observe).toBe('function')
  })

  it('should provide unobserve method', () => {
    const observer = useIntersectionObserver()
    expect(typeof observer.unobserve).toBe('function')
  })

  it('should provide disconnect method', () => {
    const observer = useIntersectionObserver()
    expect(typeof observer.disconnect).toBe('function')
  })
})

describe('useScrollAnimation', () => {
  it('should export useScrollAnimation function', () => {
    expect(typeof useScrollAnimation).toBe('function')
  })
})

describe('useLazyLoad', () => {
  it('should export useLazyLoad function', () => {
    expect(typeof useLazyLoad).toBe('function')
  })

  it('should create lazy load with initial state', () => {
    const lazy = useLazyLoad()
    expect(lazy.isLoaded.value).toBe(false)
    expect(lazy.isInView.value).toBe(false)
    expect(lazy.hasError.value).toBe(false)
  })
})

describe('useInfiniteScroll', () => {
  it('should export useInfiniteScroll function', () => {
    expect(typeof useInfiniteScroll).toBe('function')
  })

  it('should create infinite scroll with initial state', () => {
    const infinite = useInfiniteScroll()
    expect(infinite.isLoading.value).toBe(false)
    expect(infinite.hasMore.value).toBe(true)
    expect(infinite.isInView.value).toBe(false)
  })

  it('should have reset method', () => {
    const infinite = useInfiniteScroll()
    expect(typeof infinite.reset).toBe('function')
  })
})
