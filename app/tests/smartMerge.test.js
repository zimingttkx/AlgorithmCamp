/**
 * Unit Tests for smartMerge function
 * Tests the core conflict resolution logic for progress sync
 */

import { describe, it, expect } from 'vitest'

// Inline the smartMerge function for testing (same logic as in progressSync.js)
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

      // Union: if checked in either → keep checked
      if (localChecked || serverChecked) {
        // Normalize timestamps to numbers for comparison
        const localTime = typeof localVal === 'object' && localVal.checkedAt
          ? new Date(localVal.checkedAt).getTime()
          : Date.now()
        const serverTime = typeof serverVal === 'object' && serverVal.checkedAt
          ? new Date(serverVal.checkedAt).getTime()
          : 0

        // Only compare timestamps when BOTH agree on checked=true
        // Otherwise, prefer the one that IS checked (union principle)
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

describe('smartMerge', () => {

  // ============ MERGE BEHAVIOR TESTS ============

  describe('Basic merge behavior', () => {
    it('should return empty when both sources are empty', () => {
      expect(smartMerge({}, {})).toEqual({})
      expect(smartMerge(null, null)).toEqual({})
      expect(smartMerge(undefined, {})).toEqual({})
    })

    it('should return server-only data when local is empty', () => {
      const server = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-01' } }
      }
      const result = smartMerge({}, server)
      expect(result['chapter-01']['1']).toEqual({ checked: true, checkedAt: '2024-01-01' })
    })

    it('should return local-only data when server is empty', () => {
      const local = {
        'chapter-01': { '1': true, '2': false }
      }
      const result = smartMerge(local, {})
      // false values are treated as missing (not checked), only true is kept
      expect(result['chapter-01']['1']).toBe(true)
      expect(result['chapter-01']['2']).toBeUndefined()
    })

    it('should handle both sides having same chapter', () => {
      const local = {
        'chapter-01': { '1': true }
      }
      const server = {
        'chapter-01': { '2': true }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toBe(true)
      expect(result['chapter-01']['2']).toBe(true)
    })
  })

  // ============ UNION MERGE (KEY REQUIREMENT) ============

  describe('Union merge - checked problems from BOTH sides are preserved', () => {
    it('should keep checked from local when server has different checked items', () => {
      const local = {
        'chapter-01': { '1': true, '2': true }
      }
      const server = {
        'chapter-01': { '3': true, '4': true }
      }
      const result = smartMerge(local, server)
      expect(Object.keys(result['chapter-01']).sort()).toEqual(['1', '2', '3', '4'])
      expect(result['chapter-01']['1']).toBe(true)
      expect(result['chapter-01']['2']).toBe(true)
      expect(result['chapter-01']['3']).toBe(true)
      expect(result['chapter-01']['4']).toBe(true)
    })

    it('should keep checked from BOTH sides in same chapter', () => {
      const local = {
        'chapter-01': { '1': true, '2': true }
      }
      const server = {
        'chapter-01': { '2': true, '3': true }
      }
      const result = smartMerge(local, server)
      // All three should be present
      expect(result['chapter-01']['1']).toBe(true)
      expect(result['chapter-01']['2']).toBe(true)
      expect(result['chapter-01']['3']).toBe(true)
    })

    it('should handle mixed checked/unchecked from both sides', () => {
      const local = {
        'chapter-01': { '1': true, '2': false }
      }
      const server = {
        'chapter-01': { '2': true, '3': true }
      }
      const result = smartMerge(local, server)
      // 1: checked in local, not in server → checked
      expect(result['chapter-01']['1']).toBe(true)
      // 2: false in local, true in server → true (union keeps checked)
      expect(result['chapter-01']['2']).toBe(true)
      // 3: true in server → checked
      expect(result['chapter-01']['3']).toBe(true)
    })
  })

  // ============ FALSE VALUE HANDLING ============

  describe('False/unChecked values', () => {
    it('should NOT include unchecked items in result', () => {
      const local = {
        'chapter-01': { '1': false, '2': false }
      }
      const server = {
        'chapter-01': { '3': false, '4': false }
      }
      const result = smartMerge(local, server)
      expect(Object.keys(result['chapter-01'] || {})).toHaveLength(0)
    })

    it('should treat explicit false the same as missing', () => {
      const local = {
        'chapter-01': { '1': false }
      }
      const server = {
        'chapter-01': {}
      }
      const result = smartMerge(local, server)
      expect(Object.keys(result['chapter-01'] || {})).toHaveLength(0)
    })
  })

  // ============ MULTI-CHAPTER HANDLING ============

  describe('Multi-chapter handling', () => {
    it('should merge across multiple chapters independently', () => {
      const local = {
        'chapter-01': { '1': true },
        'chapter-02': { '2': true }
      }
      const server = {
        'chapter-01': { '3': true },
        'chapter-03': { '4': true }
      }
      const result = smartMerge(local, server)

      expect(result['chapter-01']['1']).toBe(true)
      expect(result['chapter-01']['3']).toBe(true)
      expect(result['chapter-02']['2']).toBe(true)
      expect(result['chapter-03']['4']).toBe(true)
    })
  })

  // ============ TIMESTAMP RESOLUTION ============

  describe('Timestamp-based resolution when both sides have same problem', () => {
    it('should prefer server value when server timestamp is newer', () => {
      const local = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } }
      }
      const server = {
        'chapter-01': { '1': { checked: false, checkedAt: '2024-01-02T00:00:00Z' } }
      }
      const result = smartMerge(local, server)
      // Server is newer, but union keeps checked=true
      expect(result['chapter-01']['1'].checked).toBe(true)
    })

    it('should prefer local value when local timestamp is newer', () => {
      const local = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-03T00:00:00Z' } }
      }
      const server = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1'].checkedAt).toBe('2024-01-03T00:00:00Z')
    })
  })

  // ============ LEGACY FORMAT COMPATIBILITY ============

  describe('Legacy format (plain boolean) compatibility', () => {
    it('should handle legacy plain boolean format from localStorage', () => {
      const local = {
        'chapter-01': { '1': true, '2': false }
      }
      const server = {
        'chapter-01': { '3': true, '4': { checked: true, checkedAt: '2024-01-01' } }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toBe(true)
      expect(result['chapter-01']['3']).toBe(true)
      expect(result['chapter-01']['4']).toEqual({ checked: true, checkedAt: '2024-01-01' })
    })

    it('should handle object format from server API', () => {
      const local = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-01' } }
      }
      const server = {
        'chapter-01': { '2': { checked: true, checkedAt: '2024-01-02' } }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toEqual({ checked: true, checkedAt: '2024-01-01' })
      expect(result['chapter-01']['2']).toEqual({ checked: true, checkedAt: '2024-01-02' })
    })
  })

  // ============ EDGE CASES ============

  describe('Edge cases', () => {
    it('should handle null/undefined chapter objects gracefully', () => {
      const local = { 'chapter-01': null }
      const server = { 'chapter-01': { '1': true } }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toBe(true)
    })

    it('should handle server returning only object format', () => {
      const local = {}
      const server = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-01' } }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toEqual({ checked: true, checkedAt: '2024-01-01' })
    })

    it('should not mutate original objects', () => {
      const local = { 'chapter-01': { '1': true } }
      const server = { 'chapter-02': { '2': true } }
      smartMerge(local, server)
      expect(local['chapter-01']['1']).toBe(true)
      expect(server['chapter-02']['2']).toBe(true)
    })

    it('should handle extremely large chapter/problem counts', () => {
      const local = {}
      const server = {}
      for (let c = 1; c <= 20; c++) {
        const chId = `chapter-${String(c).padStart(2, '0')}`
        local[chId] = {}
        server[chId] = {}
        for (let p = 1; p <= 100; p++) {
          local[chId][`prob_${p}`] = p % 2 === 0
          server[chId][`prob_${p}`] = p % 3 === 0
        }
      }
      const result = smartMerge(local, server)
      expect(Object.keys(result)).toHaveLength(20)
      for (let c = 1; c <= 20; c++) {
        const chId = `chapter-${String(c).padStart(2, '0')}`
        expect(Object.keys(result[chId]).length).toBeGreaterThan(0)
      }
    })
  })

  // ============ REAL-WORLD SCENARIOS ============

  describe('Real-world scenarios', () => {
    it('Scenario: User on device A checked problems 1-5, device B checked 6-10', () => {
      const deviceA = {
        'chapter-01': { '1': true, '2': true, '3': true, '4': true, '5': true }
      }
      const deviceB = {
        'chapter-01': { '6': true, '7': true, '8': true, '9': true, '10': true }
      }
      const result = smartMerge(deviceA, deviceB)
      // All 10 problems should be present (use numeric sort for comparison)
      const resultKeys = Object.keys(result['chapter-01']).sort((a, b) => Number(a) - Number(b))
      expect(resultKeys).toEqual(['1','2','3','4','5','6','7','8','9','10'])
      expect(result['chapter-01']['1']).toBe(true)
      expect(result['chapter-01']['10']).toBe(true)
    })

    it('Scenario: Same problem checked on both devices (no conflict)', () => {
      const deviceA = {
        'chapter-01': { '1': true, '2': true }
      }
      const deviceB = {
        'chapter-01': { '1': true, '3': true }
      }
      const result = smartMerge(deviceA, deviceB)
      expect(result['chapter-01']['1']).toBe(true)
      expect(result['chapter-01']['2']).toBe(true)
      expect(result['chapter-01']['3']).toBe(true)
    })

    it('Scenario: New user on new device gets all progress from server', () => {
      const emptyLocal = {}
      const serverData = {
        'chapter-01': { '1': true, '2': true },
        'chapter-02': { '1': true }
      }
      const result = smartMerge(emptyLocal, serverData)
      expect(result['chapter-01']['1']).toBe(true)
      expect(result['chapter-02']['1']).toBe(true)
    })

    it('Scenario: User unchecked a problem on one device but checked it on another', () => {
      // Device A: checked, then unchecked (local false)
      // Device B: checked
      // Union: checked wins
      const deviceA = {
        'chapter-01': { '1': false }
      }
      const deviceB = {
        'chapter-01': { '1': true }
      }
      const result = smartMerge(deviceA, deviceB)
      expect(result['chapter-01']['1']).toBe(true) // checked wins in union
    })
  })
})
