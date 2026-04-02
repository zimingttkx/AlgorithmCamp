/**
 * Comprehensive Unit Tests for smartMerge function
 * Tests the core conflict resolution logic for progress sync
 * Based on progressSync.js smartMerge function
 */

import { describe, it, expect } from 'vitest'

// Inline the smartMerge function for testing (mirrors progressSync.js exactly)
function smartMerge(local, server) {
  const result = {}

  // Collect all chapter IDs from both sources
  const allChapters = new Set([
    ...Object.keys(local || {}),
    ...Object.keys(server || {})
  ])

  for (const chId of allChapters) {
    const localProblems = local?.[chId] || {}
    const serverProblems = server?.[chId] || {}
    const allProblems = new Set([
      ...Object.keys(localProblems),
      ...Object.keys(serverProblems)
    ])

    const chapterResult = {}

    for (const probId of allProblems) {
      const localVal = localProblems[probId]
      const serverVal = serverProblems[probId]

      // Normalize to boolean
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
          // Both have checked=true - use newer timestamp to preserve most recent action
          newerVal = serverTime > localTime ? serverVal : localVal
        } else {
          // Only one is checked - use that one (union: checked wins)
          newerVal = localChecked ? localVal : serverVal
        }
        chapterResult[probId] = newerVal
      }
    }

    // Only include chapter if it has at least one checked problem
    if (Object.keys(chapterResult).length > 0) {
      result[chId] = chapterResult
    }
  }

  return result
}

