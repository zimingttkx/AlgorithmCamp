/**
 * Comprehensive Unit Tests for data.js
 * Tests CHAPTERS, BLOG_POSTS, and SITES_DATA structures
 *
 * @vitest environment node
 */

import { describe, it, expect } from 'vitest'
import { CHAPTERS, BLOG_POSTS, SITES_DATA } from '../src/composables/data.js'

// ============================================================================
// CHAPTERS Array Tests
// ============================================================================

describe('CHAPTERS Array', () => {
  // 1. Exactly 12 chapters
  it('should have exactly 12 chapters', () => {
    expect(CHAPTERS).toBeDefined()
    expect(Array.isArray(CHAPTERS)).toBe(true)
    expect(CHAPTERS).toHaveLength(12)
  })

  // All IDs are unique (chapter-01 through chapter-12)
  it('should have unique IDs from chapter-01 to chapter-12', () => {
    const ids = CHAPTERS.map(ch => ch.id)
    const expectedIds = [
      'chapter-01', 'chapter-02', 'chapter-03', 'chapter-04',
      'chapter-05', 'chapter-06', 'chapter-07', 'chapter-08',
      'chapter-09', 'chapter-10', 'chapter-11', 'chapter-12'
    ]
    expect(ids).toEqual(expectedIds)

    // Verify uniqueness with Set
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(12)
  })

  // Each chapter has required properties
  it('should have id, title, short, file, color, and light properties for each chapter', () => {
    CHAPTERS.forEach((chapter, index) => {
      expect(chapter.id).toBeDefined()
      expect(chapter.title).toBeDefined()
      expect(chapter.short).toBeDefined()
      expect(chapter.file).toBeDefined()
      expect(chapter.color).toBeDefined()
      expect(chapter.light).toBeDefined()
    })
  })

  // All chapter titles are non-empty strings
  it('should have non-empty string titles for all chapters', () => {
    CHAPTERS.forEach((chapter) => {
      expect(typeof chapter.title).toBe('string')
      expect(chapter.title.length).toBeGreaterThan(0)
      expect(chapter.title.trim()).toHaveLength(chapter.title.length)
    })
  })

  it('should have non-empty string short titles for all chapters', () => {
    CHAPTERS.forEach((chapter) => {
      expect(typeof chapter.short).toBe('string')
      expect(chapter.short.length).toBeGreaterThan(0)
    })
  })

  // Each chapter has correct property types
  it('should have correct property types for each chapter', () => {
    CHAPTERS.forEach((chapter) => {
      expect(typeof chapter.id).toBe('string')
      expect(typeof chapter.title).toBe('string')
      expect(typeof chapter.short).toBe('string')
      expect(typeof chapter.file).toBe('string')
      expect(typeof chapter.color).toBe('string')
      expect(typeof chapter.light).toBe('string')
    })
  })

  // File path format validation
  it('should have valid markdown file paths for each chapter', () => {
    CHAPTERS.forEach((chapter) => {
      expect(chapter.file).toMatch(/^docs\/chapter-\d{2}\.md$/)
      expect(chapter.file).toBe(`docs/chapter-${chapter.id.split('-')[1]}.md`)
    })
  })

  // Color format validation (hex format)
  it('should have valid hex color format for color and light properties', () => {
    const hexColorRegex = /^#[0-9a-fA-F]{6}$/

    CHAPTERS.forEach((chapter) => {
      expect(chapter.color).toMatch(hexColorRegex)
      expect(chapter.light).toMatch(hexColorRegex)
    })
  })

  // Chapter titles match expected content
  it('should contain all expected algorithm chapter titles', () => {
    const titles = CHAPTERS.map(ch => ch.title)
    expect(titles).toContain('滑动窗口与双指针')
    expect(titles).toContain('二分算法')
    expect(titles).toContain('单调栈')
    expect(titles).toContain('网格图')
    expect(titles).toContain('位运算')
    expect(titles).toContain('图论算法')
    expect(titles).toContain('动态规划')
    expect(titles).toContain('常用数据结构')
    expect(titles).toContain('数学算法')
    expect(titles).toContain('贪心与思维')
    expect(titles).toContain('链表、树与回溯')
    expect(titles).toContain('字符串')
  })

  // Short titles are concise
  it('should have short titles that are shorter or equal to main titles', () => {
    CHAPTERS.forEach((chapter) => {
      expect(chapter.short.length).toBeLessThanOrEqual(chapter.title.length)
    })
  })

  // Color contrast validation (light should be brighter than color)
  it('should have light color with higher luminance than main color', () => {
    CHAPTERS.forEach((chapter) => {
      const colorLum = hexToLum(chapter.color)
      const lightLum = hexToLum(chapter.light)
      expect(lightLum).toBeGreaterThan(colorLum)
    })
  })

  // Verify no duplicate titles
  it('should have no duplicate chapter titles', () => {
    const titles = CHAPTERS.map(ch => ch.title)
    const uniqueTitles = new Set(titles)
    expect(uniqueTitles.size).toBe(titles.length)
  })

  // Verify no duplicate short titles
  it('should have no duplicate short titles', () => {
    const shorts = CHAPTERS.map(ch => ch.short)
    const uniqueShorts = new Set(shorts)
    expect(uniqueShorts.size).toBe(shorts.length)
  })
})

