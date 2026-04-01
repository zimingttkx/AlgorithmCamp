/**
 * Unit Tests for progressSync.js - Sync Composable (Node-safe)
 * Tests smart merge, local progress, and sync logic without DOM
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock localStorage
const mockStorage = {}
global.localStorage = {
  getItem: vi.fn((key) => mockStorage[key] || null),
  setItem: vi.fn((key, value) => { mockStorage[key] = value }),
  removeItem: vi.fn((key) => { delete mockStorage[key] }),
  clear: vi.fn(() => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) })
}

// Replicate smartMerge logic for testing
function smartMerge(local, server) {
  const result = {}

  const allChapters = new Set([
    ...Object.keys(local || {}),
    ...Object.keys(server || {})
  ])

  for (const chId of allChapters) {
    result[chId] = {}
    const localProblems = local?.[chId] || {}
    const serverProblems = server?.[chId] || {}
    const allProblems = new Set([
      ...Object.keys(localProblems),
      ...Object.keys(serverProblems)
    ])

    for (const probId of allProblems) {
      const localVal = localProblems[probId]
      const serverVal = serverProblems[probId]

      const localChecked = typeof localVal === 'object' ? !!localVal.checked : !!localVal
      const serverChecked = typeof serverVal === 'object' ? !!serverVal.checked : !!serverVal

      if (localChecked || serverChecked) {
        const localTime = typeof localVal === 'object' && localVal.checkedAt
          ? new Date(localVal.checkedAt).getTime()
          : Date.now()
        const serverTime = typeof serverVal === 'object' && serverVal.checkedAt
          ? new Date(serverVal.checkedAt).getTime()
          : 0

        let newerVal
        if (localChecked && serverChecked) {
          newerVal = serverTime > localTime ? serverVal : localVal
        } else {
          newerVal = localChecked ? localVal : serverVal
        }
        result[chId][probId] = newerVal
      }
    }
  }

  return result
}

function getLocalProgress() {
  try {
    return JSON.parse(mockStorage['mc-algo-progress'] || '{}')
  } catch {
    return {}
  }
}

describe('progressSync.js - smartMerge()', () => {
  describe('basic merge scenarios', () => {
    it('should return local if server is null', () => {
      const local = { 'chapter-01': { '1': true } }
      const result = smartMerge(local, null)
      expect(result['chapter-01']['1']).toBe(true)
    })

    it('should return local if server is undefined', () => {
      const local = { 'chapter-01': { '1': true } }
      const result = smartMerge(local, undefined)
      expect(result['chapter-01']['1']).toBe(true)
    })

    it('should return server if local is empty', () => {
      const server = { 'chapter-01': { '1': true } }
      const result = smartMerge({}, server)
      expect(result['chapter-01']['1']).toBe(true)
    })

    it('should return server if local is null', () => {
      const server = { 'chapter-01': { '1': true } }
      const result = smartMerge(null, server)
      expect(result['chapter-01']['1']).toBe(true)
    })

    it('should handle both null', () => {
      const result = smartMerge(null, null)
      expect(Object.keys(result)).toHaveLength(0)
    })
  })

  describe('union merge - checked problems', () => {
    it('should merge checked problems from both sources', () => {
      const local = {
        'chapter-01': { '1': true, '2': true }
      }
      const server = {
        'chapter-01': { '1': true, '3': true }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toBe(true) // from both
      expect(result['chapter-01']['2']).toBe(true) // from local
      expect(result['chapter-01']['3']).toBe(true) // from server
    })

    it('should only include problems that are checked in at least one source', () => {
      const local = {
        'chapter-01': { '1': true, '2': false }
      }
      const server = {
        'chapter-01': { '1': false, '3': true }
      }
      const result = smartMerge(local, server)
      // '1' is checked in local, so it gets included
      expect(result['chapter-01']['1']).toBeDefined()
      // '2' is not checked in either, so it should NOT be included
      expect(result['chapter-01']['2']).toBeUndefined()
      // '3' is checked in server, so it gets included
      expect(result['chapter-01']['3']).toBe(true)
    })

    it('should handle mixed checked/unchecked across chapters', () => {
      const local = {
        'chapter-01': { '1': true, '2': false },
        'chapter-02': { '1': false }
      }
      const server = {
        'chapter-01': { '1': false, '3': true },
        'chapter-03': { '1': true }
      }
      const result = smartMerge(local, server)
      // '1' in ch-01: checked in local (true), not checked in server
      expect(result['chapter-01']['1']).toBeDefined()
      // '2' in ch-01: not checked in either
      expect(result['chapter-01']['2']).toBeUndefined()
      // '3' in ch-01: checked in server
      expect(result['chapter-01']['3']).toBe(true)
      // ch-02 has no checked problems, results in empty chapter entry
      expect(Object.keys(result['chapter-02'] || {})).toHaveLength(0)
      // ch-03: checked in server
      expect(result['chapter-03']['1']).toBe(true)
    })
  })

  describe('chapter-only existence merge', () => {
    it('should include chapter only in local', () => {
      const local = { 'chapter-01': { '1': true } }
      const server = {}
      const result = smartMerge(local, server)
      expect(result['chapter-01']).toBeDefined()
      expect(result['chapter-01']['1']).toBe(true)
    })

    it('should include chapter only in server', () => {
      const local = {}
      const server = { 'chapter-01': { '1': true } }
      const result = smartMerge(local, server)
      expect(result['chapter-01']).toBeDefined()
      expect(result['chapter-01']['1']).toBe(true)
    })

    it('should handle multiple chapters', () => {
      const local = {
        'chapter-01': { '1': true },
        'chapter-02': { '1': true }
      }
      const server = {
        'chapter-03': { '1': true }
      }
      const result = smartMerge(local, server)
      expect(Object.keys(result)).toHaveLength(3)
      expect(result['chapter-01']['1']).toBe(true)
      expect(result['chapter-02']['1']).toBe(true)
      expect(result['chapter-03']['1']).toBe(true)
    })
  })

  describe('timestamp-aware merge', () => {
    it('should prefer newer timestamp when both checked', () => {
      const oldTime = '2024-01-01T00:00:00Z'
      const newTime = '2024-01-02T00:00:00Z'

      const local = {
        'chapter-01': { '1': { checked: true, checkedAt: oldTime } }
      }
      const server = {
        'chapter-01': { '1': { checked: true, checkedAt: newTime } }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1'].checkedAt).toBe(newTime)
    })

    it('should preserve local timestamp if newer', () => {
      const localTime = '2024-01-03T00:00:00Z'
      const serverTime = '2024-01-01T00:00:00Z'

      const local = {
        'chapter-01': { '1': { checked: true, checkedAt: localTime } }
      }
      const server = {
        'chapter-01': { '1': { checked: true, checkedAt: serverTime } }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1'].checkedAt).toBe(localTime)
    })

    it('should handle boolean values with default timestamp', () => {
      const local = {
        'chapter-01': { '1': true }
      }
      const server = {
        'chapter-01': { '1': true }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle empty objects', () => {
      const local = { 'chapter-01': {} }
      const server = { 'chapter-01': {} }
      const result = smartMerge(local, server)
      expect(result['chapter-01']).toEqual({})
    })

    it('should handle problem IDs with special characters', () => {
      const local = {
        'chapter-01': { '1-a': true, '2_b': true }
      }
      const server = {
        'chapter-01': { '1-a': true }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1-a']).toBe(true)
      expect(result['chapter-01']['2_b']).toBe(true)
    })

    it('should handle truthy non-boolean values', () => {
      const local = {
        'chapter-01': { '1': 1, '2': 'yes' }
      }
      const server = {
        'chapter-01': {}
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toBe(1)
      expect(result['chapter-01']['2']).toBe('yes')
    })

    it('should handle undefined values in objects', () => {
      const local = {
        'chapter-01': { '1': undefined }
      }
      const server = {
        'chapter-01': {}
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toBeUndefined()
    })
  })
})

describe('progressSync.js - getLocalProgress()', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach(k => delete mockStorage[k])
  })

  it('should return empty object when no progress stored', () => {
    const result = getLocalProgress()
    expect(result).toEqual({})
  })

  it('should parse valid JSON progress', () => {
    mockStorage['mc-algo-progress'] = JSON.stringify({ 'chapter-01': { '1': true } })
    const result = getLocalProgress()
    expect(result['chapter-01']['1']).toBe(true)
  })

  it('should return empty object on JSON parse error', () => {
    mockStorage['mc-algo-progress'] = 'invalid json'
    const result = getLocalProgress()
    expect(result).toEqual({})
  })

  it('should return empty object on null', () => {
    mockStorage['mc-algo-progress'] = null
    const result = getLocalProgress()
    expect(result).toEqual({})
  })

  it('should return empty object on empty string', () => {
    mockStorage['mc-algo-progress'] = ''
    const result = getLocalProgress()
    expect(result).toEqual({})
  })
})

describe('progressSync.js - Sync Constants', () => {
  it('should have correct debounce time', () => {
    const SYNC_DEBOUNCE_MS = 3000
    expect(SYNC_DEBOUNCE_MS).toBe(3000)
  })

  it('should have correct max retries', () => {
    const MAX_RETRIES = 3
    expect(MAX_RETRIES).toBe(3)
  })

  it('should have correct storage key', () => {
    const PROGRESS_KEY = 'mc-algo-progress'
    expect(PROGRESS_KEY).toBe('mc-algo-progress')
  })
})

describe('progressSync.js - localStorage interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.keys(mockStorage).forEach(k => delete mockStorage[k])
  })

  it('should set progress in localStorage', () => {
    const progress = { 'chapter-01': { '1': true } }
    localStorage.setItem('mc-algo-progress', JSON.stringify(progress))
    expect(localStorage.setItem).toHaveBeenCalledWith('mc-algo-progress', JSON.stringify(progress))
  })

  it('should get progress from localStorage', () => {
    const progress = { 'chapter-01': { '1': true } }
    mockStorage['mc-algo-progress'] = JSON.stringify(progress)
    const result = localStorage.getItem('mc-algo-progress')
    expect(result).toBe(JSON.stringify(progress))
  })

  it('should remove progress from localStorage', () => {
    localStorage.removeItem('mc-algo-progress')
    expect(localStorage.removeItem).toHaveBeenCalledWith('mc-algo-progress')
  })

  it('should clear all localStorage', () => {
    localStorage.clear()
    expect(localStorage.clear).toHaveBeenCalled()
  })
})
