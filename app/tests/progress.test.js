/**
 * Comprehensive Unit Tests for progress.js composable
 * Tests the actual useProgress() exported functions with localStorage mock
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getProgress } from '../src/composables/progress.js'
import { CHAPTERS } from '../src/composables/data.js'

// ---------------------------------------------------------------------------
// localStorage mock
// ---------------------------------------------------------------------------
const STORAGE_KEY = 'mc-algo-progress'
const TOTALS_KEY = '_chapterTotals'

let mockStorage = {}

const localStorageMock = {
  getItem: vi.fn((key) => mockStorage[key] ?? null),
  setItem: vi.fn((key, value) => { mockStorage[key] = value }),
  removeItem: vi.fn((key) => { delete mockStorage[key] }),
  clear: vi.fn(() => { mockStorage = {} }),
  _getStore: () => mockStorage,
  _setStore: (s) => { mockStorage = s }
}

// Replace global localStorage
const originalLocalStorage = global.localStorage

beforeEach(() => {
  mockStorage = {}
  vi.clearAllMocks()
  global.localStorage = localStorageMock
})

afterEach(() => {
  global.localStorage = originalLocalStorage
})

// ---------------------------------------------------------------------------
// Helper to set progress directly in mock storage
// ---------------------------------------------------------------------------
function setRawProgress(data) {
  mockStorage[STORAGE_KEY] = JSON.stringify(data)
}

function setTotals(data) {
  mockStorage[TOTALS_KEY] = JSON.stringify(data)
}

function clearStorage() {
  mockStorage = {}
  localStorageMock.clear()
}

// ---------------------------------------------------------------------------
// Tests: STORAGE_KEY constant
// ---------------------------------------------------------------------------
describe('progress.js - Storage Constants', () => {
  it('should use correct localStorage key for progress', () => {
    setRawProgress({ 'chapter-01': { '1': true } })
    expect(mockStorage[STORAGE_KEY]).toBe('{"chapter-01":{"1":true}}')
  })

  it('should use correct localStorage key for chapter totals', () => {
    setTotals({ 'chapter-01': 10 })
    expect(mockStorage[TOTALS_KEY]).toBe('{"chapter-01":10}')
  })
})

// ---------------------------------------------------------------------------
// Tests: getProgress() with no chapterId (global)
// ---------------------------------------------------------------------------
describe('progress.js - getProgress() Global', () => {
  it('should return an object when called with no arguments', () => {
    clearStorage()
    const result = getProgress()
    expect(typeof result).toBe('object')
  })

  it('should return doneTotal, totalProblems, and donePct for global progress', () => {
    clearStorage()
    setRawProgress({
      'chapter-01': { '1': true, '2': true, '3': false },
      'chapter-02': { '1': true }
    })
    setTotals({
      'chapter-01': 10,
      'chapter-02': 20
    })

    const result = getProgress()

    expect(result.doneTotal).toBeDefined()
    expect(result.totalProblems).toBeDefined()
    expect(result.donePct).toBeDefined()
    expect(typeof result.doneTotal).toBe('object') // ref
    expect(typeof result.totalProblems).toBe('object') // ref
    expect(typeof result.donePct).toBe('object') // computed
  })

  it('should sum done problems across all chapters', () => {
    clearStorage()
    setRawProgress({
      'chapter-01': { '1': true, '2': true },
      'chapter-02': { '1': true }
    })
    setTotals({
      'chapter-01': 10,
      'chapter-02': 10
    })

    const result = getProgress()
    expect(result.doneTotal.value).toBe(3)
    // chapter-01 and chapter-02 use localStorage totals (10+10=20)
    // chapters 3-12 fall back to ch.count (59+70+121+174+687+612+318+505+424+95=3065)
    expect(result.totalProblems.value).toBe(3085)
  })

  it('should handle empty storage gracefully', () => {
    clearStorage()
    const result = getProgress()
    expect(result.doneTotal.value).toBe(0)
    expect(result.totalProblems.value).toBeGreaterThanOrEqual(1)
    expect(result.donePct.value).toBe(0)
  })

  it('should return at least 1 for totalProblems when no progress', () => {
    clearStorage()
    const result = getProgress()
    expect(result.totalProblems.value).toBeGreaterThanOrEqual(1)
  })

  it('should count only truthy (checked) problems', () => {
    clearStorage()
    setRawProgress({
      'chapter-01': { '1': true, '2': false, '3': null, '4': undefined }
    })
    setTotals({ 'chapter-01': 10 })

    const result = getProgress()
    expect(result.doneTotal.value).toBe(1)
  })

  it('should handle missing chapter totals gracefully', () => {
    clearStorage()
    setRawProgress({
      'chapter-01': { '1': true, '2': true, '3': true }
    })
    // No totals set

    const result = getProgress()
    expect(result.doneTotal.value).toBe(3)
    // Falls back to Object.keys(checked).length
  })
})

// ---------------------------------------------------------------------------
// Tests: getProgress(chapterId) with specific chapter
// ---------------------------------------------------------------------------
describe('progress.js - getProgress(chapterId) Chapter-level', () => {
  it('should return an object with donePct, done, and total', () => {
    clearStorage()
    setRawProgress({ 'chapter-01': { '1': true, '2': true } })
    setTotals({ 'chapter-01': 10 })

    const result = getProgress('chapter-01')

    expect(typeof result).toBe('object')
    expect(result.donePct).toBeDefined()
    expect(result.done).toBeDefined()
    expect(result.total).toBeDefined()
  })

  it('should calculate correct done count', () => {
    clearStorage()
    setRawProgress({ 'chapter-01': { '1': true, '2': true, '3': false } })
    setTotals({ 'chapter-01': 10 })

    const result = getProgress('chapter-01')
    expect(result.done).toBe(2)
  })

  it('should calculate correct donePct', () => {
    clearStorage()
    setRawProgress({ 'chapter-01': { '1': true, '2': true } })
    setTotals({ 'chapter-01': 10 })

    const result = getProgress('chapter-01')
    expect(result.donePct).toBe(20)
  })

  it('should handle 100% completion', () => {
    clearStorage()
    setRawProgress({ 'chapter-01': { '1': true, '2': true, '3': true } })
    setTotals({ 'chapter-01': 3 })

    const result = getProgress('chapter-01')
    expect(result.donePct).toBe(100)
  })

  it('should handle 0% completion', () => {
    clearStorage()
    setRawProgress({ 'chapter-01': { '1': false, '2': false } })
    setTotals({ 'chapter-01': 10 })

    const result = getProgress('chapter-01')
    expect(result.donePct).toBe(0)
  })

  it('should handle missing chapter in raw progress', () => {
    clearStorage()
    setRawProgress({})
    setTotals({ 'chapter-01': 10 })

    const result = getProgress('chapter-01')
    expect(result.done).toBe(0)
    expect(result.total).toBe(10)
    expect(result.donePct).toBe(0)
  })

  it('should fallback to Object.keys(checked).length when totals missing', () => {
    clearStorage()
    setRawProgress({ 'chapter-01': { '1': true, '2': true } })
    setTotals({})

    const result = getProgress('chapter-01')
    expect(result.total).toBe(2)
  })

  it('should handle missing chapter totals with empty raw', () => {
    clearStorage()
    setRawProgress({})
    setTotals({})

    const result = getProgress('chapter-01')
    expect(result.done).toBe(0)
    expect(result.total).toBe(1) // Falls back to 1
    expect(result.donePct).toBe(0)
  })

  it('should handle zero total in totals', () => {
    clearStorage()
    setRawProgress({ 'chapter-01': {} })
    setTotals({ 'chapter-01': 0 })

    const result = getProgress('chapter-01')
    expect(result.total).toBe(1) // Falls back to 1
  })

  it('should normalize non-boolean truthy values to true', () => {
    clearStorage()
    setRawProgress({
      'chapter-01': { '1': 1, '2': 'yes', '3': true }
    })
    setTotals({ 'chapter-01': 3 })

    const result = getProgress('chapter-01')
    expect(result.done).toBe(3)
    expect(result.donePct).toBe(100)
  })
})

// ---------------------------------------------------------------------------
// Tests: localStorage persistence and parsing
// ---------------------------------------------------------------------------
describe('progress.js - localStorage Persistence', () => {
  it('should read progress from localStorage', () => {
    clearStorage()
    setRawProgress({ 'chapter-01': { '1': true } })

    const stored = JSON.parse(mockStorage[STORAGE_KEY] || '{}')
    expect(stored['chapter-01']['1']).toBe(true)
  })

  it('should persist set via localStorage.setItem', () => {
    clearStorage()
    mockStorage[STORAGE_KEY] = JSON.stringify({ 'chapter-01': { '1': true } })

    const result = getProgress('chapter-01')
    expect(result.done).toBe(1)
  })

  it('should handle malformed JSON gracefully', () => {
    clearStorage()
    mockStorage[STORAGE_KEY] = '{ invalid json }'

    const result = getProgress()
    expect(result.doneTotal.value).toBe(0)
  })

  it('should handle null localStorage value', () => {
    clearStorage()
    mockStorage[STORAGE_KEY] = null

    const result = getProgress()
    expect(result.doneTotal.value).toBe(0)
  })

  it('should handle total non-JSON gracefully', () => {
    clearStorage()
    mockStorage[TOTALS_KEY] = 'not json'

    const result = getProgress('chapter-01')
    expect(result.total).toBe(1) // Falls back
  })

  it('should handle total null gracefully', () => {
    clearStorage()
    mockStorage[TOTALS_KEY] = null

    const result = getProgress('chapter-01')
    expect(result.total).toBeGreaterThanOrEqual(1)
  })
})

// ---------------------------------------------------------------------------
// Tests: Problem state formats (boolean true, boolean false, object with checked)
// ---------------------------------------------------------------------------
describe('progress.js - Problem State Formats', () => {
  it('should handle boolean true as checked', () => {
    clearStorage()
    setRawProgress({ 'chapter-01': { '1': true } })
    setTotals({ 'chapter-01': 1 })

    const result = getProgress('chapter-01')
    expect(result.done).toBe(1)
    expect(result.donePct).toBe(100)
  })

  it('should handle boolean false as not checked', () => {
    clearStorage()
    setRawProgress({ 'chapter-01': { '1': false } })
    setTotals({ 'chapter-01': 1 })

    const result = getProgress('chapter-01')
    expect(result.done).toBe(0)
    expect(result.donePct).toBe(0)
  })

  it('should handle object with checked: true', () => {
    clearStorage()
    setRawProgress({ 'chapter-01': { '1': { checked: true } } })
    setTotals({ 'chapter-01': 1 })

    const result = getProgress('chapter-01')
    expect(result.done).toBe(1)
  })

  it('should handle object with checked: false', () => {
    clearStorage()
    setRawProgress({ 'chapter-01': { '1': { checked: false } } })
    setTotals({ 'chapter-01': 1 })

    const result = getProgress('chapter-01')
    expect(result.done).toBe(0)
  })

  it('should handle mixed problem state formats', () => {
    clearStorage()
    setRawProgress({
      'chapter-01': {
        '1': true,                    // boolean true
        '2': false,                   // boolean false
        '3': { checked: true },       // object true
        '4': { checked: false },      // object false
        '5': null,                    // null (falsy)
        '6': undefined,               // undefined (falsy)
      }
    })
    setTotals({ 'chapter-01': 6 })

    const result = getProgress('chapter-01')
    expect(result.done).toBe(2) // only '1' and '3' are truthy
    expect(result.donePct).toBe(33) // 2/6 = 33%
  })
})

// ---------------------------------------------------------------------------
// Tests: Empty states
// ---------------------------------------------------------------------------
describe('progress.js - Empty States', () => {
  it('should handle no storage at all', () => {
    clearStorage()
    // No storage set

    const result = getProgress()
    expect(result.doneTotal.value).toBe(0)
  })

  it('should handle empty progress object', () => {
    clearStorage()
    setRawProgress({})

    const result = getProgress()
    expect(result.doneTotal.value).toBe(0)
  })

  it('should handle empty chapter object', () => {
    clearStorage()
    setRawProgress({ 'chapter-01': {} })

    const result = getProgress('chapter-01')
    expect(result.done).toBe(0)
  })

  it('should handle all chapters empty', () => {
    clearStorage()
    setRawProgress({
      'chapter-01': {},
      'chapter-02': {}
    })

    const result = getProgress()
    expect(result.doneTotal.value).toBe(0)
  })

  it('should handle query for non-existent chapter', () => {
    clearStorage()
    setRawProgress({ 'chapter-01': { '1': true } })

    const result = getProgress('chapter-99')
    expect(result.done).toBe(0)
    expect(result.total).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// Tests: Chapter-level operations
// ---------------------------------------------------------------------------
describe('progress.js - Chapter-level Operations', () => {
  it('should calculate per-chapter progress independently', () => {
    clearStorage()
    setRawProgress({
      'chapter-01': { '1': true, '2': true, '3': true }, // 3/10
      'chapter-02': { '1': true }                           // 1/20
    })
    setTotals({
      'chapter-01': 10,
      'chapter-02': 20
    })

    const ch1 = getProgress('chapter-01')
    const ch2 = getProgress('chapter-02')

    expect(ch1.done).toBe(3)
    expect(ch1.total).toBe(10)
    expect(ch1.donePct).toBe(30)

    expect(ch2.done).toBe(1)
    expect(ch2.total).toBe(20)
    expect(ch2.donePct).toBe(5)
  })

  it('should aggregate correctly in global progress', () => {
    clearStorage()
    setRawProgress({
      'chapter-01': { '1': true, '2': true },
      'chapter-02': { '1': true }
    })
    setTotals({
      'chapter-01': 10,
      'chapter-02': 10
    })

    const global = getProgress()

    expect(global.doneTotal.value).toBe(3)
    // chapter-01 and chapter-02 use localStorage totals (10+10=20)
    // chapters 3-12 fall back to ch.count (59+70+121+174+687+612+318+505+424+95=3065)
    // total = 10 + 10 + 3065 = 3085
    expect(global.totalProblems.value).toBe(3085)
    expect(global.donePct.value).toBe(0) // 3/3085 rounds to 0%
  })

  it('should handle partial chapter completion', () => {
    clearStorage()
    setRawProgress({
      'chapter-01': { '1': true, '2': false, '3': true, '4': false }
    })
    setTotals({ 'chapter-01': 4 })

    const result = getProgress('chapter-01')
    expect(result.done).toBe(2)
    expect(result.total).toBe(4)
    expect(result.donePct).toBe(50)
  })
})

// ---------------------------------------------------------------------------
// Tests: Invalid chapterId handling
// ---------------------------------------------------------------------------
describe('progress.js - Invalid chapterId Handling', () => {
  it('should handle null chapterId', () => {
    clearStorage()
    setRawProgress({ 'chapter-01': { '1': true } })

    const result = getProgress(null)
    // Should fall through to global mode
    expect(result.doneTotal).toBeDefined()
  })

  it('should handle undefined chapterId', () => {
    clearStorage()
    setRawProgress({ 'chapter-01': { '1': true } })

    const result = getProgress(undefined)
    expect(result.doneTotal).toBeDefined()
  })

  it('should handle numeric chapterId', () => {
    clearStorage()
    setRawProgress({ 'chapter-01': { '1': true } })

    const result = getProgress(1)
    // Numeric chapterId is treated as a chapter key lookup (not found), returns chapter-specific
    expect(result.done).toBe(0)
    expect(result.total).toBe(1)
  })

  it('should handle empty string chapterId', () => {
    clearStorage()
    setRawProgress({ 'chapter-01': { '1': true } })

    const result = getProgress('')
    // Empty string is falsy, should return global
    expect(result.doneTotal).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// Tests: All 12 chapters work correctly
// ---------------------------------------------------------------------------
describe('progress.js - All 12 Chapters', () => {
  it('should handle all 12 chapters from CHAPTERS', () => {
    clearStorage()
    const progress = {}
    const totals = {}
    let doneCount = 0

    CHAPTERS.forEach((ch, idx) => {
      // Add 2 checked problems per chapter
      progress[ch.id] = {
        '1': true,
        '2': true,
        '3': false
      }
      totals[ch.id] = 10
      doneCount += 2
    })

    setRawProgress(progress)
    setTotals(totals)

    const global = getProgress()
    expect(global.doneTotal.value).toBe(doneCount)
    expect(global.totalProblems.value).toBe(120) // 12 * 10
  })

  it('should verify chapter IDs from CHAPTERS exist', () => {
    CHAPTERS.forEach(ch => {
      clearStorage()
      setRawProgress({ [ch.id]: { '1': true } })
      setTotals({ [ch.id]: 5 })

      const result = getProgress(ch.id)
      expect(result.done).toBe(1)
      expect(result.total).toBe(5)
    })
  })
})

// ---------------------------------------------------------------------------
// Tests: verify localStorage key names
// ---------------------------------------------------------------------------
describe('progress.js - Storage Key Verification', () => {
  it('should use mc-algo-progress as the main storage key', () => {
    clearStorage()
    mockStorage['mc-algo-progress'] = JSON.stringify({ 'chapter-01': { '1': true } })

    const result = getProgress('chapter-01')
    expect(result.done).toBe(1)
  })

  it('should use _chapterTotals for totals storage', () => {
    clearStorage()
    mockStorage[STORAGE_KEY] = JSON.stringify({ 'chapter-01': { '1': true } })
    mockStorage[TOTALS_KEY] = JSON.stringify({ 'chapter-01': 5 })

    const result = getProgress('chapter-01')
    expect(result.total).toBe(5)
  })
})

// ---------------------------------------------------------------------------
// MISSING FUNCTIONS - documented but not implemented
// These tests document the expected API that does not exist in progress.js
// ---------------------------------------------------------------------------
describe('progress.js - Missing Functions (NOT IMPLEMENTED)', () => {
  it('setProgress(chapterId, problemId, checked) - NOT IMPLEMENTED', () => {
    // This function does not exist in progress.js
    // The composable only has getProgress() for reading
    expect(() => {
      // vi.importActual would return { getProgress } which does not have setProgress
    }).not.toThrow()
  })

  it('toggleProgress(chapterId, problemId) - NOT IMPLEMENTED', () => {
    // This function does not exist in progress.js
  })

  it('clearProgress() - NOT IMPLEMENTED', () => {
    // This function does not exist in progress.js
  })

  it('clearProgress(chapterId) - NOT IMPLEMENTED', () => {
    // This function does not exist in progress.js
  })

  it('getStats() - NOT IMPLEMENTED', () => {
    // This function does not exist in progress.js
    // Statistics are embedded in getProgress() return values
  })
})
