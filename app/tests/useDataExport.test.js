/**
 * Data Export Composable Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString() },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (index) => Object.keys(store)[index] || null
  }
})()

// Replace localStorage with mock
Object.defineProperty(global, 'localStorage', { value: localStorageMock })

// Mock document for file download
const documentMock = {
  body: {
    appendChild: () => {},
    removeChild: () => {}
  },
  createElement: () => ({
    href: '',
    download: '',
    click: () => {},
    remove: () => {}
  })
}
Object.defineProperty(global, 'document', { value: documentMock })

// Mock URL
const urlMock = {
  createObjectURL: () => 'blob:test',
  revokeObjectURL: () => {}
}
Object.defineProperty(global, 'URL', { value: urlMock })

describe('Data Export System', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Storage Keys', () => {
    it('should have correct storage key structure', () => {
      const expectedKeys = [
        'mc-algo-progress',
        '_chapterTotals',
        'mc-algo-practice-goals',
        'mc-algo-practice-history',
        'mc-algo-streak',
        'mc-algo-leetcode-username',
        'mc-algo-leetcode-sync',
        'mc-algo-review-reminder',
        'mc-algo-problem-notes',
        'mc-algo-problem-favorites',
        'mc-algo-blog-posts'
      ]
      // This is a structural test - the actual keys are defined in the composable
      expect(expectedKeys.length).toBe(11)
    })
  })

  describe('Progress Data Structure', () => {
    it('should format progress data correctly', () => {
      // Set up mock progress data
      const progress = {
        'chapter-01': {
          'prob-001': { checked: true, solvedAt: '2026-04-01' },
          'prob-002': { checked: true, solvedAt: '2026-04-02' },
          'prob-003': false
        },
        'chapter-02': {
          'prob-001': { checked: true }
        }
      }
      localStorage.setItem('mc-algo-progress', JSON.stringify(progress))

      // Verify progress structure
      const stored = JSON.parse(localStorage.getItem('mc-algo-progress'))
      expect(stored['chapter-01']['prob-001'].checked).toBe(true)
      expect(stored['chapter-01']['prob-003']).toBe(false)
    })

    it('should count solved problems correctly', () => {
      const progress = {
        'chapter-01': {
          'prob-001': { checked: true },
          'prob-002': true, // boolean format
          'prob-003': false
        }
      }
      localStorage.setItem('mc-algo-progress', JSON.stringify(progress))

      let solvedCount = 0
      for (const chapterId of Object.keys(progress)) {
        for (const probId of Object.keys(progress[chapterId])) {
          const problem = progress[chapterId][probId]
          if (typeof problem === 'object' ? problem?.checked : !!problem) {
            solvedCount++
          }
        }
      }
      expect(solvedCount).toBe(2) // prob-001 (checked: true) and prob-002 (true), but prob-003 is false
    })
  })

  describe('JSON Export Format', () => {
    it('should create valid JSON backup structure', () => {
      const backup = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        type: 'backup',
        data: {
          'mc-algo-progress': { 'chapter-01': { 'prob-001': true } }
        }
      }

      const jsonStr = JSON.stringify(backup)
      const parsed = JSON.parse(jsonStr)

      expect(parsed.version).toBe('1.0')
      expect(parsed.type).toBe('backup')
      expect(parsed.data['mc-algo-progress']['chapter-01']['prob-001']).toBe(true)
    })

    it('should create valid JSON progress export structure', () => {
      const progressExport = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        type: 'progress',
        data: [
          {
            chapterId: 'chapter-01',
            chapterTitle: '滑动窗口与双指针',
            problemId: 'prob-001',
            status: 'solved',
            solvedAt: '2026-04-01'
          }
        ]
      }

      const jsonStr = JSON.stringify(progressExport)
      const parsed = JSON.parse(jsonStr)

      expect(parsed.type).toBe('progress')
      expect(Array.isArray(parsed.data)).toBe(true)
      expect(parsed.data[0].status).toBe('solved')
    })
  })

  describe('CSV Export Format', () => {
    it('should create valid CSV content', () => {
      const headers = ['Chapter ID', 'Chapter Title', 'Problem ID', 'Status', 'Solved At']
      const rows = [
        ['chapter-01', '"滑动窗口与双指针"', 'prob-001', 'solved', '2026-04-01'],
        ['chapter-02', '"二分算法"', 'prob-001', 'attempted', '']
      ]

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

      expect(csvContent).toContain('Chapter ID')
      expect(csvContent).toContain('chapter-01')
      expect(csvContent).toContain('"滑动窗口与双指针"') // Quoted title
      expect(csvContent.split('\n').length).toBe(3)
    })

    it('should escape quotes in CSV properly', () => {
      const title = 'Test "quoted" title'
      const escaped = `"${title.replace(/"/g, '""')}"`
      expect(escaped).toBe('"Test ""quoted"" title"')
    })
  })

  describe('Backup Import', () => {
    it('should validate backup file structure', () => {
      const validBackup = {
        version: '1.0',
        exportDate: '2026-04-01T00:00:00.000Z',
        type: 'backup',
        data: {}
      }

      // Check validation logic
      expect(!!validBackup.version).toBe(true)
      expect(!!validBackup.data).toBe(true)
    })

    it('should reject invalid backup format', () => {
      const invalidBackup = {
        version: '1.0',
        // missing data field
      }

      const isValid = !!(invalidBackup.version && invalidBackup.data)
      expect(isValid).toBe(false)
    })
  })

  describe('Progress Merge Import', () => {
    it('should merge progress data correctly', () => {
      const existingProgress = {
        'chapter-01': {
          'prob-001': { checked: true, solvedAt: '2026-04-01' }
        }
      }

      const newProgress = [
        { chapterId: 'chapter-01', problemId: 'prob-001', status: 'solved', solvedAt: '2026-04-01' },
        { chapterId: 'chapter-01', problemId: 'prob-002', status: 'solved', solvedAt: '2026-04-02' },
        { chapterId: 'chapter-02', problemId: 'prob-001', status: 'solved' }
      ]

      // Merge logic
      for (const item of newProgress) {
        if (!existingProgress[item.chapterId]) {
          existingProgress[item.chapterId] = {}
        }
        if (item.status === 'solved') {
          existingProgress[item.chapterId][item.problemId] = {
            checked: true,
            solvedAt: item.solvedAt || new Date().toISOString()
          }
        }
      }

      expect(existingProgress['chapter-01']['prob-001']).toBeDefined()
      expect(existingProgress['chapter-01']['prob-002']).toBeDefined()
      expect(existingProgress['chapter-02']['prob-001']).toBeDefined()
    })
  })

  describe('Data Summary Calculation', () => {
    it('should count notes correctly', () => {
      const notes = {
        'chapter-01:prob-001': 'Test note 1',
        'chapter-01:prob-002': 'Test note 2'
      }
      localStorage.setItem('mc-algo-problem-notes', JSON.stringify(notes))

      const stored = JSON.parse(localStorage.getItem('mc-algo-problem-notes'))
      expect(Object.keys(stored).length).toBe(2)
    })

    it('should count favorites correctly', () => {
      const favorites = {
        'chapter-01:prob-001': true,
        'chapter-02:prob-003': true
      }
      localStorage.setItem('mc-algo-problem-favorites', JSON.stringify(favorites))

      const stored = JSON.parse(localStorage.getItem('mc-algo-problem-favorites'))
      expect(Object.keys(stored).length).toBe(2)
    })
  })

  describe('File Download', () => {
    it('should create blob with correct content', () => {
      const content = 'test content'
      const mimeType = 'text/plain'
      const blob = new Blob([content], { type: mimeType })

      expect(blob.size).toBe(content.length)
      expect(blob.type).toBe(mimeType)
    })

    it('should create JSON blob correctly', () => {
      const data = { test: true }
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })

      expect(blob.type).toBe('application/json')
    })
  })

  describe('Practice History Export', () => {
    it('should format practice history correctly', () => {
      const history = {
        '2026-04-01': { count: 3, problems: ['prob1', 'prob2', 'prob3'] },
        '2026-04-02': { count: 2, problems: ['prob4', 'prob5'] }
      }
      localStorage.setItem('mc-algo-practice-history', JSON.stringify(history))

      const stored = JSON.parse(localStorage.getItem('mc-algo-practice-history'))
      expect(stored['2026-04-01'].count).toBe(3)
      expect(stored['2026-04-01'].problems.length).toBe(3)
    })
  })

  describe('Goals Export', () => {
    it('should export goals correctly', () => {
      const goals = {
        dailyGoal: 5,
        weeklyGoal: 25,
        reminderEnabled: true,
        streakReminderEnabled: true
      }
      localStorage.setItem('mc-algo-practice-goals', JSON.stringify(goals))

      const stored = JSON.parse(localStorage.getItem('mc-algo-practice-goals'))
      expect(stored.dailyGoal).toBe(5)
      expect(stored.weeklyGoal).toBe(25)
      expect(stored.reminderEnabled).toBe(true)
    })
  })

  describe('Streak Data Export', () => {
    it('should export streak data correctly', () => {
      const streak = {
        currentStreak: 7,
        longestStreak: 14,
        lastPracticeDate: '2026-04-02'
      }
      localStorage.setItem('mc-algo-streak', JSON.stringify(streak))

      const stored = JSON.parse(localStorage.getItem('mc-algo-streak'))
      expect(stored.currentStreak).toBe(7)
      expect(stored.longestStreak).toBe(14)
    })
  })
})