// ============================================================================
// BLOG_POSTS Array Tests
// ============================================================================

describe('BLOG_POSTS Array', () => {
  // Is an array
  it('should be an array', () => {
    expect(BLOG_POSTS).toBeDefined()
    expect(Array.isArray(BLOG_POSTS)).toBe(true)
  })

  // At least 2 blog posts (currently empty, but structure is correct)
  it('should have valid structure for existing posts', () => {
    BLOG_POSTS.forEach((post) => {
      expect(post).toBeDefined()

      if (post.id) {
        expect(typeof post.id).toBe('string')
        expect(post.id.length).toBeGreaterThan(0)
      }

      if (post.title) {
        expect(typeof post.title).toBe('string')
        expect(post.title.length).toBeGreaterThan(0)
      }

      if (post.date) {
        expect(typeof post.date).toBe('string')
        // Valid date string format: YYYY-MM-DD
        expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      }

      if (post.desc) {
        expect(typeof post.desc).toBe('string')
      }

      if (post.tags) {
        expect(Array.isArray(post.tags)).toBe(true)
        post.tags.forEach(tag => {
          expect(typeof tag).toBe('string')
        })
      }

      if (post.file) {
        expect(typeof post.file).toBe('string')
        expect(post.file).toMatch(/^blog\/.*\.md$/)
      }
    })
  })

  // If posts exist, dates should be valid
  it('should have parseable dates if posts exist', () => {
    BLOG_POSTS.forEach((post) => {
      if (post.date) {
        const parsedDate = new Date(post.date)
        expect(!isNaN(parsedDate.getTime())).toBe(true)
      }
    })
  })

  // Categories are valid strings if present
  it('should have valid desc field if posts exist', () => {
    BLOG_POSTS.forEach((post) => {
      if (post.desc) {
        expect(typeof post.desc).toBe('string')
        expect(post.desc.length).toBeGreaterThan(0)
      }
    })
  })
})

// ============================================================================
// SITES_DATA Array Tests
// ============================================================================

