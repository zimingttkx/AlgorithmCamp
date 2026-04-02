// Test for useProblemDetail composable
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} })
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

// Mock document
global.document = {
  querySelector: vi.fn()
}

describe('useProblemDetail', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('should save and retrieve notes', async () => {
    const { useProblemDetail } = await import('./useProblemDetail.js')
    const { saveNote, getNote } = useProblemDetail()

    saveNote('chapter-01', '1', 'Test note content')
    expect(getNote('chapter-01', '1')).toBe('Test note content')
    expect(getNote('chapter-01', '2')).toBe('')
  })

  it('should toggle favorites correctly', async () => {
    const { useProblemDetail } = await import('./useProblemDetail.js')
    const { isFavorite, toggleFavorite } = useProblemDetail()

    expect(isFavorite('chapter-01', '1')).toBe(false)

    toggleFavorite('chapter-01', '1')
    expect(isFavorite('chapter-01', '1')).toBe(true)

    toggleFavorite('chapter-01', '1')
    expect(isFavorite('chapter-01', '1')).toBe(false)
  })

  it('should save and retrieve solutions', async () => {
    const { useProblemDetail } = await import('./useProblemDetail.js')
    const { saveSolution, getSolution } = useProblemDetail()

    saveSolution('chapter-01', '1', '# Solution\n\nThis is the solution', 'TestUser')
    expect(getSolution('chapter-01', '1')).toBe('# Solution\n\nThis is the solution')
  })

  it('should track favorite count', async () => {
    const { useProblemDetail } = await import('./useProblemDetail.js')
    const { toggleFavorite, favoriteCount } = useProblemDetail()

    expect(favoriteCount.value).toBe(0)

    toggleFavorite('chapter-01', '1')
    expect(favoriteCount.value).toBe(1)

    toggleFavorite('chapter-02', '1')
    expect(favoriteCount.value).toBe(2)
  })

  it('should delete solutions', async () => {
    const { useProblemDetail } = await import('./useProblemDetail.js')
    const { saveSolution, getSolution, deleteSolution } = useProblemDetail()

    saveSolution('chapter-01', '1', 'Solution content', 'User')
    expect(getSolution('chapter-01', '1')).toBe('Solution content')

    deleteSolution('chapter-01', '1')
    expect(getSolution('chapter-01', '1')).toBe('')
  })
})