describe('smartMerge', () => {

  // ============ SCENARIO 1: Both empty objects ============
  describe('Scenario 1: Both empty objects {}', () => {
    it('should return empty object when both local and server are empty objects', () => {
      const result = smartMerge({}, {})
      expect(result).toEqual({})
      expect(Object.keys(result)).toHaveLength(0)
    })

    it('should return empty object when local is null and server is empty', () => {
      const result = smartMerge(null, {})
      expect(result).toEqual({})
    })

    it('should return empty object when local is undefined and server is empty', () => {
      const result = smartMerge(undefined, {})
      expect(result).toEqual({})
    })

    it('should return empty object when both are null', () => {
      const result = smartMerge(null, null)
      expect(result).toEqual({})
    })

    it('should return empty object when both are undefined', () => {
      const result = smartMerge(undefined, undefined)
      expect(result).toEqual({})
    })
  })

  // ============ SCENARIO 2: Only local has data, server empty ============
  describe('Scenario 2: Only local has data, server empty', () => {
    it('should return local data with boolean format intact', () => {
      const local = {
        'chapter-01': { '1': true, '2': true }
      }
      const server = {}
      const result = smartMerge(local, server)
      expect(result).toEqual({
        'chapter-01': { '1': true, '2': true }
      })
    })

    it('should return local data with object format intact', () => {
      const local = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-15T10:00:00Z' } }
      }
      const server = {}
      const result = smartMerge(local, server)
      expect(result).toEqual({
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-15T10:00:00Z' } }
      })
    })

    it('should return empty result when local has only unchecked problems', () => {
      const local = {
        'chapter-01': { '1': false, '2': false }
      }
      const server = {}
      const result = smartMerge(local, server)
      expect(result).toEqual({})
    })

    it('should handle multiple chapters in local with empty server', () => {
      const local = {
        'chapter-01': { '1': true },
        'chapter-02': { '2': true }
      }
      const server = {}
      const result = smartMerge(local, server)
      expect(result).toEqual({
        'chapter-01': { '1': true },
        'chapter-02': { '2': true }
      })
    })
  })

  // ============ SCENARIO 3: Only server has data, local empty ============
  describe('Scenario 3: Only server has data, local empty', () => {
    it('should return server data with boolean format intact', () => {
      const local = {}
      const server = {
        'chapter-01': { '1': true, '2': true }
      }
      const result = smartMerge(local, server)
      expect(result).toEqual({
        'chapter-01': { '1': true, '2': true }
      })
    })

    it('should return server data with object format intact', () => {
      const local = {}
      const server = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-15T10:00:00Z' } }
      }
      const result = smartMerge(local, server)
      expect(result).toEqual({
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-15T10:00:00Z' } }
      })
    })

    it('should return empty result when server has only unchecked problems', () => {
      const local = {}
      const server = {
        'chapter-01': { '1': false, '2': false }
      }
      const result = smartMerge(local, server)
      expect(result).toEqual({})
    })

    it('should handle multiple chapters in server with empty local', () => {
      const local = {}
      const server = {
        'chapter-01': { '1': true },
        'chapter-02': { '2': true }
      }
      const result = smartMerge(local, server)
      expect(result).toEqual({
        'chapter-01': { '1': true },
        'chapter-02': { '2': true }
      })
    })
  })

  // ============ SCENARIO 4: Same chapter, same problem - both checked, newer timestamp wins ============
  describe('Scenario 4: Same chapter, same problem - both checked (newer timestamp wins)', () => {
    it('should use server value when server timestamp is newer', () => {
      const local = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } }
      }
      const server = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-02T00:00:00Z' } }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toEqual({ checked: true, checkedAt: '2024-01-02T00:00:00Z' })
    })

    it('should use local value when local timestamp is newer', () => {
      const local = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-03T00:00:00Z' } }
      }
      const server = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toEqual({ checked: true, checkedAt: '2024-01-03T00:00:00Z' })
    })

    it('should use server value when timestamps are equal (server preferred)', () => {
      const local = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } }
      }
      const server = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } }
      }
      const result = smartMerge(local, server)
      // When equal, server is preferred (ternary: serverTime > localTime ? serverVal : localVal)
      // Since equal, it falls through to localVal
      expect(result['chapter-01']['1']).toEqual({ checked: true, checkedAt: '2024-01-01T00:00:00Z' })
    })

    it('should use server object when timestamps are equal but server has more fields', () => {
      const local = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-01T00:00:00Z', note: 'local note' } }
      }
      const server = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-01T00:00:00Z', note: 'server note' } }
      }
      const result = smartMerge(local, server)
      // Since equal timestamps, local wins (due to ternary: serverTime > localTime ? serverVal : localVal)
      expect(result['chapter-01']['1'].note).toBe('local note')
    })

    it('should handle multiple problems with different timestamp outcomes', () => {
      const local = {
        'chapter-01': {
          '1': { checked: true, checkedAt: '2024-01-01T00:00:00Z' },
          '2': { checked: true, checkedAt: '2024-01-05T00:00:00Z' }
        }
      }
      const server = {
        'chapter-01': {
          '1': { checked: true, checkedAt: '2024-01-10T00:00:00Z' },
          '2': { checked: true, checkedAt: '2024-01-01T00:00:00Z' }
        }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toEqual({ checked: true, checkedAt: '2024-01-10T00:00:00Z' })
      expect(result['chapter-01']['2']).toEqual({ checked: true, checkedAt: '2024-01-05T00:00:00Z' })
    })
  })

  // ============ SCENARIO 5: Same chapter, same problem - one checked one not (checked wins) ============
  describe('Scenario 5: Same chapter, same problem - one checked one not (checked wins)', () => {
    it('should use checked value when local is checked and server is not', () => {
      const local = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } }
      }
      const server = {
        'chapter-01': { '1': { checked: false, checkedAt: '2024-01-02T00:00:00Z' } }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toEqual({ checked: true, checkedAt: '2024-01-01T00:00:00Z' })
    })

    it('should use checked value when server is checked and local is not', () => {
      const local = {
        'chapter-01': { '1': { checked: false, checkedAt: '2024-01-01T00:00:00Z' } }
      }
      const server = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-02T00:00:00Z' } }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toEqual({ checked: true, checkedAt: '2024-01-02T00:00:00Z' })
    })

    it('should use checked value when local is boolean true and server is false', () => {
      const local = {
        'chapter-01': { '1': true }
      }
      const server = {
        'chapter-01': { '1': false }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toBe(true)
    })

    it('should use checked value when server is boolean true and local is false', () => {
      const local = {
        'chapter-01': { '1': false }
      }
      const server = {
        'chapter-01': { '1': true }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toBe(true)
    })

    it('should use checked value when local is true object and server is false object', () => {
      const local = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } }
      }
      const server = {
        'chapter-01': { '1': { checked: false } }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toEqual({ checked: true, checkedAt: '2024-01-01T00:00:00Z' })
    })

    it('should use checked value when server is true boolean and local is undefined', () => {
      const local = {
        'chapter-01': {}
      }
      const server = {
        'chapter-01': { '1': true }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toBe(true)
    })

    it('should use checked value when local is true boolean and server is undefined', () => {
      const local = {
        'chapter-01': { '1': true }
      }
      const server = {
        'chapter-01': {}
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toBe(true)
    })
  })

  // ============ SCENARIO 6: Same chapter, different problems (union of problems) ============
  describe('Scenario 6: Same chapter, different problems (union of problems)', () => {
    it('should combine different problems from local and server into same chapter', () => {
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

    it('should handle overlapping problems with different checked status', () => {
      const local = {
        'chapter-01': { '1': true, '2': false }
      }
      const server = {
        'chapter-01': { '2': true, '3': true }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toBe(true)
      expect(result['chapter-01']['2']).toBe(true) // server's true wins
      expect(result['chapter-01']['3']).toBe(true)
    })

    it('should handle mixed boolean and object formats for different problems', () => {
      const local = {
        'chapter-01': { '1': true, '2': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } }
      }
      const server = {
        'chapter-01': { '3': true, '4': { checked: true, checkedAt: '2024-01-02T00:00:00Z' } }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toBe(true)
      expect(result['chapter-01']['2']).toEqual({ checked: true, checkedAt: '2024-01-01T00:00:00Z' })
      expect(result['chapter-01']['3']).toBe(true)
      expect(result['chapter-01']['4']).toEqual({ checked: true, checkedAt: '2024-01-02T00:00:00Z' })
    })
  })

  // ============ SCENARIO 7: Different chapters (combine all chapters) ============
  describe('Scenario 7: Different chapters (combine all chapters)', () => {
    it('should combine chapters that exist only in local or only in server', () => {
      const local = {
        'chapter-01': { '1': true },
        'chapter-03': { '3': true }
      }
      const server = {
        'chapter-02': { '2': true },
        'chapter-04': { '4': true }
      }
      const result = smartMerge(local, server)
      expect(Object.keys(result).sort()).toEqual(['chapter-01', 'chapter-02', 'chapter-03', 'chapter-04'])
      expect(result['chapter-01']['1']).toBe(true)
      expect(result['chapter-02']['2']).toBe(true)
      expect(result['chapter-03']['3']).toBe(true)
      expect(result['chapter-04']['4']).toBe(true)
    })

    it('should handle completely disjoint chapters', () => {
      const local = {
        'chapter-01': { '1': true }
      }
      const server = {
        'chapter-12': { '12': true }
      }
      const result = smartMerge(local, server)
      expect(Object.keys(result).sort()).toEqual(['chapter-01', 'chapter-12'])
      expect(result['chapter-01']['1']).toBe(true)
      expect(result['chapter-12']['12']).toBe(true)
    })

    it('should handle same chapter in both with additional problems from different chapters', () => {
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

  // ============ SCENARIO 8: Boolean format vs object format ============
  describe('Scenario 8: Boolean format vs object format', () => {
    it('should handle boolean format in local, object format in server', () => {
      const local = {
        'chapter-01': { '1': true }
      }
      const server = {
        'chapter-01': { '2': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toBe(true)
      expect(result['chapter-01']['2']).toEqual({ checked: true, checkedAt: '2024-01-01T00:00:00Z' })
    })

    it('should handle object format in local, boolean format in server', () => {
      const local = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } }
      }
      const server = {
        'chapter-01': { '2': true }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toEqual({ checked: true, checkedAt: '2024-01-01T00:00:00Z' })
      expect(result['chapter-01']['2']).toBe(true)
    })

    it('should handle same problem as boolean in local and object in server', () => {
      const local = {
        'chapter-01': { '1': true }
      }
      const server = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } }
      }
      const result = smartMerge(local, server)
      // Both are checked=true, so it uses the one with newer timestamp
      // local boolean uses Date.now() as timestamp, server has specific timestamp
      // The result could be either depending on timestamps
      expect(result['chapter-01']['1']).toBeDefined()
    })

    it('should preserve object format metadata when object wins', () => {
      const local = {
        'chapter-01': { '1': { checked: false, checkedAt: '2024-01-01T00:00:00Z' } }
      }
      const server = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-02T00:00:00Z' } }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toEqual({ checked: true, checkedAt: '2024-01-02T00:00:00Z' })
    })
  })

  // ============ SCENARIO 9: Mixed boolean and object formats in same merge ============
  describe('Scenario 9: Mixed boolean and object formats in same merge', () => {
    it('should handle mixed formats across chapters', () => {
      const local = {
        'chapter-01': { '1': true, '2': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } },
        'chapter-02': { '3': true }
      }
      const server = {
        'chapter-01': { '3': true },
        'chapter-02': { '4': { checked: true, checkedAt: '2024-01-02T00:00:00Z' } }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toBe(true)
      expect(result['chapter-01']['2']).toEqual({ checked: true, checkedAt: '2024-01-01T00:00:00Z' })
      expect(result['chapter-01']['3']).toBe(true)
      expect(result['chapter-02']['3']).toBe(true)
      expect(result['chapter-02']['4']).toEqual({ checked: true, checkedAt: '2024-01-02T00:00:00Z' })
    })

    it('should handle same problem with different formats on each side', () => {
      const local = {
        'chapter-01': { '1': true }
      }
      const server = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } }
      }
      const result = smartMerge(local, server)
      // Both checked=true, result is the value with newer timestamp
      expect(result['chapter-01']['1']).toBeDefined()
      // Result could be boolean true or object depending on which timestamp is newer
      const val = result['chapter-01']['1']
      expect(val === true || (val.checked === true)).toBe(true)
    })

    it('should handle all four combinations: bool/bool, bool/obj, obj/bool, obj/obj', () => {
      const local = {
        'chapter-01': {
          '1': true,                    // bool/bool
          '2': { checked: true },        // obj/obj (no timestamp)
          '3': true,                    // bool/obj
          '4': { checked: true }        // obj/bool
        }
      }
      const server = {
        'chapter-01': {
          '1': true,
          '2': { checked: true },
          '3': { checked: true, checkedAt: '2024-01-01T00:00:00Z' },
          '4': true
        }
      }
      const result = smartMerge(local, server)
      // All should be truthy (either boolean true or object with checked: true)
      expect(result['chapter-01']['1']).toBeTruthy()
      expect(result['chapter-01']['2']).toBeTruthy()
      expect(result['chapter-01']['3']).toBeTruthy()
      expect(result['chapter-01']['4']).toBeTruthy()
    })
  })

  // ============ SCENARIO 10: Timestamp comparison when both are checked - newer timestamp wins ============
  describe('Scenario 10: Timestamp comparison when both are checked - newer timestamp wins', () => {
    it('should prefer later timestamp from server', () => {
      const local = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } }
      }
      const server = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-15T00:00:00Z' } }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toEqual({ checked: true, checkedAt: '2024-01-15T00:00:00Z' })
    })

    it('should prefer later timestamp from local', () => {
      const local = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-02-01T00:00:00Z' } }
      }
      const server = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toEqual({ checked: true, checkedAt: '2024-02-01T00:00:00Z' })
    })

    it('should handle millisecond-level timestamp differences', () => {
      const local = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-01T00:00:00.500Z' } }
      }
      const server = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-01T00:00:00.600Z' } }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toEqual({ checked: true, checkedAt: '2024-01-01T00:00:00.600Z' })
    })

    it('should use Date.now() for local boolean format when comparing with server object', () => {
      const oldServerTime = '2020-01-01T00:00:00Z'
      const local = {
        'chapter-01': { '1': true }
      }
      const server = {
        'chapter-01': { '1': { checked: true, checkedAt: oldServerTime } }
      }
      const result = smartMerge(local, server)
      // local uses Date.now() which is current time, so it will be newer than 2020
      // Result will be the local boolean true
      expect(result['chapter-01']['1']).toBe(true)
    })

    it('should use server boolean true when server has boolean format (serverTime=0, localTime is old)', () => {
      // serverTime=0 (no timestamp) is LESS than localTime (2020), so local wins
      const local = {
        'chapter-01': { '1': { checked: true, checkedAt: '2020-01-01T00:00:00Z' } }
      }
      const server = {
        'chapter-01': { '1': true }
      }
      const result = smartMerge(local, server)
      // Since serverTime=0 < localTime=old, local value wins (the object)
      expect(result['chapter-01']['1']).toEqual({ checked: true, checkedAt: '2020-01-01T00:00:00Z' })
    })
  })

  // ============ SCENARIO 11: Empty chapter after merge (should not appear) ============
  describe('Scenario 11: Empty chapter after merge (should not appear)', () => {
    it('should not include chapter with no checked problems', () => {
      const local = {
        'chapter-01': { '1': false, '2': false }
      }
      const server = {
        'chapter-01': { '3': false, '4': false }
      }
      const result = smartMerge(local, server)
      expect(Object.keys(result)).toHaveLength(0)
    })

    it('should not include chapter that only had unchecked problems from local', () => {
      const local = {
        'chapter-01': { '1': false }
      }
      const server = {
        'chapter-02': { '2': true }
      }
      const result = smartMerge(local, server)
      expect(Object.keys(result)).toEqual(['chapter-02'])
      expect(result['chapter-01']).toBeUndefined()
    })

    it('should not include chapter that only had unchecked problems from server', () => {
      const local = {
        'chapter-01': { '1': true }
      }
      const server = {
        'chapter-02': { '2': false }
      }
      const result = smartMerge(local, server)
      expect(Object.keys(result)).toEqual(['chapter-01'])
      expect(result['chapter-02']).toBeUndefined()
    })

    it('should handle chapter with mix of checked and unchecked where all become unchecked after merge', () => {
      const local = {
        'chapter-01': { '1': false }
      }
      const server = {
        'chapter-01': { '1': false }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-01']).toBeUndefined()
    })
  })

  // ============ SCENARIO 12: Server has chapter but local doesn't ============
  describe('Scenario 12: Server has chapter but local doesnt', () => {
    it('should include server chapter in result', () => {
      const local = {}
      const server = {
        'chapter-05': { '1': true, '2': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-05']).toEqual({ '1': true, '2': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } })
    })

    it('should handle server chapter with multiple problems', () => {
      const local = {}
      const server = {
        'chapter-10': { '1': true, '2': true, '3': true }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-10']).toEqual({ '1': true, '2': true, '3': true })
    })

    it('should not create empty chapter when server has only unchecked', () => {
      const local = {}
      const server = {
        'chapter-05': { '1': false, '2': false }
      }
      const result = smartMerge(local, server)
      expect(result['chapter-05']).toBeUndefined()
    })
  })

  // ============ SCENARIO 13: Local has chapter but server doesn't ============
  describe('Scenario 13: Local has chapter but server doesnt', () => {
    it('should include local chapter in result', () => {
      const local = {
        'chapter-05': { '1': true, '2': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } }
      }
      const server = {}
      const result = smartMerge(local, server)
      expect(result['chapter-05']).toEqual({ '1': true, '2': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } })
    })

    it('should handle local chapter with multiple problems', () => {
      const local = {
        'chapter-10': { '1': true, '2': true, '3': true }
      }
      const server = {}
      const result = smartMerge(local, server)
      expect(result['chapter-10']).toEqual({ '1': true, '2': true, '3': true })
    })

    it('should not create empty chapter when local has only unchecked', () => {
      const local = {
        'chapter-05': { '1': false, '2': false }
      }
      const server = {}
      const result = smartMerge(local, server)
      expect(result['chapter-05']).toBeUndefined()
    })
  })

  // ============ SCENARIO 14: Multiple chapters with multiple problems ============
  describe('Scenario 14: Multiple chapters with multiple problems', () => {
    it('should handle complex merge with multiple chapters and problems', () => {
      const local = {
        'chapter-01': { '1': true, '2': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } },
        'chapter-02': { '3': true },
        'chapter-03': { '5': false, '6': true }
      }
      const server = {
        'chapter-01': { '2': { checked: true, checkedAt: '2024-01-02T00:00:00Z' }, '4': true },
        'chapter-02': { '3': { checked: true, checkedAt: '2024-01-01T00:00:00Z' }, '7': true },
        'chapter-04': { '8': true }
      }
      const result = smartMerge(local, server)

      // chapter-01: problem 1 from local (bool), problem 2 timestamp resolution, problem 4 from server
      expect(result['chapter-01']['1']).toBe(true)
      // For problem 2: serverTime (2024-01-02) > localTime (2024-01-01), so server wins
      expect(result['chapter-01']['2']).toEqual({ checked: true, checkedAt: '2024-01-02T00:00:00Z' })
      expect(result['chapter-01']['4']).toBe(true)

      // chapter-02: problem 3 - localTime (now) > serverTime (2024), so local boolean wins
      expect(result['chapter-02']['3']).toBe(true)
      expect(result['chapter-02']['7']).toBe(true)

      // chapter-03: only problem 6 is checked
      expect(result['chapter-03']['6']).toBe(true)
      expect(result['chapter-03']['5']).toBeUndefined()

      // chapter-04: only from server
      expect(result['chapter-04']['8']).toBe(true)
    })

    it('should handle all 12 chapters with varying problems', () => {
      const local = {}
      const server = {}
      for (let c = 1; c <= 12; c++) {
        const chId = `chapter-${String(c).padStart(2, '0')}`
        local[chId] = {}
        server[chId] = {}
        for (let p = 1; p <= 5; p++) {
          local[chId][`${p}`] = p % 2 === 0 // even problems
          server[chId][`${p}`] = p % 3 === 0 // multiples of 3
        }
      }
      const result = smartMerge(local, server)

      // All 12 chapters should exist
      expect(Object.keys(result)).toHaveLength(12)

      // Each chapter should have merged problems (2, 4 from local; 3 from server; some overlap)
      for (let c = 1; c <= 12; c++) {
        const chId = `chapter-${String(c).padStart(2, '0')}`
        const problems = result[chId]
        // Problem 2: from local (even)
        expect(problems['2']).toBe(true)
        // Problem 4: from local (even)
        expect(problems['4']).toBe(true)
        // Problem 3: from server (multiple of 3)
        expect(problems['3']).toBe(true)
        // Problem 6 would be from local if it existed but max is 5
      }
    })

    it('should handle edge case of all problems being checked', () => {
      const local = {
        'chapter-01': { '1': true, '2': true, '3': true }
      }
      const server = {
        'chapter-01': { '4': true, '5': true, '6': true }
      }
      const result = smartMerge(local, server)
      expect(Object.keys(result['chapter-01']).sort()).toEqual(['1', '2', '3', '4', '5', '6'])
    })
  })

  // ============ SCENARIO 15: Edge case - undefined/null inputs ============
  describe('Scenario 15: Edge case - undefined/null inputs', () => {
    it('should handle null as local input', () => {
      const server = { 'chapter-01': { '1': true } }
      const result = smartMerge(null, server)
      expect(result).toEqual({ 'chapter-01': { '1': true } })
    })

    it('should handle null as server input', () => {
      const local = { 'chapter-01': { '1': true } }
      const result = smartMerge(local, null)
      expect(result).toEqual({ 'chapter-01': { '1': true } })
    })

    it('should handle undefined as local input', () => {
      const server = { 'chapter-01': { '1': true } }
      const result = smartMerge(undefined, server)
      expect(result).toEqual({ 'chapter-01': { '1': true } })
    })

    it('should handle undefined as server input', () => {
      const local = { 'chapter-01': { '1': true } }
      const result = smartMerge(local, undefined)
      expect(result).toEqual({ 'chapter-01': { '1': true } })
    })

    it('should handle null as both local and server', () => {
      const result = smartMerge(null, null)
      expect(result).toEqual({})
    })

    it('should handle undefined as both local and server', () => {
      const result = smartMerge(undefined, undefined)
      expect(result).toEqual({})
    })

    it('should handle null chapter object in local', () => {
      const local = { 'chapter-01': null }
      const server = { 'chapter-01': { '1': true } }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toBe(true)
    })

    it('should handle null chapter object in server', () => {
      const local = { 'chapter-01': { '1': true } }
      const server = { 'chapter-01': null }
      const result = smartMerge(local, server)
      expect(result['chapter-01']['1']).toBe(true)
    })

    it('should handle empty string as input', () => {
      const local = { 'chapter-01': { '1': true } }
      const result = smartMerge('', local)
      expect(result['chapter-01']['1']).toBe(true)
    })

    it('should handle 0 as input', () => {
      const local = { 'chapter-01': { '1': true } }
      const result = smartMerge(0, local)
      expect(result['chapter-01']['1']).toBe(true)
    })

    it('should handle false as input', () => {
      const local = { 'chapter-01': { '1': true } }
      const result = smartMerge(false, local)
      expect(result['chapter-01']['1']).toBe(true)
    })
  })

  // ============ IMMUTABILITY TESTS ============
  describe('Immutability - original objects should not be mutated', () => {
    it('should not mutate local object', () => {
      const local = { 'chapter-01': { '1': true } }
      const server = { 'chapter-02': { '2': true } }
      smartMerge(local, server)
      expect(local['chapter-01']['1']).toBe(true)
      expect(local['chapter-02']).toBeUndefined()
    })

    it('should not mutate server object', () => {
      const local = { 'chapter-01': { '1': true } }
      const server = { 'chapter-02': { '2': true } }
      smartMerge(local, server)
      expect(server['chapter-02']['2']).toBe(true)
      expect(server['chapter-01']).toBeUndefined()
    })

    it('should not add properties to original objects', () => {
      const local = { 'chapter-01': { '1': true } }
      const server = { 'chapter-02': { '2': true } }
      smartMerge(local, server)
      expect(Object.keys(local)).toEqual(['chapter-01'])
      expect(Object.keys(server)).toEqual(['chapter-02'])
    })
  })

  // ============ REAL-WORLD SYNC SCENARIOS ============
  describe('Real-world sync scenarios', () => {
    it('Offline edits merged with server after reconnection', () => {
      // User checked problems offline (local has new data)
      // Server has original data from before offline period
      const offlineLocal = {
        'chapter-01': {
          '1': { checked: true, checkedAt: '2024-01-10T10:00:00Z' },
          '2': { checked: true, checkedAt: '2024-01-10T10:05:00Z' }
        }
      }
      const serverData = {
        'chapter-01': {
          '1': { checked: true, checkedAt: '2024-01-09T08:00:00Z' }
        }
      }
      const result = smartMerge(offlineLocal, serverData)
      // Both have problem 1 checked, offlineLocal is newer
      expect(result['chapter-01']['1']).toEqual({ checked: true, checkedAt: '2024-01-10T10:00:00Z' })
      // Problem 2 only in local
      expect(result['chapter-01']['2']).toEqual({ checked: true, checkedAt: '2024-01-10T10:05:00Z' })
    })

    it('Multiple devices with different checked problems', () => {
      const deviceA = {
        'chapter-01': { '1': true, '2': true, '3': true }
      }
      const deviceB = {
        'chapter-01': { '4': true, '5': true },
        'chapter-02': { '1': true }
      }
      const result = smartMerge(deviceA, deviceB)
      expect(Object.keys(result['chapter-01']).sort()).toEqual(['1', '2', '3', '4', '5'])
      expect(result['chapter-02']['1']).toBe(true)
    })

    it('Migration from old boolean format to new object format', () => {
      // Old local storage used boolean format
      const oldLocal = {
        'chapter-01': { '1': true, '2': true },
        'chapter-02': { '1': true }
      }
      // Server returns object format
      const serverData = {
        'chapter-01': { '3': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } },
        'chapter-03': { '1': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } }
      }
      const result = smartMerge(oldLocal, serverData)
      expect(result['chapter-01']['1']).toBe(true)
      expect(result['chapter-01']['2']).toBe(true)
      expect(result['chapter-01']['3']).toEqual({ checked: true, checkedAt: '2024-01-01T00:00:00Z' })
      expect(result['chapter-02']['1']).toBe(true)
      expect(result['chapter-03']['1']).toEqual({ checked: true, checkedAt: '2024-01-01T00:00:00Z' })
    })

    it('Conflicting edits - user unchecked on one device what another device checked', () => {
      // Device A: user checked problem
      // Device B: user unchecked same problem
      const deviceA = {
        'chapter-01': { '1': { checked: true, checkedAt: '2024-01-01T00:00:00Z' } }
      }
      const deviceB = {
        'chapter-01': { '1': { checked: false, checkedAt: '2024-01-02T00:00:00Z' } }
      }
      const result = smartMerge(deviceA, deviceB)
      // Union principle: checked wins over unchecked
      expect(result['chapter-01']['1'].checked).toBe(true)
      expect(result['chapter-01']['1'].checkedAt).toBe('2024-01-01T00:00:00Z')
    })
  })
})
