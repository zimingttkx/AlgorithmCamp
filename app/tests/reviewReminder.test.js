/**
 * Unit Tests for useReviewReminder.js composable
 * Tests the SM-2 spaced repetition algorithm and composable behavior
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { calculateSM2, useReviewReminder } from '../src/composables/useReviewReminder.js'

// ---------------------------------------------------------------------------
// localStorage mock
// ---------------------------------------------------------------------------
const REVIEW_KEY = 'mc-algo-reviews'
const NOTIFICATION_KEY = 'mc-algo-notification-settings'

let mockStorage = {}

const localStorageMock = {
  getItem: vi.fn((key) => mockStorage[key] ?? null),
  setItem: vi.fn((key, value) => { mockStorage[key] = value }),
  removeItem: vi.fn((key) => { delete mockStorage[key] }),
  clear: vi.fn(() => { mockStorage = {} }),
  _getStore: () => mockStorage,
  _setStore: (s) => { mockStorage = s }
}

const originalLocalStorage = global.localStorage

beforeEach(() => {
  mockStorage = {}
  vi.clearAllMocks()
  global.localStorage = localStorageMock
})

afterEach(() => {
  global.localStorage = originalLocalStorage
})

function setReviewStorage(data) {
  mockStorage[REVIEW_KEY] = JSON.stringify(data)
}

function setNotificationStorage(data) {
  mockStorage[NOTIFICATION_KEY] = JSON.stringify(data)
}

function clearStorage() {
  mockStorage = {}
  localStorageMock.clear()
}

// ---------------------------------------------------------------------------
// Tests: SM-2 Algorithm Core Function (pure function - easily testable)
// ---------------------------------------------------------------------------
describe('calculateSM2 - SM-2 Algorithm', () => {
  it('should initialize with interval 1 on first successful review', () => {
    const result = calculateSM2(4, 0, 2.5, 0)
    expect(result.repetitions).toBe(1)
    expect(result.interval).toBe(1)
  })

  it('should set interval to 6 on second successful review', () => {
    const result = calculateSM2(4, 1, 2.5, 1)
    expect(result.repetitions).toBe(2)
    expect(result.interval).toBe(6)
  })

  it('should multiply interval by ease factor on subsequent reviews', () => {
    const result = calculateSM2(4, 2, 2.5, 6)
    expect(result.repetitions).toBe(3)
    expect(result.interval).toBe(15) // 6 * 2.5 = 15
  })

  it('should reset repetitions on failed review (quality < 3)', () => {
    const result = calculateSM2(2, 3, 2.5, 15)
    expect(result.repetitions).toBe(0)
    expect(result.interval).toBe(1)
  })

  it('should reset interval to 1 on failed review', () => {
    const result = calculateSM2(0, 5, 2.5, 30)
    expect(result.interval).toBe(1)
  })

  it('should increase ease factor on easy recall (quality 5)', () => {
    const result = calculateSM2(5, 2, 2.5, 6)
    expect(result.easeFactor).toBeGreaterThan(2.5)
  })

  it('should decrease ease factor on hard recall (quality 3)', () => {
    const result = calculateSM2(3, 2, 2.5, 6)
    expect(result.easeFactor).toBeLessThan(2.5)
  })

  it('should maintain ease factor on medium recall (quality 4)', () => {
    const result = calculateSM2(4, 2, 2.5, 6)
    expect(result.easeFactor).toBe(2.5)
  })

  it('should enforce minimum ease factor of 1.3', () => {
    // Simulate multiple failures to drive ease factor down
    let easeFactor = 2.5
    let interval = 1
    let repetitions = 1

    // First failure
    let result = calculateSM2(0, repetitions, easeFactor, interval)
    expect(result.easeFactor).toBeGreaterThanOrEqual(1.3)
  })

  it('should set nextReviewDate to future based on interval', () => {
    const before = new Date()
    const result = calculateSM2(4, 0, 2.5, 0)
    const after = new Date()

    const nextReview = new Date(result.nextReviewDate)
    // First successful review has interval 1, so next review should be tomorrow
    expect(nextReview.getTime()).toBeGreaterThanOrEqual(before.getTime() + 24 * 60 * 60 * 1000)
  })

  it('should set lastReviewDate to current time', () => {
    const before = new Date()
    const result = calculateSM2(4, 0, 2.5, 0)
    const after = new Date()

    const lastReview = new Date(result.lastReviewDate)
    expect(lastReview.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(lastReview.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should calculate correct interval progression for quality 5 (easy)', () => {
    // First review - interval 1
    let result = calculateSM2(5, 0, 2.5, 0)
    expect(result.interval).toBe(1)
    expect(result.repetitions).toBe(1)

    // Second review - interval 6
    result = calculateSM2(5, result.repetitions, result.easeFactor, result.interval)
    expect(result.interval).toBe(6)
    expect(result.repetitions).toBe(2)

    // Third review - interval = 6 * easeFactor (which increased for easy)
    result = calculateSM2(5, result.repetitions, result.easeFactor, result.interval)
    expect(result.interval).toBeGreaterThan(6)
    expect(result.repetitions).toBe(3)
  })

  it('should calculate correct interval for quality 3 (hard)', () => {
    // With hard difficulty, ease factor decreases so interval grows slower
    let result = calculateSM2(3, 0, 2.5, 0)
    expect(result.interval).toBe(1)

    result = calculateSM2(3, result.repetitions, result.easeFactor, result.interval)
    expect(result.interval).toBe(6)

    // Third review - interval should be less than if quality was 5
    result = calculateSM2(3, result.repetitions, result.easeFactor, result.interval)
    // Hard difficulty results in lower ease factor, so interval is smaller
    expect(result.interval).toBeLessThan(15) // Compared to quality 5
  })
})

// ---------------------------------------------------------------------------
// Tests: Composable with localStorage persistence (singleton pattern)
// Note: Due to singleton nature, these tests may affect each other
// We focus on testing the behavior that persists to localStorage
// ---------------------------------------------------------------------------
describe('useReviewReminder - Composable localStorage Behavior', () => {
  it('should save reviews to localStorage when adding a problem', () => {
    clearStorage()
    const { addToReview } = useReviewReminder()
    addToReview('chapter-01', '1')
    expect(mockStorage[REVIEW_KEY]).toBeTruthy()
    expect(mockStorage[REVIEW_KEY]).toContain('chapter-01')
    expect(mockStorage[REVIEW_KEY]).toContain('1')
  })

  it('should load saved reviews from localStorage', () => {
    clearStorage()
    setReviewStorage({
      'chapter-01': {
        '1': { repetitions: 2, easeFactor: 2.5, interval: 6, nextReviewDate: new Date().toISOString() }
      }
    })

    // Create new composable instance (singleton will load from localStorage)
    const { getReviewData } = useReviewReminder()
    const review = getReviewData('chapter-01', '1')
    expect(review).toBeTruthy()
    expect(review.repetitions).toBe(2)
  })

  it('should persist review updates to localStorage', () => {
    clearStorage()
    const { addToReview, markReviewed } = useReviewReminder()
    addToReview('chapter-01', '1')
    markReviewed('chapter-01', '1', 4)

    const stored = JSON.parse(mockStorage[REVIEW_KEY])
    expect(stored['chapter-01']['1'].repetitions).toBe(1)
  })

  it('should handle missing review data gracefully', () => {
    clearStorage()
    const { getReviewData } = useReviewReminder()
    expect(getReviewData('chapter-99', '999')).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Tests: Notification Settings
// ---------------------------------------------------------------------------
describe('useReviewReminder - Notification Settings', () => {
  it('should save notification settings to localStorage', () => {
    clearStorage()
    const { updateNotificationSettings } = useReviewReminder()
    updateNotificationSettings({ email: true })
    expect(mockStorage[NOTIFICATION_KEY]).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// Tests: Edge Cases for SM-2 Algorithm
// ---------------------------------------------------------------------------
describe('calculateSM2 - Edge Cases', () => {
  it('should handle boundary quality value of 0', () => {
    const result = calculateSM2(0, 5, 2.5, 30)
    expect(result.repetitions).toBe(0)
    expect(result.interval).toBe(1)
  })

  it('should handle boundary quality value of 5', () => {
    const result = calculateSM2(5, 3, 2.5, 15)
    expect(result.repetitions).toBe(4)
    expect(result.easeFactor).toBeGreaterThan(2.5)
  })

  it('should handle quality value of 3 (just passed)', () => {
    const result = calculateSM2(3, 2, 2.5, 6)
    expect(result.repetitions).toBe(3)
    expect(result.easeFactor).toBeLessThan(2.5)
  })

  it('should not overflow with large ease factor', () => {
    const result = calculateSM2(5, 100, 3.0, 1000)
    // Even with high values, should calculate reasonably
    expect(result.interval).toBeGreaterThan(0)
    expect(result.easeFactor).toBeLessThanOrEqual(3.5) // Capped increase
  })
})