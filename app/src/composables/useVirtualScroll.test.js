/**
 * useVirtualScroll Composable Tests
 */
import { describe, it, expect } from 'vitest'
import { useVirtualScroll, useVirtualScrollGrid } from './useVirtualScroll.js'

describe('useVirtualScroll', () => {
  it('should export useVirtualScroll function', () => {
    expect(typeof useVirtualScroll).toBe('function')
  })

  it('should create virtual scroll with default options', () => {
    const virtual = useVirtualScroll()
    expect(virtual.scrollTop.value).toBe(0)
    expect(virtual.containerHeight.value).toBe(0)
    expect(virtual.totalHeight.value).toBe(0)
  })

  it('should calculate visible range correctly with no items', () => {
    const virtual = useVirtualScroll({
      items: { value: [] },
      itemHeight: 60
    })

    const range = virtual.visibleRange.value
    expect(range.startIndex).toBe(0)
    expect(range.endIndex).toBe(0)
    expect(range.startOffset).toBe(0)
  })

  it('should calculate total height based on item count', () => {
    const items = Array.from({ length: 10 }, (_, i) => ({ id: i }))
    const virtual = useVirtualScroll({
      items: { value: items },
      itemHeight: 60
    })

    expect(virtual.totalHeight.value).toBe(600) // 10 * 60
  })

  it('should have scrollToIndex method', () => {
    const virtual = useVirtualScroll()
    expect(typeof virtual.scrollToIndex).toBe('function')
  })

  it('should have scrollToItem method', () => {
    const virtual = useVirtualScroll()
    expect(typeof virtual.scrollToItem).toBe('function')
  })

  it('should have onScroll method', () => {
    const virtual = useVirtualScroll()
    expect(typeof virtual.onScroll).toBe('function')
  })
})

describe('useVirtualScrollGrid', () => {
  it('should export useVirtualScrollGrid function', () => {
    expect(typeof useVirtualScrollGrid).toBe('function')
  })

  it('should create virtual scroll grid with default options', () => {
    const virtual = useVirtualScrollGrid()
    expect(virtual.scrollTop.value).toBe(0)
    expect(virtual.containerWidth.value).toBe(0)
    expect(virtual.columnsCount.value).toBe(1)
  })

  it('should have onScroll method', () => {
    const virtual = useVirtualScrollGrid()
    expect(typeof virtual.onScroll).toBe('function')
  })

  it('should have scrollToIndex method', () => {
    const virtual = useVirtualScrollGrid()
    expect(typeof virtual.scrollToIndex).toBe('function')
  })
})
