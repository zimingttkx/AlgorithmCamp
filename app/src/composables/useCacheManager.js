/**
 * Cache Management Utility
 * Provides programmatic control over Service Worker caches and storage
 */

import { ref, computed } from 'vue'

// Cache names used in the application
const CACHE_NAMES = {
  googleFontsStylesheets: 'google-fonts-stylesheets',
  googleFontsWebfonts: 'google-fonts-webfonts',
  githubImages: 'github-images-cache',
  githubApi: 'github-api-cache',
  leetcodeApi: 'leetcode-api-cache',
  stats: 'stats-cache'
}

// Shared state across components
const cacheStatus = ref({
  isUpdateAvailable: false,
  serviceWorker: null,
  storageEstimate: null
})

/**
 * Get cache status information
 */
export function useCacheStatus() {
  /**
   * Check if a new service worker version is available
   */
  const checkForUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          cacheStatus.value.serviceWorker = registration.active
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                cacheStatus.value.isUpdateAvailable = true
              }
            })
          }
        })
      })
    }
  }

  /**
   * Apply available updates
   */
  const applyUpdate = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        window.location.reload()
      }
    }
  }

  /**
   * Get storage estimate (quota)
   */
  const getStorageEstimate = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      cacheStatus.value.storageEstimate = {
        usage: estimate.usage,
        quota: estimate.quota,
        usagePercent: Math.round((estimate.usage / estimate.quota) * 100)
      }
      return cacheStatus.value.storageEstimate
    }
    return null
  }

  /**
   * Request persistent storage for important caches
   */
  const requestPersistentStorage = async () => {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      const isPersisted = await navigator.storage.persist()
      return isPersisted
    }
    return false
  }

  return {
    cacheStatus: computed(() => cacheStatus.value),
    isUpdateAvailable: computed(() => cacheStatus.value.isUpdateAvailable),
    storageEstimate: computed(() => cacheStatus.value.storageEstimate),
    checkForUpdate,
    applyUpdate,
    getStorageEstimate,
    requestPersistentStorage
  }
}

/**
 * Manage application caches directly
 */
export function useCacheManager() {
  /**
   * Open a specific cache
   */
  const openCache = async (cacheName) => {
    if ('caches' in window) {
      return await caches.open(cacheName)
    }
    return null
  }

  /**
   * Check if a cache exists
   */
  const hasCache = async (cacheName) => {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      return cacheNames.includes(cacheName)
    }
    return false
  }

  /**
   * Delete a specific cache
   */
  const deleteCache = async (cacheName) => {
    if ('caches' in window) {
      await caches.delete(cacheName)
    }
  }

  /**
   * Clear all application caches
   */
  const clearAllCaches = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map((name) => caches.delete(name)))
    }
  }

  /**
   * Get cache contents for debugging
   */
  const getCacheContents = async (cacheName) => {
    const cache = await openCache(cacheName)
    if (!cache) return []

    const keys = await cache.keys()
    const entries = []

    for (const request of keys) {
      const response = await cache.match(request)
      entries.push({
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        responseStatus: response?.status,
        responseDate: response?.headers.get('date')
      })
    }

    return entries
  }

  /**
   * Precache specific URLs
   */
  const precacheUrls = async (urls, cacheName = 'precache') => {
    const cache = await openCache(cacheName)

    if (!cache) return { success: false, cached: 0, failed: 0 }

    let cached = 0
    let failed = 0

    for (const url of urls) {
      try {
        const response = await fetch(url)
        if (response.ok) {
          await cache.put(url, response.clone())
          cached++
        } else {
          failed++
        }
      } catch (e) {
        failed++
      }
    }

    return { success: true, cached, failed }
  }

  return {
    CACHE_NAMES,
    openCache,
    hasCache,
    deleteCache,
    clearAllCaches,
    getCacheContents,
    precacheUrls
  }
}

/**
 * Clear service worker and all caches (full reset)
 */
export async function clearServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    for (const registration of registrations) {
      await registration.unregister()
    }
  }

  if ('caches' in window) {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map((name) => caches.delete(name)))
  }
}