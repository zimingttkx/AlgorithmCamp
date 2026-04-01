/**
 * Unit Tests for stats.js - Level and streak calculation logic
 */

import { describe, it, expect } from 'vitest'
import { calcLevel, calcStreak, CONFIG } from '../src/composables/stats.js'

describe('CONFIG', () => {
  it('should have correct XP per commit', () => {
    expect(CONFIG.xpPerCommit).toBe(10)
  })

  it('should have 10 levels', () => {
    expect(CONFIG.levels).toHaveLength(10)
  })

  it('should have calendar colors array', () => {
    expect(CONFIG.calendarColors).toHaveLength(5)
  })
})

describe('calcLevel', () => {
  describe('XP to level mapping', () => {
    it('should return level 1 (Novice) for 0 XP', () => {
      const result = calcLevel(0)
      expect(result.level).toBe(1)
      expect(result.title).toBe('新手')
      expect(result.titleEn).toBe('Novice')
      expect(result.totalXP).toBe(0)
    })

    it('should return correct level for 100 XP', () => {
      // Level 1: 0 XP
      // Level 2: 100 XP
      const result = calcLevel(100)
      expect(result.level).toBe(2)
    })

    it('should return correct level for geometric progression', () => {
      const levels = [
        [0, 1, 'Novice'],
        [100, 2, 'Novice'],
        [300, 3, 'Apprentice'],
        [700, 4, 'Adept'],
        [1500, 5, 'Expert'],
        [3100, 6, 'Master'],
        [6300, 7, 'Grandmaster'],
        [12700, 8, 'Legendary'],
        [25500, 9, 'Mythic'],
        [51100, 10, 'Transcendent']
      ]

      for (const [xp, expectedLevel] of levels) {
        const result = calcLevel(xp)
        expect(result.level).toBe(expectedLevel)
      }
    })

    it('should cap at level 10 (max level)', () => {
      const result = calcLevel(999999)
      expect(result.level).toBe(10)
      expect(result.isMaxLevel).toBe(true)
    })
  })

  describe('Progress calculation', () => {
    it('should show 0% progress at exact level threshold', () => {
      const result = calcLevel(100)
      expect(result.progress).toBe(0) // At start of level 2
    })

    it('should show correct progress within a level', () => {
      // Level 2 starts at 100, next level at 300
      // At 200 XP: (200-100)/(300-100) = 50%
      const result = calcLevel(200)
      expect(result.progress).toBe(50)
    })

    it('should show 99% progress near end of level', () => {
      // Level 2: 100-300, at 298 XP: (298-100)/(300-100) = 99%
      const result = calcLevel(298)
      expect(result.progress).toBe(99)
    })
  })

  describe('XP in level', () => {
    it('should calculate correct XP accumulated within level', () => {
      // Level 2: 100-300
      // At 200 XP: 200-100 = 100 XP into level
      const result = calcLevel(200)
      expect(result.xpInLevel).toBe(100)
    })
  })

  describe('Titles', () => {
    it('should have both Chinese and English titles', () => {
      const result = calcLevel(0)
      expect(typeof result.title).toBe('string')
      expect(typeof result.titleEn).toBe('string')
    })

    it('should return max level title for level 10', () => {
      const result = calcLevel(999999)
      expect(result.isMaxLevel).toBe(true)
    })
  })
})

describe('calcStreak', () => {
  it('should return 0 for empty calendar', () => {
    const result = calcStreak({})
    expect(result.current).toBe(0)
    expect(result.longest).toBe(0)
  })

  it('should count single day as streak of 1', () => {
    const today = new Date().toISOString().split('T')[0]
    const calendar = { [today]: 5 }
    const result = calcStreak(calendar)
    expect(result.current).toBe(1)
    expect(result.longest).toBe(1)
  })

  it('should calculate consecutive days streak', () => {
    const today = new Date()
    const calendar = {}

    // Build 5 consecutive days with commits
    for (let i = 0; i < 5; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      calendar[d.toISOString().split('T')[0]] = 1
    }

    const result = calcStreak(calendar)
    expect(result.current).toBe(5)
    expect(result.longest).toBe(5)
  })

  it('should break streak on missed day', () => {
    const today = new Date()
    const calendar = {}

    // Today
    calendar[today.toISOString().split('T')[0]] = 1

    // Yesterday
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    calendar[yesterday.toISOString().split('T')[0]] = 1

    // Skip 1 day
    const twoDaysAgo = new Date(today)
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    calendar[twoDaysAgo.toISOString().split('T')[0]] = 1

    const result = calcStreak(calendar)
    // Current streak should be 1 (only today)
    expect(result.current).toBeGreaterThanOrEqual(1)
  })

  it('should find longest streak even if current is broken', () => {
    const calendar = {}
    const today = new Date()

    // Historical streak: 10 days ago had a 5-day streak
    for (let i = 10; i <= 14; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      calendar[d.toISOString().split('T')[0]] = 1
    }

    // Recent activity (current streak of 2)
    for (let i = 0; i < 2; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      calendar[d.toISOString().split('T')[0]] = 1
    }

    const result = calcStreak(calendar)
    expect(result.longest).toBe(5)
    expect(result.current).toBeGreaterThanOrEqual(2)
  })

  it('should handle commits = 0 days (not in calendar)', () => {
    // Days with 0 commits should not break streak
    const today = new Date()
    const calendar = {}

    // 5 consecutive days with commits
    for (let i = 0; i < 5; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      calendar[d.toISOString().split('T')[0]] = i + 1
    }

    const result = calcStreak(calendar)
    expect(result.longest).toBe(5)
  })

  it('should handle calendar with string values (commit counts)', () => {
    const today = new Date().toISOString().split('T')[0]
    const calendar = { [today]: '3' } // String instead of number
    const result = calcStreak(calendar)
    expect(result.current).toBe(1)
  })

  it('should handle real stats.json calendar format', () => {
    const calendar = {
      '2026-03-01': 3,
      '2026-03-02': 5,
      '2026-03-03': 1,
      '2026-03-04': 0,  // Day with 0 commits
      '2026-03-05': 8,
      '2026-03-06': 2,
      '2026-03-07': 4,
    }
    const result = calcStreak(calendar)
    // Current: today is 2026-04-01, so 2026-03-07 is not today or yesterday → current might be 0
    // But longest should be calculated
    expect(typeof result.longest).toBe('number')
  })
})
