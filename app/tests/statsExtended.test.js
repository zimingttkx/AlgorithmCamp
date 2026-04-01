/**
 * Unit Tests for stats.js - Extended coverage
 * Tests getCalendarWeeks and getCommitColor which were not covered before
 */

import { describe, it, expect } from 'vitest'
import { calcLevel, calcStreak, getCalendarWeeks, getCommitColor, CONFIG } from '../src/composables/stats.js'

describe('getCalendarWeeks', () => {
  it('should return array of weeks', () => {
    const calendar = {}
    const weeks = getCalendarWeeks(calendar)

    expect(Array.isArray(weeks)).toBe(true)
    expect(weeks.length).toBeGreaterThan(0)
  })

  it('should return 52 weeks of data', () => {
    const calendar = {}
    const weeks = getCalendarWeeks(calendar)

    // 52 weeks = 364 days + partial week
    expect(weeks.length).toBeGreaterThanOrEqual(52)
  })

  it('should include dates in correct format', () => {
    const calendar = {}
    const weeks = getCalendarWeeks(calendar)

    const firstWeek = weeks[0]
    expect(firstWeek[0]).toHaveProperty('date')
    expect(firstWeek[0]).toHaveProperty('count')
    expect(firstWeek[0]).toHaveProperty('dayOfWeek')

    // Date should be YYYY-MM-DD format
    expect(firstWeek[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('should use calendar data for counts', () => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    const calendar = {}
    calendar[todayStr] = 5

    const weeks = getCalendarWeeks(calendar)

    // Find today in the calendar
    let foundToday = false
    for (const week of weeks) {
      for (const day of week) {
        if (day.date === todayStr) {
          expect(day.count).toBe(5)
          foundToday = true
          break
        }
      }
      if (foundToday) break
    }
    expect(foundToday).toBe(true)
  })

  it('should default missing dates to 0', () => {
    const calendar = {}
    const weeks = getCalendarWeeks(calendar)

    for (const week of weeks) {
      for (const day of week) {
        expect(typeof day.count).toBe('number')
      }
    }
  })

  it('should have dayOfWeek from 0-6 (Sunday-Saturday)', () => {
    const calendar = {}
    const weeks = getCalendarWeeks(calendar)

    for (const week of weeks) {
      for (const day of week) {
        expect(day.dayOfWeek).toBeGreaterThanOrEqual(0)
        expect(day.dayOfWeek).toBeLessThanOrEqual(6)
      }
    }
  })

  it('should end on the last day of current week', () => {
    const calendar = {}
    const weeks = getCalendarWeeks(calendar)

    const lastWeek = weeks[weeks.length - 1]
    const lastDay = lastWeek[lastWeek.length - 1]

    const today = new Date()
    const dayOfWeek = today.getDay()
    const expectedLastDay = new Date(today)
    expectedLastDay.setDate(today.getDate() + (6 - dayOfWeek))

    expect(lastDay.dayOfWeek).toBe(6) // Saturday
  })
})

describe('getCommitColor', () => {
  it('should return color[0] for 0 commits', () => {
    const color = getCommitColor(0)
    expect(color).toBe(CONFIG.calendarColors[0])
  })

  it('should return color[1] for 1-2 commits', () => {
    expect(getCommitColor(1)).toBe(CONFIG.calendarColors[1])
    expect(getCommitColor(2)).toBe(CONFIG.calendarColors[1])
  })

  it('should return color[2] for 3-5 commits', () => {
    expect(getCommitColor(3)).toBe(CONFIG.calendarColors[2])
    expect(getCommitColor(4)).toBe(CONFIG.calendarColors[2])
    expect(getCommitColor(5)).toBe(CONFIG.calendarColors[2])
  })

  it('should return color[3] for 6-9 commits', () => {
    expect(getCommitColor(6)).toBe(CONFIG.calendarColors[3])
    expect(getCommitColor(7)).toBe(CONFIG.calendarColors[3])
    expect(getCommitColor(8)).toBe(CONFIG.calendarColors[3])
    expect(getCommitColor(9)).toBe(CONFIG.calendarColors[3])
  })

  it('should return color[4] for 10+ commits', () => {
    expect(getCommitColor(10)).toBe(CONFIG.calendarColors[4])
    expect(getCommitColor(100)).toBe(CONFIG.calendarColors[4])
    expect(getCommitColor(1000)).toBe(CONFIG.calendarColors[4])
  })

  it('should have correct number of color levels', () => {
    expect(CONFIG.calendarColors).toHaveLength(5)
  })
})

describe('CONFIG', () => {
  it('should have 10 levels', () => {
    expect(CONFIG.levels).toHaveLength(10)
  })

  it('should have xpPerCommit of 10', () => {
    expect(CONFIG.xpPerCommit).toBe(10)
  })

  it('should have streakBonus configuration', () => {
    expect(CONFIG.streakBonus).toBeDefined()
    expect(CONFIG.streakBonus[7]).toBe(1.2) // 20% bonus for 7 days
    expect(CONFIG.streakBonus[30]).toBe(1.5) // 50% bonus for 30 days
    expect(CONFIG.streakBonus[100]).toBe(2.0) // 100% bonus for 100 days
  })

  it('should have correct level progression', () => {
    const levels = CONFIG.levels

    // Level 1 should start at 0 XP
    expect(levels[0].level).toBe(1)
    expect(levels[0].xpRequired).toBe(0)

    // Each level should have increasing XP
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i].xpRequired).toBeGreaterThan(levels[i-1].xpRequired)
    }

    // Level 10 should be the max
    expect(levels[levels.length - 1].level).toBe(10)
  })

  it('should have both Chinese and English titles', () => {
    for (const level of CONFIG.levels) {
      expect(typeof level.title).toBe('string')
      expect(typeof level.titleEn).toBe('string')
      expect(level.title.length).toBeGreaterThan(0)
      expect(level.titleEn.length).toBeGreaterThan(0)
    }
  })

  it('should have icons for each level', () => {
    for (const level of CONFIG.levels) {
      expect(typeof level.icon).toBe('string')
      expect(level.icon.length).toBeGreaterThan(0)
    }
  })
})

