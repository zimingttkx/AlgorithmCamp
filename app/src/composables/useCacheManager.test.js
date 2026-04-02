/**
 * useCacheManager Composable Tests
 */
import { describe, it, expect } from 'vitest'
import { useCacheManager, useCacheStatus } from './useCacheManager.js'

describe('useCacheManager', () => {
  it('should export useCacheManager function', () => {
    expect(typeof useCacheManager).toBe('function')
  })

  it('should have correct cache name constants', () => {
    const { CACHE_NAMES } = useCacheManager()
    expect(CACHE_NAMES.googleFontsStylesheets).toBe('google-fonts-stylesheets')
    expect(CACHE_NAMES.googleFontsWebfonts).toBe('google-fonts-webfonts')
    expect(CACHE_NAMES.githubImages).toBe('github-images-cache')
    expect(CACHE_NAMES.githubApi).toBe('github-api-cache')
    expect(CACHE_NAMES.leetcodeApi).toBe('leetcode-api-cache')
    expect(CACHE_NAMES.stats).toBe('stats-cache')
  })

  it('should provide openCache method', () => {
    const { openCache } = useCacheManager()
    expect(typeof openCache).toBe('function')
  })

  it('should provide hasCache method', () => {
    const { hasCache } = useCacheManager()
    expect(typeof hasCache).toBe('function')
  })

  it('should provide deleteCache method', () => {
    const { deleteCache } = useCacheManager()
    expect(typeof deleteCache).toBe('function')
  })

  it('should provide clearAllCaches method', () => {
    const { clearAllCaches } = useCacheManager()
    expect(typeof clearAllCaches).toBe('function')
  })

  it('should provide getCacheContents method', () => {
    const { getCacheContents } = useCacheManager()
    expect(typeof getCacheContents).toBe('function')
  })

  it('should provide precacheUrls method', () => {
    const { precacheUrls } = useCacheManager()
    expect(typeof precacheUrls).toBe('function')
  })
})

describe('useCacheStatus', () => {
  it('should export useCacheStatus function', () => {
    expect(typeof useCacheStatus).toBe('function')
  })

  it('should provide checkForUpdate method', () => {
    const { checkForUpdate } = useCacheStatus()
    expect(typeof checkForUpdate).toBe('function')
  })

  it('should provide getStorageEstimate method', () => {
    const { getStorageEstimate } = useCacheStatus()
    expect(typeof getStorageEstimate).toBe('function')
  })

  it('should provide requestPersistentStorage method', () => {
    const { requestPersistentStorage } = useCacheStatus()
    expect(typeof requestPersistentStorage).toBe('function')
  })
})
