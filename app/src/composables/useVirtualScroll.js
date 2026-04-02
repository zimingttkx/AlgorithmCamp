/**
 * useVirtualScroll - Virtual scrolling composable for rendering long lists efficiently
 * Only renders items within the visible viewport + buffer zone
 * Dramatically improves performance for lists with hundreds of items
 */
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

/**
 * Virtual scroll composable for efficient long list rendering
 * @param {Object} options - Configuration options
 * @param {Ref<Array>} options.items - Source array of items
 * @param {number} options.itemHeight - Fixed height of each item in pixels (default: 60)
 * @param {number} options.bufferSize - Number of extra items to render above/below viewport (default: 5)
 * @param {string} options.containerRef - Ref to the scroll container
 * @param {string} options.scrollTop - External scroll top value (for two-way binding)
 * @returns {Object} Virtual scroll API
 */
export function useVirtualScroll(options = {}) {
  const {
    items = ref([]),
    itemHeight = 60,
    bufferSize = 5,
    containerRef = null,
    initialScrollTop = 0
  } = options

  // Scroll state
  const scrollTop = ref(initialScrollTop)
  const containerHeight = ref(0)
  const containerOffsetTop = ref(0)

  // Internal refs
  let resizeObserver = null
  let scrollListener = null

  // Calculate visible range
  const visibleRange = computed(() => {
    const totalItems = items.value.length
    if (totalItems === 0) {
      return { startIndex: 0, endIndex: 0, startOffset: 0 }
    }

    // Calculate which items are visible
    const startIndex = Math.max(0, Math.floor(scrollTop.value / itemHeight) - bufferSize)
    const visibleCount = Math.ceil(containerHeight.value / itemHeight)
    const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + bufferSize * 2)

    return {
      startIndex,
      endIndex,
      startOffset: startIndex * itemHeight
    }
  })

  // Get visible items with their positions
  const visibleItems = computed(() => {
    const { startIndex, endIndex } = visibleRange.value
    const result = []

    for (let i = startIndex; i <= endIndex; i++) {
      const item = items.value[i]
      if (item) {
        result.push({
          index: i,
          data: item,
          style: {
            position: 'absolute',
            top: `${i * itemHeight}px`,
            left: 0,
            right: 0,
            height: `${itemHeight}px`
          }
        })
      }
    }

    return result
  })

  // Total height for scroll container
  const totalHeight = computed(() => items.value.length * itemHeight)

  // Handle scroll event
  function onScroll(event) {
    const target = event.target
    if (target) {
      scrollTop.value = target.scrollTop
    }
  }

  // Scroll to specific index
  function scrollToIndex(index, behavior = 'smooth') {
    const targetScrollTop = index * itemHeight

    if (containerRef && containerRef.value) {
      containerRef.value.scrollTo({
        top: targetScrollTop,
        behavior
      })
    } else {
      // Fallback: find scrollable parent
      const el = event.target?.closest('.virtual-scroll-container')
      if (el) {
        el.scrollTo({ top: targetScrollTop, behavior })
      }
    }

    scrollTop.value = targetScrollTop
  }

  // Scroll to specific item
  function scrollToItem(predicate, behavior = 'smooth') {
    const index = items.value.findIndex(predicate)
    if (index !== -1) {
      scrollToIndex(index, behavior)
    }
  }

  // Update container dimensions
  function updateContainerDimensions() {
    if (containerRef && containerRef.value) {
      const rect = containerRef.value.getBoundingClientRect()
      containerOffsetTop.value = rect.top
      containerHeight.value = containerRef.value.clientHeight
    }
  }

  // Initialize
  onMounted(() => {
    nextTick(() => {
      updateContainerDimensions()

      // Set up resize observer
      if (containerRef && containerRef.value && typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          updateContainerDimensions()
        })
        resizeObserver.observe(containerRef.value)
      }

      // Set initial scroll position
      if (initialScrollTop > 0 && containerRef && containerRef.value) {
        containerRef.value.scrollTop = initialScrollTop
      }
    })
  })

  // Cleanup
  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
  })

  return {
    // State
    scrollTop,
    containerHeight,
    visibleRange,
    visibleItems,
    totalHeight,

    // Methods
    scrollToIndex,
    scrollToItem,
    onScroll,
    updateContainerDimensions
  }
}

