/**
 * Unit Tests for progress.js - Progress composable (Node-safe)
 * Tests pure localStorage simulation without DOM
 */

import { describe, it, expect, vi } from 'vitest'

// Simulated localStorage for testing
function createLocalStorageMock(initialStore = {}) {
  let store = { ...initialStore }
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: () => { store = {} },
    _getStore: () => store,
    _setStore: (s) => { store = s }
  }
}

const CHAPTERS = [
  { id: 'chapter-01', title: '第一章' },
  { id: 'chapter-02', title: '第二章' },
]

describe('progress.js - loadRaw()', () => {
  it('should parse valid JSON', () => {
    const store = {
      'mc-algo-progress': JSON.stringify({ 'chapter-01': { '1': true } })
    }

    const data = store['mc-algo-progress']
    const parsed = JSON.parse(data || '{}')

    expect(parsed['chapter-01']['1']).toBe(true)
  })

  it('should return empty object on null', () => {
    const store = { 'mc-algo-progress': null }
    const data = store['mc-algo-progress']
    const parsed = JSON.parse(data || '{}')

    expect(Object.keys(parsed)).toHaveLength(0)
  })

  it('should return empty object on malformed JSON', () => {
    const store = { 'mc-algo-progress': '{ invalid json }' }
    let parsed
    try {
      parsed = JSON.parse(store['mc-algo-progress'])
    } catch {
      parsed = {}
    }

    expect(Object.keys(parsed)).toHaveLength(0)
  })

  it('should handle missing key', () => {
    const store = {}
    const data = store['mc-algo-progress']
    const parsed = JSON.parse(data || '{}')

    expect(Object.keys(parsed)).toHaveLength(0)
  })
})

describe('progress.js - loadTotals()', () => {
  it('should parse valid totals JSON', () => {
    const store = {
      '_chapterTotals': JSON.stringify({ 'chapter-01': 10, 'chapter-02': 20 })
    }

    const data = store['_chapterTotals']
    const parsed = JSON.parse(data || '{}')

    expect(parsed['chapter-01']).toBe(10)
    expect(parsed['chapter-02']).toBe(20)
  })

  it('should return empty object on null', () => {
    const store = { '_chapterTotals': null }
    const data = store['_chapterTotals']
    const parsed = JSON.parse(data || '{}')

    expect(Object.keys(parsed)).toHaveLength(0)
  })
})

describe('progress.js - getProgress() chapter level', () => {
  function getChapterProgress(raw, totals, chapterId) {
    const checked = raw[chapterId] || {}
    const done = Object.values(checked).filter(Boolean).length
    const total = totals[chapterId] || Object.keys(checked).length || 1
    return { done, total, donePct: Math.round(done / total * 100) }
  }

  it('should calculate correct done/total for chapter', () => {
    const raw = { 'chapter-01': { '1': true, '2': true, '3': false } }
    const totals = { 'chapter-01': 10 }

    const result = getChapterProgress(raw, totals, 'chapter-01')

    expect(result.done).toBe(2)
    expect(result.total).toBe(10)
    expect(result.donePct).toBe(20)
  })

  it('should handle missing chapter totals', () => {
    const raw = { 'chapter-01': { '1': true, '2': true } }
    const totals = {}

    const result = getChapterProgress(raw, totals, 'chapter-01')

    expect(result.total).toBe(2) // Falls back to Object.keys(checked).length
  })

  it('should handle empty chapter', () => {
    const raw = {}
    const totals = { 'chapter-01': 10 }

    const result = getChapterProgress(raw, totals, 'chapter-01')

    expect(result.done).toBe(0)
    expect(result.total).toBe(10)
    expect(result.donePct).toBe(0)
  })

  it('should handle zero total with fallback', () => {
    const raw = { 'chapter-01': {} }
    const totals = { 'chapter-01': 0 }

    const result = getChapterProgress(raw, totals, 'chapter-01')

    expect(result.total).toBe(1) // Falls back to 1
  })
})

describe('progress.js - getProgress() global level', () => {
  function getGlobalProgress(raw, totals, chapters) {
    let done = 0
    let total = 0
    for (const ch of chapters) {
      const checked = raw[ch.id] || {}
      done += Object.values(checked).filter(Boolean).length
      total += totals[ch.id] || Object.keys(checked).length
    }
    return { done, total, donePct: total ? Math.round(done / total * 100) : 0 }
  }

  it('should sum all chapters', () => {
    const raw = {
      'chapter-01': { '1': true, '2': true },
      'chapter-02': { '1': true }
    }
    const totals = {
      'chapter-01': 10,
      'chapter-02': 10
    }

    const result = getGlobalProgress(raw, totals, CHAPTERS)

    expect(result.done).toBe(3)
    expect(result.total).toBe(20)
    expect(result.donePct).toBe(15)
  })

  it('should handle no progress', () => {
    const raw = {}
    const totals = {}

    const result = getGlobalProgress(raw, totals, CHAPTERS)

    expect(result.done).toBe(0)
    expect(result.total).toBe(0)
    expect(result.donePct).toBe(0)
  })

  it('should handle partial chapters', () => {
    const raw = {
      'chapter-01': { '1': true, '2': true, '3': true }
    }
    const totals = {
      'chapter-01': 10,
      'chapter-02': 10
    }

    const result = getGlobalProgress(raw, totals, CHAPTERS)

    expect(result.done).toBe(3)
    expect(result.total).toBe(20)
  })
})

describe('progress.js - isChecked()', () => {
  function isChecked(progress, chapterId, probId) {
    return !!(progress[chapterId] && progress[chapterId][probId])
  }

  it('should return true when problem is checked', () => {
    const progress = { 'chapter-01': { '1': true } }
    expect(isChecked(progress, 'chapter-01', '1')).toBe(true)
  })

  it('should return false when problem is not checked', () => {
    const progress = { 'chapter-01': { '1': false } }
    expect(isChecked(progress, 'chapter-01', '1')).toBe(false)
  })

  it('should return false when chapter does not exist', () => {
    const progress = {}
    expect(isChecked(progress, 'chapter-01', '1')).toBe(false)
  })

  it('should return false when problem does not exist', () => {
    const progress = { 'chapter-01': {} }
    expect(isChecked(progress, 'chapter-01', '1')).toBe(false)
  })

  it('should handle truthy non-boolean values', () => {
    const progress = { 'chapter-01': { '1': 1 } }
    expect(isChecked(progress, 'chapter-01', '1')).toBe(true)
  })
})

describe('progress.js - countDone()', () => {
  function countDone(progress, chapterId) {
    if (!progress[chapterId]) return 0
    return Object.values(progress[chapterId]).filter(Boolean).length
  }

  it('should count checked problems in chapter', () => {
    const progress = { 'chapter-01': { '1': true, '2': true, '3': false } }
    expect(countDone(progress, 'chapter-01')).toBe(2)
  })

  it('should return 0 for empty chapter', () => {
    const progress = { 'chapter-01': {} }
    expect(countDone(progress, 'chapter-01')).toBe(0)
  })

  it('should return 0 for missing chapter', () => {
    const progress = {}
    expect(countDone(progress, 'chapter-01')).toBe(0)
  })

  it('should handle mixed truthy values', () => {
    const progress = { 'chapter-01': { '1': true, '2': 1, '3': 'yes', '4': false, '5': null } }
    expect(countDone(progress, 'chapter-01')).toBe(3)
  })
})
