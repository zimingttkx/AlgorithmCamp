/**
 * useA11y - Accessibility utilities
 * Provides accessibility enhancements for keyboard navigation and screen readers
 */

import { ref, onMounted } from 'vue'

export function useA11y() {
  const prefersReducedMotion = ref(false)
  const highContrastMode = ref(false)

  function initA11y() {
    if (typeof window === 'undefined') return

    // Check for prefers-reduced-motion
    prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Check for high contrast mode
    highContrastMode.value = window.matchMedia('(prefers-contrast: more)').matches

    // Listen for preference changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      prefersReducedMotion.value = e.matches
    })
  }

  /**
   * Announce message to screen readers via ARIA live region
   */
  function announce(message, priority = 'polite') {
    if (typeof document === 'undefined') return

    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', priority)
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    announcer.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);'

    document.body.appendChild(announcer)

    // Small delay to ensure screen reader picks up the change
    setTimeout(() => {
      announcer.textContent = message

      // Clean up after announcement
      setTimeout(() => {
        document.body.removeChild(announcer)
      }, 1000)
    }, 100)
  }

  /**
   * Focus trap within a container element
   */
  function trapFocus(container) {
    if (!container) return () => {}

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    function handleKeyDown(e) {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }

  return {
    initA11y,
    announce,
    trapFocus,
    prefersReducedMotion,
    highContrastMode,
  }
}

export default useA11y
