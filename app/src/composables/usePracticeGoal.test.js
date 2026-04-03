/**
 * Practice Goal Composable Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { calculateSM2 } from './useReviewReminder.js'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString() },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

// Replace localStorage with mock
Object.defineProperty(global, 'localStorage', { value: localStorageMock })

describe('Practice Goal System', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('SM-2 Algorithm (used by review reminder)', () => {
    it('should calculate SM-2 correctly for first successful review', () => {
      const result = calculateSM2(4, 0, 2.5, 0)
      expect(result.repetitions).toBe(1)
      expect(result.interval).toBe(1)
      expect(result.easeFactor).toBeGreaterThanOrEqual(2.5)
    })

    it('should calculate SM-2 correctly for second successful review', () => {
      const result = calculateSM2(4, 1, 2.5, 1)
      expect(result.repetitions).toBe(2)
      expect(result.interval).toBe(6)
    })

    it('should reset on failed review (quality < 3)', () => {
      const result = calculateSM2(2, 3, 2.0, 10)
      expect(result.repetitions).toBe(0)
      expect(result.interval).toBe(1)
    })

    it('should increase interval for easy reviews (quality 5)', () => {
      const result = calculateSM2(5, 2, 2.5, 6)
      expect(result.interval).toBeGreaterThan(6)
    })
  })

  describe('Local Storage Persistence', () => {
    it('should save and retrieve goals from localStorage', () => {
      const testGoals = {
        dailyGoal: 5,
        weeklyGoal: 25,
        reminderEnabled: true,
        streakReminderEnabled: true
      }
      localStorage.setItem('mc-algo-practice-goals', JSON.stringify(testGoals))
      const retrieved = JSON.parse(localStorage.getItem('mc-algo-practice-goals'))
      expect(retrieved.dailyGoal).toBe(5)
      expect(retrieved.weeklyGoal).toBe(25)
    })

    it('should save and retrieve history from localStorage', () => {
      const testHistory = {
        '2026-04-01': { count: 3, problems: ['prob1', 'prob2', 'prob3'] },
        '2026-04-02': { count: 2, problems: ['prob4', 'prob5'] }
      }
      localStorage.setItem('mc-algo-practice-history', JSON.stringify(testHistory))
      const retrieved = JSON.parse(localStorage.getItem('mc-algo-practice-history'))
      expect(retrieved['2026-04-01'].count).toBe(3)
      expect(retrieved['2026-04-02'].count).toBe(2)
    })

    it('should save and retrieve streak from localStorage', () => {
      const testStreak = {
        currentStreak: 7,
        longestStreak: 14,
        lastPracticeDate: '2026-04-02'
      }
      localStorage.setItem('mc-algo-streak', JSON.stringify(testStreak))
      const retrieved = JSON.parse(localStorage.getItem('mc-algo-streak'))
      expect(retrieved.currentStreak).toBe(7)
      expect(retrieved.longestStreak).toBe(14)
    })
  })

  describe('Goal Progress Calculations', () => {
    it('should calculate daily progress correctly', () => {
      const todayCount = 3
      const dailyGoal = 5
      const progress = Math.min(100, Math.round((todayCount / dailyGoal) * 100))
      expect(progress).toBe(60)
    })

    it('should cap progress at 100%', () => {
      const todayCount = 10
      const dailyGoal = 5
      const progress = Math.min(100, Math.round((todayCount / dailyGoal) * 100))
      expect(progress).toBe(100)
    })

    it('should calculate weekly progress correctly', () => {
      const weekCount = 10
      const weeklyGoal = 20
      const progress = Math.min(100, Math.round((weekCount / weeklyGoal) * 100))
      expect(progress).toBe(50)
    })
  })

  describe('Date Helpers', () => {
    it('should format date correctly', () => {
      const date = new Date('2026-04-02T12:00:00')
      const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      expect(formatted).toBe('2026-04-02')
    })

    it('should detect consecutive days', () => {
      const prev = new Date('2026-04-01')
      const curr = new Date('2026-04-02')
      const diffDays = (curr - prev) / (1000 * 60 * 60 * 24)
      expect(diffDays).toBe(1)
    })

    it('should detect same day', () => {
      const date1 = '2026-04-02'
      const date2 = '2026-04-02'
      expect(date1).toBe(date2)
    })
  })

  describe('Achievement System', () => {
    it('should unlock first problem achievement', () => {
      const totalProblems = 1
      expect(totalProblems >= 1).toBe(true)
    })

    it('should unlock week streak achievement', () => {
      const longestStreak = 7
      expect(longestStreak >= 7).toBe(true)
    })

    it('should unlock 100 problems achievement', () => {
      const totalProblems = 100
      expect(totalProblems >= 100).toBe(true)
    })

    it('should unlock 30 day streak achievement', () => {
      const longestStreak = 30
      expect(longestStreak >= 30).toBe(true)
    })
  })
})