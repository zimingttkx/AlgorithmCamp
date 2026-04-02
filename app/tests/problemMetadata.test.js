import { describe, it, expect, beforeEach } from 'vitest'
import { useProblemMetadata } from '../src/composables/useProblemMetadata.js'

describe('useProblemMetadata', () => {
  describe('getDifficultyFromRating', () => {
    const { getDifficultyFromRating } = useProblemMetadata()

    it('should return easy for ratings below 1600', () => {
      expect(getDifficultyFromRating('1263')).toBe('easy')
      expect(getDifficultyFromRating('1400')).toBe('easy')
      expect(getDifficultyFromRating('1599')).toBe('easy')
    })

    it('should return medium for ratings 1600-1999', () => {
      expect(getDifficultyFromRating('1600')).toBe('medium')
      expect(getDifficultyFromRating('1800')).toBe('medium')
      expect(getDifficultyFromRating('1999')).toBe('medium')
    })

    it('should return hard for ratings 2000 and above', () => {
      expect(getDifficultyFromRating('2000')).toBe('hard')
      expect(getDifficultyFromRating('2200')).toBe('hard')
      expect(getDifficultyFromRating('2500')).toBe('hard')
    })

    it('should return medium for missing or invalid ratings', () => {
      expect(getDifficultyFromRating('—')).toBe('medium')
      expect(getDifficultyFromRating('')).toBe('medium')
      expect(getDifficultyFromRating(null)).toBe('medium')
      expect(getDifficultyFromRating(undefined)).toBe('medium')
    })
  })

  describe('loadAllMetadata', () => {
    it('should load metadata from chapter files', async () => {
      const { loadAllMetadata, metadataCache } = useProblemMetadata()
      await loadAllMetadata()
      expect(Object.keys(metadataCache.value).length).toBeGreaterThan(0)
    })
  })
})