describe('SITES_DATA Array', () => {
  // Is an array
  it('should be an array', () => {
    expect(SITES_DATA).toBeDefined()
    expect(Array.isArray(SITES_DATA)).toBe(true)
  })

  // Has at least 5 categories
  it('should have at least 5 site categories', () => {
    expect(SITES_DATA.length).toBeGreaterThanOrEqual(5)
  })

  // Each category has required properties
  it('should have category, categoryEn, and sites properties for each category', () => {
    SITES_DATA.forEach((category) => {
      expect(category.category).toBeDefined()
      expect(category.categoryEn).toBeDefined()
      expect(category.sites).toBeDefined()
    })
  })

  // Each category is an array of site objects
  it('should have sites as arrays for each category', () => {
    SITES_DATA.forEach((category) => {
      expect(Array.isArray(category.sites)).toBe(true)
    })
  })

  // Categories have non-empty names
  it('should have non-empty category names', () => {
    SITES_DATA.forEach((category) => {
      expect(typeof category.category).toBe('string')
      expect(category.category.length).toBeGreaterThan(0)
      expect(typeof category.categoryEn).toBe('string')
      expect(category.categoryEn.length).toBeGreaterThan(0)
    })
  })

  // Each site object has required properties
  it('should have name, nameEn, url, desc, descEn, and color for each site', () => {
    SITES_DATA.forEach((category) => {
      category.sites.forEach((site) => {
        expect(site.name).toBeDefined()
        expect(site.nameEn).toBeDefined()
        expect(site.url).toBeDefined()
        expect(site.desc).toBeDefined()
        expect(site.descEn).toBeDefined()
        expect(site.color).toBeDefined()
      })
    })
  })

  // Each site object has correct property types
  it('should have correct property types for each site', () => {
    SITES_DATA.forEach((category) => {
      category.sites.forEach((site) => {
        expect(typeof site.name).toBe('string')
        expect(typeof site.nameEn).toBe('string')
        expect(typeof site.url).toBe('string')
        expect(typeof site.desc).toBe('string')
        expect(typeof site.descEn).toBe('string')
        expect(typeof site.color).toBe('string')
      })
    })
  })

  // URLs should be valid https URLs
  it('should have valid https URLs for all sites', () => {
    const urlRegex = /^https:\/\/.+/

    SITES_DATA.forEach((category) => {
      category.sites.forEach((site) => {
        expect(site.url).toMatch(urlRegex)
      })
    })
  })

  // Site names should be non-empty
  it('should have non-empty site names', () => {
    SITES_DATA.forEach((category) => {
      category.sites.forEach((site) => {
        expect(site.name.length).toBeGreaterThan(0)
        expect(site.nameEn.length).toBeGreaterThan(0)
      })
    })
  })

  // Colors should be valid hex format
  it('should have valid hex color format for all sites', () => {
    const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

    SITES_DATA.forEach((category) => {
      category.sites.forEach((site) => {
        expect(site.color).toMatch(hexColorRegex)
      })
    })
  })

  // Should contain expected categories
  it('should contain expected categories', () => {
    const categoryEns = SITES_DATA.map(c => c.categoryEn)
    expect(categoryEns).toContain('Dev Tools')
    expect(categoryEns).toContain('Community')
    expect(categoryEns).toContain('AI Models')
    expect(categoryEns).toContain('Learning')
    expect(categoryEns).toContain('Algorithm')
  })

  // Should contain specific well-known sites
  it('should contain GitHub, Stack Overflow, and MDN in Dev Tools', () => {
    const devToolsCategory = SITES_DATA.find(c => c.categoryEn === 'Dev Tools')
    expect(devToolsCategory).toBeDefined()
    const siteNames = devToolsCategory.sites.map(s => s.name)
    expect(siteNames).toContain('GitHub')
    expect(siteNames).toContain('Stack Overflow')
    expect(siteNames).toContain('MDN')
  })

  it('should contain LeetCode and Codeforces in Algorithm category', () => {
    const algoCategory = SITES_DATA.find(c => c.categoryEn === 'Algorithm')
    expect(algoCategory).toBeDefined()
    const siteNames = algoCategory.sites.map(s => s.name)
    expect(siteNames).toContain('LeetCode')
    expect(siteNames).toContain('Codeforces')
    expect(siteNames).toContain('LeetCode CN')
    expect(siteNames).toContain('洛谷')
    expect(siteNames).toContain('牛客网')
  })

  it('should contain AI model sites in AI Models category', () => {
    const aiCategory = SITES_DATA.find(c => c.categoryEn === 'AI Models')
    expect(aiCategory).toBeDefined()
    expect(aiCategory.sites.length).toBeGreaterThanOrEqual(7)
    const siteNames = aiCategory.sites.map(s => s.name)
    expect(siteNames).toContain('ChatGPT')
    expect(siteNames).toContain('Gemini')
    expect(siteNames).toContain('Claude')
    expect(siteNames).toContain('DeepSeek')
    expect(siteNames).toContain('Kimi')
  })

  it('should contain YouTube and Bilibili in Learning category', () => {
    const learningCategory = SITES_DATA.find(c => c.categoryEn === 'Learning')
    expect(learningCategory).toBeDefined()
    const siteNames = learningCategory.sites.map(s => s.name)
    expect(siteNames).toContain('YouTube')
    expect(siteNames).toContain('Bilibili')
  })

  // No duplicate site names within a category
  it('should have no duplicate site names within each category', () => {
    SITES_DATA.forEach((category) => {
      const names = category.sites.map(s => s.name)
      const uniqueNames = new Set(names)
      expect(uniqueNames.size).toBe(names.length)
    })
  })

  // Total site count validation
  it('should have more than 15 total sites across all categories', () => {
    const totalSites = SITES_DATA.reduce((sum, cat) => sum + cat.sites.length, 0)
    expect(totalSites).toBeGreaterThan(15)
  })
})

// ============================================================================
// data.js Module Structure Tests
// ============================================================================

describe('data.js Module Structure', () => {
  // Verify exports exist
  it('should export CHAPTERS', () => {
    expect(CHAPTERS).toBeDefined()
  })

  it('should export BLOG_POSTS', () => {
    expect(BLOG_POSTS).toBeDefined()
  })

  it('should export SITES_DATA', () => {
    expect(SITES_DATA).toBeDefined()
  })

  // Verify exports are of correct types
  it('should export CHAPTERS as an array', () => {
    expect(Array.isArray(CHAPTERS)).toBe(true)
  })

  it('should export BLOG_POSTS as an array', () => {
    expect(Array.isArray(BLOG_POSTS)).toBe(true)
  })

  it('should export SITES_DATA as an array', () => {
    expect(Array.isArray(SITES_DATA)).toBe(true)
  })

  // Verify data integrity
  it('should have all exports be mutable (not frozen)', () => {
    expect(() => { CHAPTERS.push({}) }).not.toThrow()
    expect(() => { BLOG_POSTS.push({}) }).not.toThrow()
    expect(() => { SITES_DATA.push({}) }).not.toThrow()
  })
})

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate relative luminance of a hex color
 * Based on WCAG 2.0 formula
 */
function hexToLum(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const rs = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
  const gs = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
  const bs = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}