/**
 * useVirtualScrollGrid - Virtual scrolling for grid layouts
 * @param {Object} options - Configuration options
 * @param {Ref<Array>} options.items - Source array of items
 * @param {number} options.itemWidth - Fixed width of each item (default: 200)
 * @param {number} options.itemHeight - Fixed height of each item (default: 80)
 * @param {number} options.gap - Gap between items in pixels (default: 12)
 * @param {number} options.bufferSize - Number of extra rows to render (default: 2)
 * @returns {Object} Virtual scroll grid API
 */
export function useVirtualScrollGrid(options = {}) {
  const {
    items = ref([]),
    itemWidth = 200,
    itemHeight = 80,
    gap = 12,
    bufferSize = 2
  } = options

  const scrollTop = ref(0)
  const containerWidth = ref(0)
  const containerHeight = ref(0)
  let resizeObserver = null

  // Calculate columns based on container width
  const columnsCount = computed(() => {
    if (containerWidth.value === 0) return 1
    return Math.max(1, Math.floor((containerWidth.value + gap) / (itemWidth + gap)))
  })

  // Calculate rows
  const totalRows = computed(() => {
    return Math.ceil(items.value.length / columnsCount.value)
  })

  const totalHeight = computed(() => {
    return totalRows.value * (itemHeight + gap) - gap
  })

  // Visible range
  const visibleRange = computed(() => {
    const rowHeight = itemHeight + gap
    const startRow = Math.max(0, Math.floor(scrollTop.value / rowHeight) - bufferSize)
    const visibleRows = Math.ceil(containerHeight.value / rowHeight)
    const endRow = Math.min(totalRows.value - 1, startRow + visibleRows + bufferSize * 2)

    return { startRow, endRow, startIndex: startRow * columnsCount.value }
  })

  // Visible items
  const visibleItems = computed(() => {
    const { startRow, endRow } = visibleRange.value
    const result = []
    const rowHeight = itemHeight + gap
    const startIndex = startRow * columnsCount.value
    const endIndex = Math.min(items.value.length, (endRow + 1) * columnsCount.value)

    for (let i = startIndex; i < endIndex; i++) {
      const item = items.value[i]
      if (item) {
        const col = i % columnsCount.value
        const row = Math.floor(i / columnsCount.value)

        result.push({
          index: i,
          data: item,
          style: {
            position: 'absolute',
            top: `${row * rowHeight}px`,
            left: `${col * (itemWidth + gap)}px`,
            width: `${itemWidth}px`,
            height: `${itemHeight}px`
          }
        })
      }
    }

    return result
  })

  function onScroll(event) {
    scrollTop.value = event.target.scrollTop
  }

  function scrollToIndex(index, behavior = 'smooth') {
    const row = Math.floor(index / columnsCount.value)
    const rowHeight = itemHeight + gap
    scrollTop.value = row * rowHeight
  }

  function updateContainerDimensions(el) {
    if (el) {
      containerWidth.value = el.clientWidth
      containerHeight.value = el.clientHeight
    }
  }

  onMounted(() => {
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          containerWidth.value = entry.contentRect.width
          containerHeight.value = entry.contentRect.height
        }
      })
    }
  })

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
  })

  return {
    scrollTop,
    containerWidth,
    containerHeight,
    columnsCount,
    totalHeight,
    visibleRange,
    visibleItems,
    onScroll,
    scrollToIndex,
    updateContainerDimensions
  }
}

export default useVirtualScroll
