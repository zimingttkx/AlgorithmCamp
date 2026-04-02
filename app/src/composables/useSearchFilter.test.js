/**
 * Search Filter Composable Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSearchFilter } from './useSearchFilter.js'
import { CHAPTERS } from './data.js'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString() },
    clear: () => { store = {} }
  }
})()
global.localStorage = localStorageMock

describe('useSearchFilter', () => {
  let filter

  beforeEach(() => {
    filter = useSearchFilter()
    filter.resetFilters()
  })

  describe('DIFFICULTY_LEVELS', () => {
    it('should have correct difficulty levels', () => {
      expect(filter.DIFFICULTY_LEVELS.NONE).toBe('none')
      expect(filter.DIFFICULTY_LEVELS.LOW).toBe('low')
      expect(filter.DIFFICULTY_LEVELS.MED).toBe('med')
      expect(filter.DIFFICULTY_LEVELS.HIGH).toBe('high')
    })
  })

  describe('STATUS_FILTERS', () => {
    it('should have correct status filters', () => {
      expect(filter.STATUS_FILTERS.ALL).toBe('all')
      expect(filter.STATUS_FILTERS.NOT_STARTED).toBe('not_started')
      expect(filter.STATUS_FILTERS.DONE).toBe('done')
      expect(filter.STATUS_FILTERS.REVIEW).toBe('review')
    })
  })

  describe('getDifficultyLevel', () => {
    it('should return NONE for null or empty rating', () => {
      expect(filter.getDifficultyLevel(null)).toBe('none')
      expect(filter.getDifficultyLevel('')).toBe('none')
      expect(filter.getDifficultyLevel('—')).toBe('none')
    })

    it('should return LOW for rating < 1600', () => {
      expect(filter.getDifficultyLevel('1000')).toBe('low')
      expect(filter.getDifficultyLevel('1500')).toBe('low')
      expect(filter.getDifficultyLevel('1599')).toBe('low')
    })

    it('should return MED for rating 1600-1999', () => {
      expect(filter.getDifficultyLevel('1600')).toBe('med')
      expect(filter.getDifficultyLevel('1800')).toBe('med')
      expect(filter.getDifficultyLevel('1999')).toBe('med')
    })

    it('should return HIGH for rating >= 2000', () => {
      expect(filter.getDifficultyLevel('2000')).toBe('high')
      expect(filter.getDifficultyLevel('2500')).toBe('high')
      expect(filter.getDifficultyLevel('3000')).toBe('high')
    })
  })

  describe('matchesSearch', () => {
    const problem = {
      num: '1',
      title: '两数之和',
      probId: 'two-sum'
    }

    it('should return true for empty query', () => {
      expect(filter.matchesSearch(problem, '')).toBe(true)
      expect(filter.matchesSearch(problem, null)).toBe(true)
    })

    it('should match title case-insensitively', () => {
      expect(filter.matchesSearch(problem, '两数')).toBe(true)
      expect(filter.matchesSearch(problem, 'TWO')).toBe(true)
      expect(filter.matchesSearch(problem, 'Sum')).toBe(true)
    })

    it('should match problem number', () => {
      expect(filter.matchesSearch(problem, '1')).toBe(true)
    })

    it('should match probId', () => {
      expect(filter.matchesSearch(problem, 'two-sum')).toBe(true)
      expect(filter.matchesSearch(problem, 'sum')).toBe(true)
    })

    it('should return false for non-matching query', () => {
      expect(filter.matchesSearch(problem, '不存在')).toBe(false)
    })
  })

  describe('matchesDifficulty', () => {
    const problem = { rating: '1500' }

    it('should return true for NONE filter (no filter)', () => {
      expect(filter.matchesDifficulty(problem, filter.DIFFICULTY_LEVELS.NONE)).toBe(true)
    })

    it('should match LOW difficulty', () => {
      expect(filter.matchesDifficulty({ rating: '1500' }, filter.DIFFICULTY_LEVELS.LOW)).toBe(true)
      expect(filter.matchesDifficulty({ rating: '1600' }, filter.DIFFICULTY_LEVELS.LOW)).toBe(false)
    })
  })

  describe('matchesStatus', () => {
    const progress = {
      'chapter-01': {
        'prob-1': { checked: true },
        'prob-2': { checked: false }
      }
    }

    const reviews = {
      'chapter-01': {
        'prob-1': { repetitions: 1 }
      }
    }

    const problem1 = { probId: 'prob-1' }
    const problem2 = { probId: 'prob-2' }
    const problem3 = { probId: 'prob-3' }

    it('should return true for ALL filter', () => {
      expect(filter.matchesStatus(problem1, 'chapter-01', progress, reviews, filter.STATUS_FILTERS.ALL)).toBe(true)
    })

    it('should correctly identify NOT_STARTED problems', () => {
      expect(filter.matchesStatus(problem2, 'chapter-01', progress, reviews, filter.STATUS_FILTERS.NOT_STARTED)).toBe(true)
      expect(filter.matchesStatus(problem1, 'chapter-01', progress, reviews, filter.STATUS_FILTERS.NOT_STARTED)).toBe(false)
      expect(filter.matchesStatus(problem3, 'chapter-01', progress, reviews, filter.STATUS_FILTERS.NOT_STARTED)).toBe(true)
    })

    it('should correctly identify DONE problems (checked but no review)', () => {
      expect(filter.matchesStatus(problem1, 'chapter-01', progress, reviews, filter.STATUS_FILTERS.DONE)).toBe(false) // has review
      expect(filter.matchesStatus({ probId: 'prob-2', checked: true }, 'chapter-01', { 'chapter-01': { 'prob-2': { checked: true } } }, reviews, filter.STATUS_FILTERS.DONE)).toBe(true)
    })

    it('should correctly identify REVIEW problems', () => {
      expect(filter.matchesStatus(problem1, 'chapter-01', progress, reviews, filter.STATUS_FILTERS.REVIEW)).toBe(true)
      expect(filter.matchesStatus(problem2, 'chapter-01', progress, reviews, filter.STATUS_FILTERS.REVIEW)).toBe(false)
    })
  })

  describe('filterProblems', () => {
    const mdCache = {
      'chapter-01': [
        {
          h2: '滑动窗口',
          h3: '基础',
          rows: [
            { num: '1', title: '两数之和', rating: '—', probId: 'two-sum' },
            { num: '643', title: '子数组最大平均数 I', rating: '1200', probId: 'max-average' }
          ]
        }
      ]
    }

    const progress = {
      'chapter-01': {
        'two-sum': { checked: true }
      }
    }

    const reviews = {
      'chapter-01': {
        'two-sum': { repetitions: 1 }
      }
    }

    it('should return all problems when no filters active', () => {
      const results = filter.filterProblems(mdCache, progress, reviews)
      expect(results.length).toBe(2)
    })

    it('should filter by search query', () => {
      filter.searchQuery.value = '两数'
      const results = filter.filterProblems(mdCache, progress, reviews)
      expect(results.length).toBe(1)
      expect(results[0].title).toBe('两数之和')
    })

    it('should filter by difficulty', () => {
      filter.difficultyFilter.value = filter.DIFFICULTY_LEVELS.LOW
      const results = filter.filterProblems(mdCache, progress, reviews)
      expect(results.length).toBe(1)
      expect(results[0].probId).toBe('max-average')
    })

    it('should filter by status', () => {
      filter.statusFilter.value = filter.STATUS_FILTERS.NOT_STARTED
      const results = filter.filterProblems(mdCache, progress, reviews)
      expect(results.length).toBe(1)
      expect(results[0].probId).toBe('max-average')
    })

    it('should filter by chapter', () => {
      filter.chapterFilter.value = 'chapter-01'
      const results = filter.filterProblems(mdCache, progress, reviews)
      expect(results.length).toBe(2)

      filter.chapterFilter.value = 'chapter-02'
      const emptyResults = filter.filterProblems(mdCache, progress, reviews)
      expect(emptyResults.length).toBe(0)
    })
  })

  describe('filterChapterProblems', () => {
    const sections = [
      {
        h2: '滑动窗口',
        h3: '基础',
        rows: [
          { num: '1', title: '两数之和', rating: '—', probId: 'two-sum' },
          { num: '643', title: '子数组最大平均数 I', rating: '1200', probId: 'max-average' },
          { num: '2000', title: '困难题', rating: '2100', probId: 'hard-prob' }
        ]
      }
    ]

    const progress = {
      'chapter-01': {
        'two-sum': { checked: true }
      }
    }

    const reviews = {}

    it('should return original sections when no filters active', () => {
      const results = filter.filterChapterProblems('chapter-01', sections, progress, reviews)
      expect(results.length).toBe(1)
      expect(results[0].rows.length).toBe(3)
    })

    it('should filter rows by search query', () => {
      filter.searchQuery.value = '平均'
      const results = filter.filterChapterProblems('chapter-01', sections, progress, reviews)
      expect(results.length).toBe(1)
      expect(results[0].rows.length).toBe(1)
      expect(results[0].rows[0].title).toBe('子数组最大平均数 I')
    })

    it('should filter rows by difficulty', () => {
      filter.difficultyFilter.value = filter.DIFFICULTY_LEVELS.HIGH
      const results = filter.filterChapterProblems('chapter-01', sections, progress, reviews)
      expect(results.length).toBe(1)
      expect(results[0].rows.length).toBe(1)
      expect(results[0].rows[0].probId).toBe('hard-prob')
    })

    it('should filter rows by status', () => {
      filter.statusFilter.value = filter.STATUS_FILTERS.NOT_STARTED
      const results = filter.filterChapterProblems('chapter-01', sections, progress, reviews)
      expect(results.length).toBe(1)
      expect(results[0].rows.length).toBe(2) // max-average and hard-prob
    })
  })

  describe('hasActiveFilters', () => {
    it('should return false when no filters active', () => {
      expect(filter.hasActiveFilters.value).toBe(false)
    })

    it('should return true when search query is set', () => {
      filter.searchQuery.value = 'test'
      expect(filter.hasActiveFilters.value).toBe(true)
    })

    it('should return true when difficulty filter is set', () => {
      filter.difficultyFilter.value = filter.DIFFICULTY_LEVELS.LOW
      expect(filter.hasActiveFilters.value).toBe(true)
    })

    it('should return true when status filter is set', () => {
      filter.statusFilter.value = filter.STATUS_FILTERS.DONE
      expect(filter.hasActiveFilters.value).toBe(true)
    })

    it('should return true when chapter filter is set', () => {
      filter.chapterFilter.value = 'chapter-01'
      expect(filter.hasActiveFilters.value).toBe(true)
    })
  })

  describe('resetFilters', () => {
    it('should reset all filters to default values', () => {
      filter.searchQuery.value = 'test'
      filter.difficultyFilter.value = filter.DIFFICULTY_LEVELS.HIGH
      filter.statusFilter.value = filter.STATUS_FILTERS.DONE
      filter.chapterFilter.value = 'chapter-01'

      filter.resetFilters()

      expect(filter.searchQuery.value).toBe('')
      expect(filter.difficultyFilter.value).toBe(filter.DIFFICULTY_LEVELS.NONE)
      expect(filter.statusFilter.value).toBe(filter.STATUS_FILTERS.ALL)
      expect(filter.chapterFilter.value).toBe(null)
    })
  })
})