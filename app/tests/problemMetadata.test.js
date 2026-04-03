/**
 * Comprehensive Test Suite for useProblemMetadata
 * Tests the exported composable functions
 */

import { describe, it, expect, vi } from 'vitest'

describe('useProblemMetadata - exported API', () => {
  it('should export useProblemMetadata composable', async () => {
    const { useProblemMetadata } = await import('../src/composables/useProblemMetadata.js')
    expect(useProblemMetadata).toBeDefined()
  })

  it('should return all required functions', async () => {
    const { useProblemMetadata } = await import('../src/composables/useProblemMetadata.js')
    const result = useProblemMetadata()
    
    expect(result.metadataCache).toBeDefined()
    expect(result.isLoading).toBeDefined()
    expect(result.loadError).toBeDefined()
    expect(result.loadAllMetadata).toBeDefined()
    expect(result.getProblem).toBeDefined()
    expect(result.getDifficultyFromRating).toBeDefined()
    expect(result.getChapterProblems).toBeDefined()
  })
})

describe('useProblemMetadata - getDifficultyFromRating via composable', () => {
  it('should classify easy problems (rating < 1600)', async () => {
    const { useProblemMetadata } = await import('../src/composables/useProblemMetadata.js')
    const { getDifficultyFromRating } = useProblemMetadata()
    
    expect(getDifficultyFromRating('1200')).toBe('easy')
    expect(getDifficultyFromRating('1400')).toBe('easy')
    expect(getDifficultyFromRating('1599')).toBe('easy')
  })

  it('should classify medium problems (1600 <= rating < 2000)', async () => {
    const { useProblemMetadata } = await import('../src/composables/useProblemMetadata.js')
    const { getDifficultyFromRating } = useProblemMetadata()
    
    expect(getDifficultyFromRating('1600')).toBe('medium')
    expect(getDifficultyFromRating('1800')).toBe('medium')
    expect(getDifficultyFromRating('1999')).toBe('medium')
  })

  it('should classify hard problems (rating >= 2000)', async () => {
    const { useProblemMetadata } = await import('../src/composables/useProblemMetadata.js')
    const { getDifficultyFromRating } = useProblemMetadata()
    
    expect(getDifficultyFromRating('2000')).toBe('hard')
    expect(getDifficultyFromRating('2500')).toBe('hard')
    expect(getDifficultyFromRating('3000')).toBe('hard')
  })

  it('should handle missing or invalid ratings', async () => {
    const { useProblemMetadata } = await import('../src/composables/useProblemMetadata.js')
    const { getDifficultyFromRating } = useProblemMetadata()
    
    expect(getDifficultyFromRating(null)).toBe('medium')
    expect(getDifficultyFromRating(undefined)).toBe('medium')
    expect(getDifficultyFromRating('—')).toBe('medium')
    expect(getDifficultyFromRating('invalid')).toBe('medium')
  })
})
