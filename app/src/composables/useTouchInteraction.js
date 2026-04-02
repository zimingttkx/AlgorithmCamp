/**
 * Touch Interaction Composable
 * Provides utilities for mobile touch interactions:
 * - Touch feedback (ripple effects)
 * - Long press detection
 * - Swipe action detection
 * - Pinch-to-zoom for images
 */

import { ref, onMounted, onUnmounted } from 'vue'

// Long press detection
export function useLongPress(callback, options = {}) {
  const {
    threshold = 500, // ms
    onStart,
    onEnd
  } = options

  const isPressed = ref(false)
  let pressTimer = null
  let startX = 0
  let startY = 0

  function clearPressTimer() {
    if (pressTimer) {
      clearTimeout(pressTimer)
      pressTimer = null
    }
  }

  function handleTouchStart(e) {
    if (e.touches.length !== 1) return // Only single touch
    isPressed.value = true
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
    onStart?.(e)

    pressTimer = setTimeout(() => {
      if (isPressed.value) {
        callback?.(e)
        clearPressTimer()
      }
    }, threshold)
  }

  function handleTouchMove(e) {
    if (!isPressed.value || !pressTimer) return
    const moveX = Math.abs(e.touches[0].clientX - startX)
    const moveY = Math.abs(e.touches[0].clientY - startY)
    // Cancel press if moved too much
    if (moveX > 10 || moveY > 10) {
      clearPressTimer()
      isPressed.value = false
      onEnd?.(e)
    }
  }

  function handleTouchEnd(e) {
    clearPressTimer()
    isPressed.value = false
    onEnd?.(e)
  }

  return {
    isPressed,
    handlers: {
      onTouchstart: handleTouchStart,
      onTouchmove: handleTouchMove,
      onTouchend: handleTouchEnd,
      onTouchcancel: handleTouchEnd
    }
  }
}

// Swipe detection
export function useSwipe(options = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50 // px to trigger swipe
  } = options

  const isSwiping = ref(false)
  const swipeDirection = ref(null)
  let startX = 0
  let startY = 0
  let startTime = 0

  function handleTouchStart(e) {
    if (e.touches.length !== 1) return
    isSwiping.value = true
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
    startTime = Date.now()
    swipeDirection.value = null
  }

  function handleTouchMove(e) {
    if (!isSwiping.value) return
    const deltaX = e.touches[0].clientX - startX
    const deltaY = e.touches[0].clientY - startY

    // Determine dominant direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      swipeDirection.value = deltaX > 0 ? 'right' : 'left'
    } else {
      swipeDirection.value = deltaY > 0 ? 'down' : 'up'
    }
  }

  function handleTouchEnd(e) {
    if (!isSwiping.value) return

    const deltaX = e.touches?.[0]?.clientX ?? startX
    const deltaY = e.touches?.[0]?.clientY ?? startY
    const moveX = deltaX - startX
    const moveY = deltaY - startY
    const duration = Date.now() - startTime

    // Only trigger if threshold met and quick enough (< 500ms)
    if (duration < 500) {
      if (Math.abs(moveX) > threshold && Math.abs(moveX) > Math.abs(moveY)) {
        if (moveX > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (moveX < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      } else if (Math.abs(moveY) > threshold && Math.abs(moveY) > Math.abs(moveX)) {
        if (moveY > 0 && onSwipeDown) {
          onSwipeDown()
        } else if (moveY < 0 && onSwipeUp) {
          onSwipeUp()
        }
      }
    }

    isSwiping.value = false
    swipeDirection.value = null
  }

  return {
    isSwiping,
    swipeDirection,
    handlers: {
      onTouchstart: handleTouchStart,
      onTouchmove: handleTouchMove,
      onTouchend: handleTouchEnd,
      onTouchcancel: handleTouchEnd
    }
  }
}

// Pinch-to-zoom for images
export function usePinchZoom(elementRef, options = {}) {
  const {
    minScale = 1,
    maxScale = 3,
    onZoomChange
  } = options

  const scale = ref(1)
  const isZooming = ref(false)

  let initialDistance = 0
  let initialScale = 1

  function getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  function handleTouchStart(e) {
    if (e.touches.length === 2) {
      isZooming.value = true
      initialDistance = getDistance(e.touches[0], e.touches[1])
      initialScale = scale.value
      e.preventDefault()
    }
  }

  function handleTouchMove(e) {
    if (!isZooming.value || e.touches.length !== 2) return

    const currentDistance = getDistance(e.touches[0], e.touches[1])
    const newScale = Math.min(maxScale, Math.max(minScale, initialScale * (currentDistance / initialDistance)))

    scale.value = newScale
    onZoomChange?.(newScale)
    e.preventDefault()
  }

  function handleTouchEnd(e) {
    if (e.touches.length < 2) {
      isZooming.value = false
    }
  }

  function resetZoom() {
    scale.value = 1
    onZoomChange?.(1)
  }

  return {
    scale,
    isZooming,
    resetZoom,
    handlers: {
      onTouchstart: handleTouchStart,
      onTouchmove: handleTouchMove,
      onTouchend: handleTouchEnd,
      onTouchcancel: handleTouchEnd
    }
  }
}

// Touch ripple effect position calculator
export function useRipple() {
  function createRipple(e, element) {
    const rect = element.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    return {
      x,
      y,
      size,
      delay: 0
    }
  }

  return { createRipple }
}

// Detect touch device
export function useTouchDevice() {
  const isTouchDevice = ref(false)

  onMounted(() => {
    isTouchDevice.value = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
    )
  })

  return { isTouchDevice }
}

// Touch-friendly target sizing
export function ensureMinTouchTarget(element, minSize = 44) {
  const rect = element.getBoundingClientRect()
  const style = window.getComputedStyle(element)

  const width = parseFloat(style.width) || rect.width
  const height = parseFloat(style.height) || rect.height

  if (width < minSize || height < minSize) {
    const scaleX = Math.max(1, minSize / width)
    const scaleY = Math.max(1, minSize / height)
    const scale = Math.max(scaleX, scaleY)

    element.style.width = `${width * scale}px`
    element.style.height = `${height * scale}px`
    element.style.margin = `-${(width * scale - width) / 2}px`
    element.style.padding = `${(height * scale - height) / 2}px`
  }
}
