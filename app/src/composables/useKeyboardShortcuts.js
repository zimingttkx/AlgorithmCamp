/**
 * useKeyboardShortcuts - Keyboard navigation shortcuts
 * Provides a global keyboard shortcut system with scope support
 */

import { ref, onMounted, onUnmounted } from 'vue'

// Global shortcut registry
const shortcuts = ref(new Map())
const enabledScopes = ref(new Set(['global']))

let isInitialized = false

/**
 * Initialize global keyboard shortcut handling
 */
export function initKeyboardShortcuts() {
  if (typeof window === 'undefined' || isInitialized) return () => {}

  isInitialized = true

  function handleKeyDown(e) {
    // Don't trigger shortcuts when typing in input fields
    const target = e.target
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Allow global shortcuts even in inputs
      if (!enabledScopes.value.has('global')) return
    }

    const key = e.key.toLowerCase()
    const ctrlKey = e.ctrlKey || e.metaKey
    const shiftKey = e.shiftKey
    const altKey = e.altKey

    // Build key combination string
    let combo = key
    if (ctrlKey) combo = `ctrl+${combo}`
    if (shiftKey) combo = `shift+${combo}`
    if (altKey) combo = `alt+${combo}`

    // Find matching shortcuts
    for (const [comboKey, shortcut] of shortcuts.value.entries()) {
      if (comboKey === combo) {
        // Check scope
        if (!enabledScopes.value.has(shortcut.scope) && shortcut.scope !== 'global') {
          continue
        }

        // Check if global shortcut
        if (!shortcut.global) {
          // Only trigger if not in input
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            continue
          }
        }

        // Execute handler
        e.preventDefault()
        shortcut.handler(e)
        return
      }
    }
  }

  window.addEventListener('keydown', handleKeyDown)

  return () => {
    window.removeEventListener('keydown', handleKeyDown)
    isInitialized = false
    shortcuts.value.clear()
  }
}

/**
 * Register a keyboard shortcut
 * @param {Object} config - Shortcut configuration
 * @param {string|string[]} config.key - Key or key combination
 * @param {Function} config.handler - Callback function
 * @param {string} config.description - Description for help modal
 * @param {string} config.scope - Scope (navigation, actions, global)
 * @param {boolean} config.global - Whether to trigger even in inputs
 */
export function useKeyboardShortcuts(config) {
  const { key, handler, description = '', scope = 'global', global = false } = config

  const keys = Array.isArray(key) ? key : [key]

  keys.forEach((k) => {
    const combo = k.toLowerCase()
    shortcuts.value.set(combo, {
      handler,
      description,
      scope,
      global,
    })
  })

  // Return unregister function
  return () => {
    keys.forEach((k) => {
      shortcuts.value.delete(k.toLowerCase())
    })
  }
}

/**
 * Get all registered shortcuts
 */
export function getAllShortcuts() {
  const result = []
  for (const [key, shortcut] of shortcuts.value.entries()) {
    result.push({
      key,
      ...shortcut,
    })
  }
  return result
}

/**
 * Enable/disable a scope
 */
export function setScopeEnabled(scope, enabled) {
  if (enabled) {
    enabledScopes.value.add(scope)
  } else {
    enabledScopes.value.delete(scope)
  }
}

export default {
  initKeyboardShortcuts,
  useKeyboardShortcuts,
  getAllShortcuts,
  setScopeEnabled,
}
