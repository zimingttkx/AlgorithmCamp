/**
 * Comprehensive Unit Tests for stats.js composable
 * Tests CONFIG, calcLevel, calcStreak, getCalendarWeeks, getCommitColor
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Date before importing the module
const mockDate = new Date('2026-04-02T12:00:00')
const mockDateNow = vi.fn(() => mockDate.getTime())
vi.stubGlobal('Date', class extends Date {
  constructor(...args) {
    if (args.length === 0) {
      return mockDate
    }
    return super(...args)
  }
  static now() {
    return mockDateNow()
  }
})

// Import after mocking
const { CONFIG, calcLevel, calcStreak, getCalendarWeeks, getCommitColor } = await import('../../src/composables/stats.js')

describe('stats.js composable', () => {
  // Helper to format date as YYYY-MM-DD
  const toDateStr = (d) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  // Helper to subtract days from a date
  const subtractDays = (date, days) => {
    const d = new Date(date)
    d.setDate(d.getDate() - days)
    return d
  }

  describe('CONFIG', () => {
    it('should have correct githubUser', () => {
      expect(CONFIG.githubUser).toBe('zimingttkx')
    })

    it('should have correct xpPerCommit', () => {
      expect(CONFIG.xpPerCommit).toBe(10)
    })

    it('should have correct statsFile', () => {
      expect(CONFIG.statsFile).toBe('stats.json')
    })

    it('should have correct cacheTTL (30 minutes)', () => {
      expect(CONFIG.cacheTTL).toBe(30 * 60 * 1000)
    })

    it('should have exactly 10 levels', () => {
      expect(CONFIG.levels).toHaveLength(10)
    })

    it('should have correct level 1 (Novice) properties', () => {
      const level = CONFIG.levels[0]
      expect(level.level).toBe(1)
      expect(level.title).toBe('新手')
      expect(level.titleEn).toBe('Novice')
      expect(level.xpRequired).toBe(0)
      expect(level.icon).toBe('☆')
    })

    it('should have correct level 2 (Apprentice) properties', () => {
      const level = CONFIG.levels[1]
      expect(level.level).toBe(2)
      expect(level.title).toBe('学徒')
      expect(level.titleEn).toBe('Apprentice')
      expect(level.xpRequired).toBe(100)
      expect(level.icon).toBe('★')
    })

    it('should have correct level 3 (Coder) properties', () => {
      const level = CONFIG.levels[2]
      expect(level.level).toBe(3)
      expect(level.title).toBe('码农')
      expect(level.titleEn).toBe('Coder')
      expect(level.xpRequired).toBe(300)
      expect(level.icon).toBe('★')
    })

    it('should have correct level 4 (Developer) properties', () => {
      const level = CONFIG.levels[3]
      expect(level.level).toBe(4)
      expect(level.title).toBe('开发者')
      expect(level.titleEn).toBe('Developer')
      expect(level.xpRequired).toBe(700)
      expect(level.icon).toBe('★★')
    })

    it('should have correct level 5 (Engineer) properties', () => {
      const level = CONFIG.levels[4]
      expect(level.level).toBe(5)
      expect(level.title).toBe('工程师')
      expect(level.titleEn).toBe('Engineer')
      expect(level.xpRequired).toBe(1500)
      expect(level.icon).toBe('★★')
    })

    it('should have correct level 6 properties', () => {
      const level = CONFIG.levels[5]
      expect(level.level).toBe(6)
      expect(level.title).toBe('⚒')
      expect(level.titleEn).toBe('⚒')
      expect(level.xpRequired).toBe(3000)
      expect(level.icon).toBe('★★★')
    })

    it('should have correct level 7 (Expert) properties', () => {
      const level = CONFIG.levels[6]
      expect(level.level).toBe(7)
      expect(level.title).toBe('专家')
      expect(level.titleEn).toBe('Expert')
      expect(level.xpRequired).toBe(6000)
      expect(level.icon).toBe('★★★')
    })

    it('should have correct level 8 (Master) properties', () => {
      const level = CONFIG.levels[7]
      expect(level.level).toBe(8)
      expect(level.title).toBe('大师')
      expect(level.titleEn).toBe('Master')
      expect(level.xpRequired).toBe(10000)
      expect(level.icon).toBe('★★★★')
    })

    it('should have correct level 9 (Grandmaster) properties', () => {
      const level = CONFIG.levels[8]
      expect(level.level).toBe(9)
      expect(level.title).toBe('宗师')
      expect(level.titleEn).toBe('Grandmaster')
      expect(level.xpRequired).toBe(20000)
      expect(level.icon).toBe('★★★★')
    })

    it('should have correct level 10 (Legend) properties', () => {
      const level = CONFIG.levels[9]
      expect(level.level).toBe(10)
      expect(level.title).toBe('传奇')
      expect(level.titleEn).toBe('Legend')
      expect(level.xpRequired).toBe(50000)
      expect(level.icon).toBe('★★★★★')
    })

    it('should have strictly ascending xpRequired values', () => {
      for (let i = 1; i < CONFIG.levels.length; i++) {
        expect(CONFIG.levels[i].xpRequired).toBeGreaterThan(CONFIG.levels[i - 1].xpRequired)
      }
    })

    it('should have exactly 5 calendarColors', () => {
      expect(CONFIG.calendarColors).toHaveLength(5)
    })

    it('should have correct calendarColors values', () => {
      expect(CONFIG.calendarColors[0]).toBe('var(--bg-panel)')
      expect(CONFIG.calendarColors[1]).toBe('#0c4a6e')
      expect(CONFIG.calendarColors[2]).toBe('#0369a1')
      expect(CONFIG.calendarColors[3]).toBe('#0284c7')
      expect(CONFIG.calendarColors[4]).toBe('#0EA5E9')
    })

    it('should have streakBonus with correct tier values', () => {
      expect(CONFIG.streakBonus[7]).toBe(1.2)
      expect(CONFIG.streakBonus[30]).toBe(1.5)
      expect(CONFIG.streakBonus[100]).toBe(2.0)
    })

    it('streakBonus should have multipliers greater than 1', () => {
      expect(CONFIG.streakBonus[7]).toBeGreaterThan(1)
      expect(CONFIG.streakBonus[30]).toBeGreaterThan(1)
      expect(CONFIG.streakBonus[100]).toBeGreaterThan(1)
    })

    it('streakBonus 100-day multiplier should be greater than 30-day', () => {
      expect(CONFIG.streakBonus[100]).toBeGreaterThan(CONFIG.streakBonus[30])
    })
  })

  describe('calcLevel(totalXP)', () => {
    describe('Level 1 (Novice) - xpRequired: 0', () => {
      it('should return level 1 for 0 XP', () => {
        const result = calcLevel(0)
        expect(result.level).toBe(1)
        expect(result.title).toBe('新手')
        expect(result.titleEn).toBe('Novice')
        expect(result.icon).toBe('☆')
        expect(result.totalXP).toBe(0)
        expect(result.currentLevelXP).toBe(0)
        expect(result.nextLevelXP).toBe(100)
        expect(result.xpInLevel).toBe(0)
        expect(result.xpNeeded).toBe(100)
        expect(result.progress).toBe(0)
        expect(result.isMaxLevel).toBe(false)
      })

      it('should return level 1 for XP between 1-99', () => {
        expect(calcLevel(1).level).toBe(1)
        expect(calcLevel(50).level).toBe(1)
        expect(calcLevel(99).level).toBe(1)
      })

      it('should show 99% progress at 99 XP', () => {
        const result = calcLevel(99)
        expect(result.progress).toBe(99)
        expect(result.xpInLevel).toBe(99)
      })
    })

    describe('Level 2 (Apprentice) - xpRequired: 100', () => {
      it('should return level 2 at exactly 100 XP', () => {
        const result = calcLevel(100)
        expect(result.level).toBe(2)
        expect(result.title).toBe('学徒')
        expect(result.titleEn).toBe('Apprentice')
        expect(result.icon).toBe('★')
        expect(result.totalXP).toBe(100)
        expect(result.currentLevelXP).toBe(100)
        expect(result.nextLevelXP).toBe(300)
        expect(result.xpInLevel).toBe(0)
        expect(result.xpNeeded).toBe(200)
        expect(result.progress).toBe(0)
        expect(result.isMaxLevel).toBe(false)
      })

      it('should return level 2 for XP between 101-299', () => {
        expect(calcLevel(101).level).toBe(2)
        expect(calcLevel(200).level).toBe(2)
        expect(calcLevel(299).level).toBe(2)
      })

      it('should show 50% progress at 200 XP', () => {
        const result = calcLevel(200)
        expect(result.progress).toBe(50)
        expect(result.xpInLevel).toBe(100)
        expect(result.xpNeeded).toBe(200)
      })
    })

    describe('Level 3 (Coder) - xpRequired: 300', () => {
      it('should return level 3 at exactly 300 XP', () => {
        const result = calcLevel(300)
        expect(result.level).toBe(3)
        expect(result.title).toBe('码农')
        expect(result.titleEn).toBe('Coder')
        expect(result.currentLevelXP).toBe(300)
        expect(result.nextLevelXP).toBe(700)
        expect(result.progress).toBe(0)
      })

      it('should return level 3 for XP between 301-699', () => {
        expect(calcLevel(301).level).toBe(3)
        expect(calcLevel(500).level).toBe(3)
        expect(calcLevel(699).level).toBe(3)
      })
    })

    describe('Level 4 (Developer) - xpRequired: 700', () => {
      it('should return level 4 at exactly 700 XP', () => {
        const result = calcLevel(700)
        expect(result.level).toBe(4)
        expect(result.title).toBe('开发者')
        expect(result.titleEn).toBe('Developer')
        expect(result.icon).toBe('★★')
        expect(result.currentLevelXP).toBe(700)
        expect(result.nextLevelXP).toBe(1500)
      })

      it('should return level 4 for XP between 701-1499', () => {
        expect(calcLevel(701).level).toBe(4)
        expect(calcLevel(1000).level).toBe(4)
        expect(calcLevel(1499).level).toBe(4)
      })
    })

    describe('Level 5 (Engineer) - xpRequired: 1500', () => {
      it('should return level 5 at exactly 1500 XP', () => {
        const result = calcLevel(1500)
        expect(result.level).toBe(5)
        expect(result.title).toBe('工程师')
        expect(result.titleEn).toBe('Engineer')
        expect(result.currentLevelXP).toBe(1500)
        expect(result.nextLevelXP).toBe(3000)
      })

      it('should return level 5 for XP between 1501-2999', () => {
        expect(calcLevel(1501).level).toBe(5)
        expect(calcLevel(2000).level).toBe(5)
        expect(calcLevel(2999).level).toBe(5)
      })
    })

    describe('Level 6 - xpRequired: 3000', () => {
      it('should return level 6 at exactly 3000 XP', () => {
        const result = calcLevel(3000)
        expect(result.level).toBe(6)
        expect(result.title).toBe('⚒')
        expect(result.titleEn).toBe('⚒')
        expect(result.icon).toBe('★★★')
        expect(result.currentLevelXP).toBe(3000)
        expect(result.nextLevelXP).toBe(6000)
      })

      it('should return level 6 for XP between 3001-5999', () => {
        expect(calcLevel(3001).level).toBe(6)
        expect(calcLevel(5000).level).toBe(6)
        expect(calcLevel(5999).level).toBe(6)
      })
    })

    describe('Level 7 (Expert) - xpRequired: 6000', () => {
      it('should return level 7 at exactly 6000 XP', () => {
        const result = calcLevel(6000)
        expect(result.level).toBe(7)
        expect(result.title).toBe('专家')
        expect(result.titleEn).toBe('Expert')
        expect(result.icon).toBe('★★★')
        expect(result.currentLevelXP).toBe(6000)
        expect(result.nextLevelXP).toBe(10000)
      })

      it('should return level 7 for XP between 6001-9999', () => {
        expect(calcLevel(6001).level).toBe(7)
        expect(calcLevel(8000).level).toBe(7)
        expect(calcLevel(9999).level).toBe(7)
      })
    })

    describe('Level 8 (Master) - xpRequired: 10000', () => {
      it('should return level 8 at exactly 10000 XP', () => {
        const result = calcLevel(10000)
        expect(result.level).toBe(8)
        expect(result.title).toBe('大师')
        expect(result.titleEn).toBe('Master')
        expect(result.icon).toBe('★★★★')
        expect(result.currentLevelXP).toBe(10000)
        expect(result.nextLevelXP).toBe(20000)
      })

      it('should return level 8 for XP between 10001-19999', () => {
        expect(calcLevel(10001).level).toBe(8)
        expect(calcLevel(15000).level).toBe(8)
        expect(calcLevel(19999).level).toBe(8)
      })
    })

    describe('Level 9 (Grandmaster) - xpRequired: 20000', () => {
      it('should return level 9 at exactly 20000 XP', () => {
        const result = calcLevel(20000)
        expect(result.level).toBe(9)
        expect(result.title).toBe('宗师')
        expect(result.titleEn).toBe('Grandmaster')
        expect(result.icon).toBe('★★★★')
        expect(result.currentLevelXP).toBe(20000)
        expect(result.nextLevelXP).toBe(50000)
      })

      it('should return level 9 for XP between 20001-49999', () => {
        expect(calcLevel(20001).level).toBe(9)
        expect(calcLevel(30000).level).toBe(9)
        expect(calcLevel(49999).level).toBe(9)
      })
    })

    describe('Level 10 (Legend) - xpRequired: 50000 (MAX LEVEL)', () => {
      it('should return level 10 at exactly 50000 XP', () => {
        const result = calcLevel(50000)
        expect(result.level).toBe(10)
        expect(result.title).toBe('传奇')
        expect(result.titleEn).toBe('Legend')
        expect(result.icon).toBe('★★★★★')
        expect(result.totalXP).toBe(50000)
        expect(result.currentLevelXP).toBe(50000)
        expect(result.nextLevelXP).toBe(50000)
        expect(result.xpInLevel).toBe(0)
        expect(result.xpNeeded).toBe(0)
        expect(result.progress).toBe(100)
        expect(result.isMaxLevel).toBe(true)
      })

      it('should return level 10 for XP above 50000', () => {
        const result = calcLevel(100000)
        expect(result.level).toBe(10)
        expect(result.isMaxLevel).toBe(true)
        expect(result.progress).toBe(100)
        expect(result.nextLevelXP).toBe(50000)
      })

      it('should cap xpNeeded at 0 for max level', () => {
        const result = calcLevel(999999)
        expect(result.xpNeeded).toBe(0)
      })
    })

    describe('Boundary cases', () => {
      it('should return correct level at all level boundaries', () => {
        expect(calcLevel(0).level).toBe(1)
        expect(calcLevel(100).level).toBe(2)
        expect(calcLevel(300).level).toBe(3)
        expect(calcLevel(700).level).toBe(4)
        expect(calcLevel(1500).level).toBe(5)
        expect(calcLevel(3000).level).toBe(6)
        expect(calcLevel(6000).level).toBe(7)
        expect(calcLevel(10000).level).toBe(8)
        expect(calcLevel(20000).level).toBe(9)
        expect(calcLevel(50000).level).toBe(10)
      })

      it('should calculate progress correctly at all boundaries', () => {
        expect(calcLevel(0).progress).toBe(0)
        expect(calcLevel(100).progress).toBe(0)
        expect(calcLevel(300).progress).toBe(0)
        expect(calcLevel(700).progress).toBe(0)
        expect(calcLevel(1500).progress).toBe(0)
        expect(calcLevel(3000).progress).toBe(0)
        expect(calcLevel(6000).progress).toBe(0)
        expect(calcLevel(10000).progress).toBe(0)
        expect(calcLevel(20000).progress).toBe(0)
        expect(calcLevel(50000).progress).toBe(100)
      })

      it('should handle fractional progress correctly', () => {
        // Level 2: 100-300, at 150 XP → (150-100)/(300-100) = 25%
        const result = calcLevel(150)
        expect(result.progress).toBe(25)
      })
    })

    describe('Edge cases', () => {
      it('should handle negative XP', () => {
        const result = calcLevel(-100)
        expect(result.level).toBe(1)
        expect(result.totalXP).toBe(-100)
      })

      it('should handle very large XP values', () => {
        const result = calcLevel(Number.MAX_SAFE_INTEGER)
        expect(result.level).toBe(10)
        expect(result.isMaxLevel).toBe(true)
      })
    })
  })

  describe('calcStreak(calendar)', () => {
    // Reset date mock before each test
    beforeEach(() => {
      mockDateNow.mockReturnValue(mockDate.getTime())
    })

    it('should return { current: 0, longest: 0 } for null calendar', () => {
      expect(calcStreak(null)).toEqual({ current: 0, longest: 0 })
    })

    it('should return { current: 0, longest: 0 } for undefined calendar', () => {
      expect(calcStreak(undefined)).toEqual({ current: 0, longest: 0 })
    })

    it('should return { current: 0, longest: 0 } for empty calendar', () => {
      expect(calcStreak({})).toEqual({ current: 0, longest: 0 })
    })

    it('should return { current: 1, longest: 1 } for today with commit', () => {
      const today = new Date('2026-04-02')
      today.setHours(0, 0, 0, 0)
      const todayStr = toDateStr(today)
      const calendar = { [todayStr]: 1 }
      expect(calcStreak(calendar)).toEqual({ current: 1, longest: 1 })
    })

    it('should return { current: 1, longest: 1 } for today with multiple commits', () => {
      const today = new Date('2026-04-02')
      today.setHours(0, 0, 0, 0)
      const todayStr = toDateStr(today)
      const calendar = { [todayStr]: 5 }
      expect(calcStreak(calendar)).toEqual({ current: 1, longest: 1 })
    })

    it('should return { current: 0, longest: 0 } for today with 0 commits', () => {
      const today = new Date('2026-04-02')
      today.setHours(0, 0, 0, 0)
      const todayStr = toDateStr(today)
      const calendar = { [todayStr]: 0 }
      expect(calcStreak(calendar)).toEqual({ current: 0, longest: 0 })
    })

    it('should return { current: 0, longest: 0 } for today with no entry', () => {
      const today = new Date('2026-04-02')
      today.setHours(0, 0, 0, 0)
      const todayStr = toDateStr(today)
      const calendar = { [todayStr]: undefined }
      expect(calcStreak(calendar)).toEqual({ current: 0, longest: 0 })
    })

    it('should calculate consecutive streak from today going backwards', () => {
      const today = new Date('2026-04-02')
      today.setHours(0, 0, 0, 0)
      const yesterday = subtractDays(today, 1)
      const twoDaysAgo = subtractDays(today, 2)
      const calendar = {
        [toDateStr(today)]: 1,
        [toDateStr(yesterday)]: 1,
        [toDateStr(twoDaysAgo)]: 1
      }
      expect(calcStreak(calendar)).toEqual({ current: 3, longest: 3 })
    })

    it('should count streak from yesterday when today has no commits', () => {
      const today = new Date('2026-04-02')
      today.setHours(0, 0, 0, 0)
      const yesterday = subtractDays(today, 1)
      const twoDaysAgo = subtractDays(today, 2)
      const calendar = {
        [toDateStr(today)]: 0,
        [toDateStr(yesterday)]: 1,
        [toDateStr(twoDaysAgo)]: 1
      }
      expect(calcStreak(calendar)).toEqual({ current: 2, longest: 2 })
    })

    it('should break current streak when gap found', () => {
      const today = new Date('2026-04-02')
      today.setHours(0, 0, 0, 0)
      const yesterday = subtractDays(today, 1)
      const twoDaysAgo = subtractDays(today, 2)
      const fourDaysAgo = subtractDays(today, 4)
      const calendar = {
        [toDateStr(today)]: 1,
        [toDateStr(yesterday)]: 1,
        [toDateStr(twoDaysAgo)]: 0, // gap
        [toDateStr(fourDaysAgo)]: 1
      }
      const result = calcStreak(calendar)
      expect(result.current).toBe(2)
      expect(result.longest).toBe(2)
    })

    it('should find longest streak correctly with gaps', () => {
      const today = new Date('2026-04-02')
      today.setHours(0, 0, 0, 0)
      // First streak: 4 days (today, yesterday, 2 days ago, 3 days ago)
      const d1 = subtractDays(today, 1)
      const d2 = subtractDays(today, 2)
      const d3 = subtractDays(today, 3)
      // Gap at d4
      const d5 = subtractDays(today, 5)
      const d6 = subtractDays(today, 6)
      const d7 = subtractDays(today, 7)
      const calendar = {
        [toDateStr(today)]: 1,
        [toDateStr(d1)]: 1,
        [toDateStr(d2)]: 1,
        [toDateStr(d3)]: 1,
        [toDateStr(d5)]: 1,
        [toDateStr(d6)]: 1,
        [toDateStr(d7)]: 1
      }
      const result = calcStreak(calendar)
      expect(result.current).toBe(4)
      expect(result.longest).toBe(4)
    })

    it('should handle longest streak not being current streak', () => {
      const today = new Date('2026-04-02')
      today.setHours(0, 0, 0, 0)
      const calendar = {}
      // Historical streak of 5 days (12-16 days ago)
      for (let i = 12; i <= 16; i++) {
        const d = subtractDays(today, i)
        calendar[toDateStr(d)] = 1
      }
      // Current streak of 2 days
      for (let i = 0; i < 2; i++) {
        const d = subtractDays(today, i)
        calendar[toDateStr(d)] = 1
      }
      const result = calcStreak(calendar)
      expect(result.longest).toBe(5)
      expect(result.current).toBe(2)
    })

    it('should ignore days with falsy (0) count in streak calculation', () => {
      const today = new Date('2026-04-02')
      today.setHours(0, 0, 0, 0)
      const d1 = subtractDays(today, 1)
      const d2 = subtractDays(today, 2)
      const d4 = subtractDays(today, 4)
      const calendar = {
        [toDateStr(today)]: 1,
        [toDateStr(d1)]: 1,
        [toDateStr(d2)]: 0, // 0 commits - should break streak
        [toDateStr(d4)]: 1  // isolated, not consecutive
      }
      const result = calcStreak(calendar)
      expect(result.current).toBe(2)
      expect(result.longest).toBe(2)
    })

    it('should treat negative counts as falsy', () => {
      const today = new Date('2026-04-02')
      today.setHours(0, 0, 0, 0)
      const yesterday = subtractDays(today, 1)
      const calendar = {
        [toDateStr(today)]: 1,
        [toDateStr(yesterday)]: -5
      }
      const result = calcStreak(calendar)
      expect(result.current).toBe(1)
    })

    it('should handle dates in non-sequential order in calendar object', () => {
      const today = new Date('2026-04-02')
      today.setHours(0, 0, 0, 0)
      const d1 = subtractDays(today, 1)
      const d2 = subtractDays(today, 2)
      // Add in reverse order
      const calendar = {
        [toDateStr(d2)]: 1,
        [toDateStr(d1)]: 1,
        [toDateStr(today)]: 1
      }
      expect(calcStreak(calendar)).toEqual({ current: 3, longest: 3 })
    })

    it('should handle very large commit counts', () => {
      const today = new Date('2026-04-02')
      today.setHours(0, 0, 0, 0)
      const yesterday = subtractDays(today, 1)
      const calendar = {
        [toDateStr(today)]: 1000,
        [toDateStr(yesterday)]: 999
      }
      expect(calcStreak(calendar)).toEqual({ current: 2, longest: 2 })
    })
  })

  describe('getCalendarWeeks(calendar)', () => {
    it('should return approximately 53 weeks', () => {
      const result = getCalendarWeeks({})
      expect(result.length).toBeGreaterThanOrEqual(52)
      expect(result.length).toBeLessThanOrEqual(54)
    })

    it('should return weeks structure for empty calendar', () => {
      const result = getCalendarWeeks({})
      expect(Array.isArray(result)).toBe(true)
      result.forEach(week => {
        expect(Array.isArray(week)).toBe(true)
      })
    })

    it('should return weeks structure for null calendar', () => {
      const result = getCalendarWeeks(null)
      expect(Array.isArray(result)).toBe(true)
    })

    it('should return weeks structure for undefined calendar', () => {
      const result = getCalendarWeeks(undefined)
      expect(Array.isArray(result)).toBe(true)
    })

    it('should contain weeks with 7 days each (for full weeks)', () => {
      const result = getCalendarWeeks({})
      const fullWeeks = result.filter(week => week.length === 7)
      expect(fullWeeks.length).toBeGreaterThan(0)
    })

    it('should have dayOfWeek values from 0 (Sunday) to 6 (Saturday)', () => {
      const result = getCalendarWeeks({})
      const allDays = result.flat()
      const dayOfWeekValues = new Set(allDays.map(d => d.dayOfWeek))
      expect(dayOfWeekValues.has(0)).toBe(true)
      expect(dayOfWeekValues.has(6)).toBe(true)
      expect(dayOfWeekValues.size).toBeLessThanOrEqual(7)
    })

    it('should have dates in YYYY-MM-DD format', () => {
      const result = getCalendarWeeks({})
      const allDays = result.flat()
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      allDays.forEach(day => {
        expect(day.date).toMatch(dateRegex)
      })
    })

    it('should return 0 count for dates not in calendar', () => {
      const result = getCalendarWeeks({})
      const allDays = result.flat()
      const zeroDays = allDays.filter(d => d.count === 0)
      expect(zeroDays.length).toBeGreaterThan(0)
    })

    it('should return correct count for dates in calendar', () => {
      const today = new Date('2026-04-02')
      today.setHours(0, 0, 0, 0)
      const todayStr = toDateStr(today)
      const calendar = { [todayStr]: 5 }
      const result = getCalendarWeeks(calendar)
      const allDays = result.flat()
      const todayEntry = allDays.find(d => d.date === todayStr)
      expect(todayEntry.count).toBe(5)
    })

    it('should have count as number type', () => {
      const result = getCalendarWeeks({})
      const allDays = result.flat()
      allDays.forEach(day => {
        expect(typeof day.count).toBe('number')
      })
    })

    it('should have dayOfWeek as number 0-6', () => {
      const result = getCalendarWeeks({})
      const allDays = result.flat()
      allDays.forEach(day => {
        expect(day.dayOfWeek).toBeGreaterThanOrEqual(0)
        expect(day.dayOfWeek).toBeLessThanOrEqual(6)
      })
    })

    it('should handle full year of calendar data', () => {
      const calendar = {}
      const today = new Date('2026-04-02')
      today.setHours(0, 0, 0, 0)
      for (let i = 0; i < 365; i++) {
        const d = subtractDays(today, i)
        calendar[toDateStr(d)] = i % 10
      }
      const result = getCalendarWeeks(calendar)
      expect(result.length).toBeGreaterThanOrEqual(52)
    })

    it('should handle calendar with all zeros', () => {
      const calendar = {}
      const today = new Date('2026-04-02')
      today.setHours(0, 0, 0, 0)
      for (let i = 0; i < 100; i++) {
        const d = subtractDays(today, i)
        calendar[toDateStr(d)] = 0
      }
      const result = getCalendarWeeks(calendar)
      const allDays = result.flat()
      allDays.forEach(day => {
        expect(day.count).toBe(0)
      })
    })
  })

  describe('getCommitColor(count)', () => {
    it('should return first color (bg-panel) for 0 commits', () => {
      expect(getCommitColor(0)).toBe('var(--bg-panel)')
    })

    it('should return second color (#0c4a6e) for 1 commit', () => {
      expect(getCommitColor(1)).toBe('#0c4a6e')
    })

    it('should return second color (#0c4a6e) for 2 commits', () => {
      expect(getCommitColor(2)).toBe('#0c4a6e')
    })

    it('should return third color (#0369a1) for 3 commits', () => {
      expect(getCommitColor(3)).toBe('#0369a1')
    })

    it('should return third color (#0369a1) for 4 commits', () => {
      expect(getCommitColor(4)).toBe('#0369a1')
    })

    it('should return third color (#0369a1) for 5 commits', () => {
      expect(getCommitColor(5)).toBe('#0369a1')
    })

    it('should return fourth color (#0284c7) for 6 commits', () => {
      expect(getCommitColor(6)).toBe('#0284c7')
    })

    it('should return fourth color (#0284c7) for 7 commits', () => {
      expect(getCommitColor(7)).toBe('#0284c7')
    })

    it('should return fourth color (#0284c7) for 8 commits', () => {
      expect(getCommitColor(8)).toBe('#0284c7')
    })

    it('should return fourth color (#0284c7) for 9 commits', () => {
      expect(getCommitColor(9)).toBe('#0284c7')
    })

    it('should return fifth color (#0EA5E9) for 10 commits', () => {
      expect(getCommitColor(10)).toBe('#0EA5E9')
    })

    it('should return fifth color (#0EA5E9) for 100 commits', () => {
      expect(getCommitColor(100)).toBe('#0EA5E9')
    })

    it('should return fifth color (#0EA5E9) for very large counts', () => {
      expect(getCommitColor(999999)).toBe('#0EA5E9')
    })

    it('should return fifth color for NaN (falls through all checks)', () => {
      expect(getCommitColor(NaN)).toBe('#0EA5E9')
    })

    it('should return fifth color for undefined (falls through all checks)', () => {
      expect(getCommitColor(undefined)).toBe('#0EA5E9')
    })

    it('should return second color for null (null converts to 0, 0 <= 2 is true)', () => {
      expect(getCommitColor(null)).toBe('#0c4a6e')
    })

    it('should return second color for empty string (converts to 0, 0 <= 2 is true)', () => {
      expect(getCommitColor('')).toBe('#0c4a6e')
    })

    it('should have correct color at all boundary values', () => {
      expect(getCommitColor(0)).toBe('var(--bg-panel)')
      expect(getCommitColor(1)).toBe('#0c4a6e')
      expect(getCommitColor(2)).toBe('#0c4a6e')
      expect(getCommitColor(3)).toBe('#0369a1')
      expect(getCommitColor(5)).toBe('#0369a1')
      expect(getCommitColor(6)).toBe('#0284c7')
      expect(getCommitColor(9)).toBe('#0284c7')
      expect(getCommitColor(10)).toBe('#0EA5E9')
    })

    it('should use exact color boundaries: 0, 1-2, 3-5, 6-9, 10+', () => {
      expect(getCommitColor(0)).toBe('var(--bg-panel)')
      expect(getCommitColor(1)).toBe('#0c4a6e')
      expect(getCommitColor(2)).toBe('#0c4a6e')
      expect(getCommitColor(3)).toBe('#0369a1')
      expect(getCommitColor(5)).toBe('#0369a1')
      expect(getCommitColor(6)).toBe('#0284c7')
      expect(getCommitColor(9)).toBe('#0284c7')
      expect(getCommitColor(10)).toBe('#0EA5E9')
    })
  })
})
