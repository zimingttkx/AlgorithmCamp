/**
 * Unit Tests for Stats Functions (Extended Coverage)
 * Tests calcLevel, calcStreak, getCalendarWeeks, getCommitColor
 */

import { describe, it, expect } from 'vitest'
import { calcLevel, calcStreak, getCalendarWeeks, getCommitColor, CONFIG } from '../src/composables/stats.js'

describe('stats.js - CONFIG constants', () => {
  it('should have correct XP per commit', () => {
    expect(CONFIG.xpPerCommit).toBe(10)
  })

  it('should have 10 levels', () => {
    expect(CONFIG.levels).toHaveLength(10)
  })

  it('should have level 1 as Novice', () => {
    expect(CONFIG.levels[0].level).toBe(1)
    expect(CONFIG.levels[0].title).toBe('新手')
    expect(CONFIG.levels[0].titleEn).toBe('Novice')
  })

  it('should have level 10 as Legend', () => {
    expect(CONFIG.levels[9].level).toBe(10)
    expect(CONFIG.levels[9].title).toBe('传奇')
    expect(CONFIG.levels[9].titleEn).toBe('Legend')
  })

  it('should have increasing XP requirements', () => {
    for (let i = 1; i < CONFIG.levels.length; i++) {
      expect(CONFIG.levels[i].xpRequired).toBeGreaterThan(CONFIG.levels[i-1].xpRequired)
    }
  })

  it('should have 5 calendar colors', () => {
    expect(CONFIG.calendarColors).toHaveLength(5)
  })

  it('should have streak bonus configuration', () => {
    expect(CONFIG.streakBonus[7]).toBe(1.2)
    expect(CONFIG.streakBonus[30]).toBe(1.5)
    expect(CONFIG.streakBonus[100]).toBe(2.0)
  })
})

describe('stats.js - calcLevel()', () => {
  it('should return level 1 for 0 XP', () => {
    const result = calcLevel(0)
    expect(result.level).toBe(1)
    expect(result.title).toBe('新手')
    expect(result.isMaxLevel).toBe(false)
  })

  it('should return correct level for 100 XP', () => {
    const result = calcLevel(100)
    expect(result.level).toBe(2)
    expect(result.title).toBe('学徒')
  })

  it('should return correct level for 300 XP', () => {
    const result = calcLevel(300)
    expect(result.level).toBe(3)
    expect(result.title).toBe('码农')
  })

  it('should return correct level for 700 XP', () => {
    const result = calcLevel(700)
    expect(result.level).toBe(4)
    expect(result.title).toBe('开发者')
  })

  it('should return max level for high XP', () => {
    const result = calcLevel(100000)
    expect(result.level).toBe(10)
    expect(result.isMaxLevel).toBe(true)
  })

  it('should calculate correct progress percentage', () => {
    const result = calcLevel(150) // Between 100-300
    expect(result.progress).toBeGreaterThan(0)
    expect(result.progress).toBeLessThan(100)
  })

  it('should include XP information in result', () => {
    const result = calcLevel(250)
    expect(result.totalXP).toBe(250)
    expect(result.currentLevelXP).toBe(100)
    expect(result.xpInLevel).toBe(150)
    expect(result.xpNeeded).toBe(200)
  })

  it('should return correct next level XP', () => {
    const result = calcLevel(50)
    expect(result.nextLevelXP).toBe(100)
  })

  it('should handle edge case at exactly XP threshold', () => {
    const result = calcLevel(300)
    expect(result.level).toBe(3)
    expect(result.xpInLevel).toBe(0)
  })

  it('should handle boundary between levels', () => {
    const result299 = calcLevel(299)
    const result300 = calcLevel(300)
    const result301 = calcLevel(301)

    expect(result299.level).toBe(2)
    expect(result300.level).toBe(3)
    expect(result301.level).toBe(3)
  })
})

