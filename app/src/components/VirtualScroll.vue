<template>
  <div
    ref="containerRef"
    class="virtual-scroll-container"
    :style="{ height: containerHeight + 'px', overflow: 'auto' }"
    @scroll.passive="onScroll"
  >
    <div class="virtual-scroll-content" :style="{ height: totalHeight + 'px', position: 'relative' }">
      <div
        v-for="item in visibleItems"
        :key="item.index"
        class="virtual-scroll-item"
        :style="item.style"
      >
        <slot :item="item.data" :index="item.index">
          {{ item.data }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  itemHeight: {
    type: Number,
    default: 60
  },
  bufferSize: {
    type: Number,
    default: 5
  },
  containerHeight: {
    type: Number,
    default: 400
  }
})

const emit = defineEmits(['scroll', 'visible-items-change'])

const containerRef = ref(null)
const scrollTop = ref(0)
const currentContainerHeight = ref(props.containerHeight)

// Calculate visible range
const visibleRange = computed(() => {
  const totalItems = props.items.length
  if (totalItems === 0) {
    return { startIndex: 0, endIndex: 0 }
  }

  const startIndex = Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.bufferSize)
  const visibleCount = Math.ceil(currentContainerHeight.value / props.itemHeight)
  const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + props.bufferSize * 2)

  return { startIndex, endIndex }
})

// Get visible items
const visibleItems = computed(() => {
  const { startIndex, endIndex } = visibleRange.value
  const result = []

  for (let i = startIndex; i <= endIndex; i++) {
    const item = props.items[i]
    if (item !== undefined) {
      result.push({
        index: i,
        data: item,
        style: {
          position: 'absolute',
          top: `${i * props.itemHeight}px`,
          left: 0,
          right: 0,
          height: `${props.itemHeight}px`
        }
      })
    }
  }

  emit('visible-items-change', result)
  return result
})

// Total height
const totalHeight = computed(() => props.items.length * props.itemHeight)

function onScroll(event) {
  scrollTop.value = event.target.scrollTop
  emit('scroll', {
    scrollTop: scrollTop.value,
    scrollLeft: event.target.scrollLeft
  })
}

// Scroll to specific index
function scrollToIndex(index, behavior = 'smooth') {
  if (containerRef.value) {
    containerRef.value.scrollTo({
      top: index * props.itemHeight,
      behavior
    })
  }
}

// Update container height
function updateContainerHeight() {
  if (containerRef.value) {
    currentContainerHeight.value = containerRef.value.clientHeight
  }
}

onMounted(() => {
  nextTick(() => {
    updateContainerHeight()

    if (typeof ResizeObserver !== 'undefined' && containerRef.value) {
      const resizeObserver = new ResizeObserver(() => {
        updateContainerHeight()
      })
      resizeObserver.observe(containerRef.value)
    }
  })
})

defineExpose({
  scrollToIndex,
  scrollTop,
  visibleRange,
  containerRef
})
</script>

<style scoped>
.virtual-scroll-container {
  position: relative;
  will-change: scroll-position;
}

.virtual-scroll-content {
  will-change: contents;
}

.virtual-scroll-item {
  contain: layout paint;
  will-change: transform;
}
</style>
