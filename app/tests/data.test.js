/**
 * Unit Tests for data.js - Chapter and Site Data
 * Tests all static data structures and helper functions
 */

import { describe, it, expect } from 'vitest'
import { CHAPTERS, BLOG_POSTS, SITES_DATA } from '../src/composables/data.js'

describe('data.js - CHAPTERS', () => {
  it('should have exactly 12 chapters', () => {
    expect(CHAPTERS).toHaveLength(12)
  })

  it('should have correct chapter IDs', () => {
    const ids = CHAPTERS.map(ch => ch.id)
    expect(ids).toEqual([
      'chapter-01', 'chapter-02', 'chapter-03', 'chapter-04',
      'chapter-05', 'chapter-06', 'chapter-07', 'chapter-08',
      'chapter-09', 'chapter-10', 'chapter-11', 'chapter-12'
    ])
  })

  it('should have required properties for each chapter', () => {
    CHAPTERS.forEach(ch => {
      expect(ch.id).toBeDefined()
      expect(ch.title).toBeDefined()
      expect(typeof ch.title).toBe('string')
      expect(ch.short).toBeDefined()
      expect(typeof ch.short).toBe('string')
      expect(ch.file).toBeDefined()
      expect(ch.file).toMatch(/^docs\/chapter-\d+\.md$/)
      expect(ch.color).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(ch.light).toMatch(/^#[0-9a-fA-F]{6}$/)
    })
  })

  it('should have valid markdown file paths', () => {
    CHAPTERS.forEach(ch => {
      expect(ch.file).toBe(`docs/chapter-${ch.id.split('-')[1]}.md`)
    })
  })

  it('should have unique IDs', () => {
    const ids = CHAPTERS.map(ch => ch.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('should have non-empty titles', () => {
    CHAPTERS.forEach(ch => {
      expect(ch.title.length).toBeGreaterThan(0)
      expect(ch.short.length).toBeGreaterThan(0)
    })
  })

  it('should have color contrast (light should be lighter than color)', () => {
    CHAPTERS.forEach(ch => {
      const colorLum = hexToLum(ch.color)
      const lightLum = hexToLum(ch.light)
      expect(lightLum).toBeGreaterThan(colorLum)
    })
  })

  it('chapter titles should match known topics', () => {
    const titles = CHAPTERS.map(ch => ch.title)
    expect(titles).toContain('滑动窗口与双指针')
    expect(titles).toContain('二分算法')
    expect(titles).toContain('动态规划')
    expect(titles).toContain('图论算法')
  })
})

describe('data.js - BLOG_POSTS', () => {
  it('should be an array', () => {
    expect(Array.isArray(BLOG_POSTS)).toBe(true)
  })

  // Blog posts can be empty but structure should be valid if populated
  it('should have valid structure if posts exist', () => {
    BLOG_POSTS.forEach(post => {
      if (post.id) {
        expect(typeof post.id).toBe('string')
        expect(post.title).toBeDefined()
        expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(post.desc).toBeDefined()
        expect(Array.isArray(post.tags)).toBe(true)
      }
    })
  })
})

describe('data.js - SITES_DATA', () => {
  it('should be an array', () => {
    expect(Array.isArray(SITES_DATA)).toBe(true)
  })

  it('should have required category properties', () => {
    SITES_DATA.forEach(category => {
      expect(category.category).toBeDefined()
      expect(category.categoryEn).toBeDefined()
      expect(Array.isArray(category.sites)).toBe(true)
    })
  })

  it('should have valid site structure', () => {
    SITES_DATA.forEach(category => {
      category.sites.forEach(site => {
        expect(site.name).toBeDefined()
        expect(site.nameEn).toBeDefined()
        expect(site.url).toMatch(/^https?:\/\//)
        expect(site.desc).toBeDefined()
        expect(site.descEn).toBeDefined()
        expect(site.color).toMatch(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
      })
    })
  })

  it('should have algorithm category with LeetCode', () => {
    const algoCategory = SITES_DATA.find(c => c.categoryEn === 'Algorithm')
    expect(algoCategory).toBeDefined()
    const leetCode = algoCategory.sites.find(s => s.name === 'LeetCode')
    expect(leetCode).toBeDefined()
    expect(leetCode.url).toBe('https://leetcode.com')
  })

  it('should have AI models category', () => {
    const aiCategory = SITES_DATA.find(c => c.categoryEn === 'AI Models')
    expect(aiCategory).toBeDefined()
    expect(aiCategory.sites.length).toBeGreaterThan(5)
  })

  it('should have GitHub, Claude, ChatGPT', () => {
    const allSites = SITES_DATA.flatMap(c => c.sites)
    const names = allSites.map(s => s.name)
    expect(names).toContain('GitHub')
    expect(names).toContain('Claude')
    expect(names).toContain('ChatGPT')
  })
})

// Helper function for color luminance calculation
function hexToLum(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const rs = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
  const gs = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
  const bs = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}