describe('stats.js - calcStreak()', () => {
  it('should return 0 for empty calendar', () => {
    const result = calcStreak({})
    expect(result.current).toBe(0)
    expect(result.longest).toBe(0)
  })

  it('should return 0 for null calendar', () => {
    const result = calcStreak(null)
    expect(result.current).toBe(0)
    expect(result.longest).toBe(0)
  })

  it('should return 0 for undefined calendar', () => {
    const result = calcStreak(undefined)
    expect(result.current).toBe(0)
    expect(result.longest).toBe(0)
  })

  it('should count single day as streak of 1', () => {
    const today = new Date().toISOString().split('T')[0]
    const result = calcStreak({ [today]: 1 })
    expect(result.current).toBeGreaterThanOrEqual(1)
  })

  it('should calculate longest streak correctly', () => {
    const calendar = {
      '2024-01-01': 1,
      '2024-01-02': 2,
      '2024-01-03': 1,
      '2024-01-04': 3,
      '2024-01-05': 1,
    }
    const result = calcStreak(calendar)
    expect(result.longest).toBe(5)
  })

  it('should handle gap in dates', () => {
    const calendar = {
      '2024-01-01': 1,
      '2024-01-02': 1,
      '2024-01-03': 0,
      '2024-01-04': 1,
    }
    const result = calcStreak(calendar)
    // longest should count the separate streaks
    expect(result.longest).toBeGreaterThanOrEqual(2)
  })
})

describe('stats.js - getCalendarWeeks()', () => {
  it('should return array of weeks', () => {
    const result = getCalendarWeeks({})
    expect(Array.isArray(result)).toBe(true)
  })

  it('should return 52+ weeks for full year', () => {
    const result = getCalendarWeeks({})
    expect(result.length).toBeGreaterThanOrEqual(52)
  })

  it('should include date information in each day', () => {
    const calendar = {
      [new Date().toISOString().split('T')[0]]: 1
    }
    const result = getCalendarWeeks(calendar)
    const firstWeek = result[0]
    if (firstWeek && firstWeek.length > 0) {
      expect(firstWeek[0].date).toBeDefined()
      expect(firstWeek[0].count).toBeDefined()
      expect(firstWeek[0].dayOfWeek).toBeDefined()
    }
  })

  it('should handle calendar with data', () => {
    const today = new Date().toISOString().split('T')[0]
    const calendar = { [today]: 5 }
    const result = getCalendarWeeks(calendar)
    expect(result.length).toBeGreaterThan(0)
  })

  it('should handle calendar with zero commits', () => {
    const result = getCalendarWeeks({})
    result.forEach(week => {
      week.forEach(day => {
        expect(day.count).toBe(0)
      })
    })
  })
})

describe('stats.js - getCommitColor()', () => {
  it('should return first color for 0 commits', () => {
    const color = getCommitColor(0)
    expect(color).toBe(CONFIG.calendarColors[0])
  })

  it('should return second color for 1 commit', () => {
    const color = getCommitColor(1)
    expect(color).toBe(CONFIG.calendarColors[1])
  })

  it('should return second color for 2 commits', () => {
    const color = getCommitColor(2)
    expect(color).toBe(CONFIG.calendarColors[1])
  })

  it('should return third color for 3 commits', () => {
    const color = getCommitColor(3)
    expect(color).toBe(CONFIG.calendarColors[2])
  })

  it('should return third color for 5 commits', () => {
    const color = getCommitColor(5)
    expect(color).toBe(CONFIG.calendarColors[2])
  })

  it('should return fourth color for 6 commits', () => {
    const color = getCommitColor(6)
    expect(color).toBe(CONFIG.calendarColors[3])
  })

  it('should return fourth color for 9 commits', () => {
    const color = getCommitColor(9)
    expect(color).toBe(CONFIG.calendarColors[3])
  })

  it('should return fifth color for 10+ commits', () => {
    const color = getCommitColor(10)
    expect(color).toBe(CONFIG.calendarColors[4])
  })

  it('should return fifth color for very large commit count', () => {
    const color = getCommitColor(1000)
    expect(color).toBe(CONFIG.calendarColors[4])
  })
})