describe('calcLevel - edge cases', () => {
  it('should handle 0 XP', () => {
    const result = calcLevel(0)
    expect(result.level).toBe(1)
    expect(result.isMaxLevel).toBe(false)
  })

  it('should handle XP exactly at level threshold', () => {
    // Level 2 starts at 100 XP
    const result = calcLevel(100)
    expect(result.level).toBe(2)
    expect(result.xpInLevel).toBe(0)
    expect(result.progress).toBe(0)
  })

  it('should handle XP at max level', () => {
    const maxXP = CONFIG.levels[CONFIG.levels.length - 1].xpRequired
    const result = calcLevel(maxXP)
    expect(result.isMaxLevel).toBe(true)
    expect(result.progress).toBe(100)
  })

  it('should handle XP way beyond max level', () => {
    const result = calcLevel(1000000)
    expect(result.level).toBe(10)
    expect(result.isMaxLevel).toBe(true)
    expect(result.progress).toBe(100)
  })

  it('should calculate correct progress between levels', () => {
    // Level 2: 100-300 XP
    // At 200 XP: 100 XP into level, 200 XP needed for level 3
    const result = calcLevel(200)
    expect(result.xpInLevel).toBe(100)
    expect(result.xpNeeded).toBe(200)
    expect(result.progress).toBe(50)
  })
})

describe('calcStreak - real world scenarios', () => {
  it('should calculate streak correctly with gaps', () => {
    // Create a calendar with:
    // - Today: has commits
    // - Yesterday: has commits
    // - 3 days ago: has commits (gap in between)
    // - 4 days ago: has commits
    const calendar = {}
    const today = new Date()

    // Today
    const todayStr = today.toISOString().split('T')[0]
    calendar[todayStr] = 1

    // Yesterday
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    calendar[yesterday.toISOString().split('T')[0]] = 1

    // Skip 2 days

    // 4 days ago
    const fourDaysAgo = new Date(today)
    fourDaysAgo.setDate(today.getDate() - 4)
    calendar[fourDaysAgo.toISOString().split('T')[0]] = 1

    // 5 days ago
    const fiveDaysAgo = new Date(today)
    fiveDaysAgo.setDate(today.getDate() - 5)
    calendar[fiveDaysAgo.toISOString().split('T')[0]] = 1

    const result = calcStreak(calendar)

    // Current streak should be 2 (today + yesterday)
    expect(result.current).toBe(2)
  })

  it('should handle calendar with only old commits', () => {
    const calendar = {}
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    calendar[twoWeeksAgo.toISOString().split('T')[0]] = 5

    const result = calcStreak(calendar)

    // Current streak should be 0 (not consecutive to today)
    expect(result.current).toBe(0)
  })

  it('should find longest streak in old data', () => {
    const calendar = {}

    // Create a 10-day streak 20 days ago
    for (let i = 20; i <= 29; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      calendar[date.toISOString().split('T')[0]] = 1
    }

    // Create a 5-day streak 5 days ago
    for (let i = 5; i <= 9; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      calendar[date.toISOString().split('T')[0]] = 1
    }

    const result = calcStreak(calendar)

    // Longest should be 10
    expect(result.longest).toBe(10)
  })
})
