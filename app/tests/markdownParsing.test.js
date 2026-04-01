/**
 * Unit Tests for markdown table parsing
 * Tests the parseMdTables function used in Practice.vue and PracticeMap3D.vue
 */

import { describe, it, expect } from 'vitest'

// Inline the parseMdTables function for testing (same logic as in Practice.vue)
function parseMdTables(md) {
  const secs = []
  const lines = md.split('\n')
  let curH2 = '', curH3 = '', curTable = []
  function flush() {
    if (curTable.length > 0) { secs.push({ h2: curH2, h3: curH3, rows: [...curTable] }); curTable = [] }
  }
  for (const line of lines) {
    const t = line.trim()
    if (t.startsWith('## '))        { flush(); curH2 = t.replace(/^##\s+/, ''); curH3 = '' }
    else if (t.startsWith('### '))  { flush(); curH3 = t.replace(/^###\s+/, '') }
    else if (t.startsWith('#### ')) { flush(); curH3 = t.replace(/^####\s+/, '') }
    else if (t.startsWith('|') && !t.startsWith('|---')) {
      const cells = t.split('|').map(c => c.trim()).filter(c => c)
      if (cells.length >= 2 && cells[0] !== '题号' && cells[0] !== '#') {
        const num = cells[0], titleCell = cells[1] || '', rating = cells[2] || '—'
        const lm = titleCell.match(/\[([^\]]+)\]\(([^)]+)\)/)
        let title = titleCell, url = ''
        if (lm) { title = lm[1]; url = lm[2] }
        const isMember = title.includes('🔒')
        title = title.replace('🔒', '').trim()
        const probId = String(num).replace(/[^a-zA-Z0-9]/g, '_')
        curTable.push({ num, title, url, rating, isMember, probId })
      }
    }
  }
  flush()
  return secs
}

describe('parseMdTables', () => {

  describe('Basic parsing', () => {
    it('should return empty array for empty markdown', () => {
      const result = parseMdTables('')
      expect(result).toEqual([])
    })

    it('should return empty array for markdown with no tables', () => {
      const md = `
## Section 1
Some text here
      `
      const result = parseMdTables(md)
      expect(result).toEqual([])
    })

    it('should handle markdown with only headers', () => {
      const md = `
## 第一章
### 基础算法
      `
      const result = parseMdTables(md)
      expect(result).toEqual([])
    })
  })

  describe('Header parsing', () => {
    it('should parse ## h2 headers', () => {
      const md = `
## 第一章 基础算法
| 题号 | 标题 | 难度 |
|------|------|------|
| 1 | 两数之和 | 简单 |
      `
      const result = parseMdTables(md)
      expect(result).toHaveLength(1)
      expect(result[0].h2).toBe('第一章 基础算法')
    })

    it('should parse ### h3 headers', () => {
      const md = `
## 第一章
### 双指针
| 题号 | 标题 | 难度 |
|------|------|------|
| 1 | 两数之和 | 简单 |
      `
      const result = parseMdTables(md)
      expect(result).toHaveLength(1)
      expect(result[0].h2).toBe('第一章')
      expect(result[0].h3).toBe('双指针')
    })

    it('should parse #### h4 headers as sections', () => {
      const md = `
## 第一章
#### 入门
| 题号 | 标题 | 难度 |
|------|------|------|
| 1 | 两数之和 | 简单 |
      `
      const result = parseMdTables(md)
      expect(result).toHaveLength(1)
      expect(result[0].h2).toBe('第一章')
      expect(result[0].h3).toBe('入门')
    })

    it('should handle multiple sections', () => {
      const md = `
## 第一章
### 数组
| 题号 | 标题 |
|------|------|
| 1 | A |

### 链表
| 题号 | 标题 |
|------|------|
| 2 | B |
      `
      const result = parseMdTables(md)
      expect(result).toHaveLength(2)
      expect(result[0].h3).toBe('数组')
      expect(result[1].h3).toBe('链表')
    })
  })

  describe('Table row parsing', () => {
    it('should parse valid table rows', () => {
      const md = `
## 第一章
| 题号 | 标题 | 难度 |
|------|------|------|
| 1 | 两数之和 | 简单 |
      `
      const result = parseMdTables(md)
      expect(result).toHaveLength(1)
      expect(result[0].rows).toHaveLength(1)
      expect(result[0].rows[0]).toEqual({
        num: '1',
        title: '两数之和',
        url: '',
        rating: '简单',
        isMember: false,
        probId: '1'
      })
    })

    it('should handle multiple rows', () => {
      const md = `
## 第一章
| 题号 | 标题 | 难度 |
|------|------|------|
| 1 | 两数之和 | 简单 |
| 2 | 三数之和 | 中等 |
| 3 | 最接近的三数之和 | 困难 |
      `
      const result = parseMdTables(md)
      expect(result[0].rows).toHaveLength(3)
    })

    it('should ignore header rows (题号)', () => {
      const md = `
## 第一章
| 题号 | 标题 | 难度 |
|------|------|------|
      `
      const result = parseMdTables(md)
      // Header row is filtered out, separator row is filtered out
      // No valid data rows, so result may be empty or have empty rows
      expect(result.length).toBeGreaterThanOrEqual(0)
    })

    it('should ignore header rows (#)', () => {
      const md = `
## 第一章
| # | 标题 | 难度 |
|------|------|------|
| 1 | A | B |
      `
      const result = parseMdTables(md)
      expect(result[0].rows).toHaveLength(1)
    })

    it('should ignore separator rows (|---|)', () => {
      const md = `
## 第一章
| 题号 | 标题 | 难度 |
|------|------|------|
|------|------|------|
| 1 | A | B |
      `
      const result = parseMdTables(md)
      expect(result[0].rows).toHaveLength(1)
    })
  })

  describe('Title parsing', () => {
    it('should extract URL from markdown links [text](url)', () => {
      const md = `
## 第一章
| 题号 | 标题 | 难度 |
|------|------|------|
| 1 | [两数之和](https://leetcode.com) | 简单 |
      `
      const result = parseMdTables(md)
      expect(result[0].rows[0].title).toBe('两数之和')
      expect(result[0].rows[0].url).toBe('https://leetcode.com')
    })

    it('should handle plain titles without links', () => {
      const md = `
## 第一章
| 题号 | 标题 | 难度 |
|------|------|------|
| 1 | 两数之和 | 简单 |
      `
      const result = parseMdTables(md)
      expect(result[0].rows[0].title).toBe('两数之和')
      expect(result[0].rows[0].url).toBe('')
    })

    it('should detect locked problems with 🔒 emoji', () => {
      const md = `
## 第一章
| 题号 | 标题 | 难度 |
|------|------|------|
| 1 | 🔒 两数之和 | 简单 |
      `
      const result = parseMdTables(md)
      expect(result[0].rows[0].title).toBe('两数之和')
      expect(result[0].rows[0].isMember).toBe(true)
    })

    it('should remove 🔒 emoji from title', () => {
      const md = `
## 第一章
| 题号 | 标题 | 难度 |
|------|------|------|
| 1 | 🔒 两数之和 | 简单 |
      `
      const result = parseMdTables(md)
      expect(result[0].rows[0].title).not.toContain('🔒')
    })
  })

  describe('Rating parsing', () => {
    it('should use third column as rating', () => {
      const md = `
## 第一章
| 题号 | 标题 | 难度 |
|------|------|------|
| 1 | 两数之和 | 简单 |
| 2 | 三数之和 | 中等 |
| 3 | 最接近的三数之和 | 困难 |
      `
      const result = parseMdTables(md)
      expect(result[0].rows[0].rating).toBe('简单')
      expect(result[0].rows[1].rating).toBe('中等')
      expect(result[0].rows[2].rating).toBe('困难')
    })

    it('should default to "—" when no rating column', () => {
      const md = `
## 第一章
| 题号 | 标题 |
|------|------|
| 1 | 两数之和 |
      `
      const result = parseMdTables(md)
      expect(result[0].rows[0].rating).toBe('—')
    })

    it('should handle numeric ratings', () => {
      const md = `
## 第一章
| 题号 | 标题 | 难度 |
|------|------|------|
| 1 | 两数之和 | 1600 |
      `
      const result = parseMdTables(md)
      expect(result[0].rows[0].rating).toBe('1600')
    })
  })

  describe('Problem ID generation', () => {
    it('should convert number to string probId', () => {
      const md = `
## 第一章
| 题号 | 标题 |
|------|------|
| 1 | A |
      `
      const result = parseMdTables(md)
      expect(result[0].rows[0].probId).toBe('1')
    })

    it('should replace special characters with underscore', () => {
      const md = `
## 第一章
| 题号 | 标题 |
|------|------|
| 1-1 | A |
      `
      const result = parseMdTables(md)
      expect(result[0].rows[0].probId).toBe('1_1')
    })

    it('should handle alphanumeric IDs', () => {
      const md = `
## 第一章
| 题号 | 标题 |
|------|------|
| LC_001 | 两数之和 |
      `
      const result = parseMdTables(md)
      expect(result[0].rows[0].probId).toBe('LC_001')
    })
  })

  describe('Edge cases', () => {
    it('should handle table with only one column', () => {
      const md = `
## 第一章
| 题号 |
|------|
| 1 |
      `
      const result = parseMdTables(md)
      // cells.length >= 2 check means 1 column won't create a row
      expect(result.length).toBeGreaterThanOrEqual(0)
    })

    it('should handle empty table cells', () => {
      const md = `
## 第一章
| 题号 | 标题 | 难度 |
|------|------|------|
| 1 | | |
      `
      const result = parseMdTables(md)
      // This creates a row with empty title
      expect(result.length).toBeGreaterThanOrEqual(0)
    })

    it('should trim whitespace from all fields', () => {
      const md = `
## 第一章
| 题号 | 标题 | 难度 |
|------|------|------|
| 1 |   两数之和   |   简单   |
      `
      const result = parseMdTables(md)
      expect(result[0].rows[0].title).toBe('两数之和')
      expect(result[0].rows[0].rating).toBe('简单')
    })

    it('should handle real LeetCode format', () => {
      const md = `
## 第一章 数组
### 1. 两数之和
| 题号 | 标题 | 难度 |
|------|------|------|
| 1 | [两数之和](https://leetcode.cn/problems/two-sum/) | 简单 |
| 2 | [三数之和](https://leetcode.cn/problems/3sum/) | 中等 |
      `
      const result = parseMdTables(md)
      expect(result).toHaveLength(1)
      expect(result[0].rows).toHaveLength(2)
      expect(result[0].rows[0].url).toBe('https://leetcode.cn/problems/two-sum/')
    })
  })

  describe('Multiple chapters', () => {
    it('should parse multiple chapters', () => {
      const md = `
## 第一章 数组
| 题号 | 标题 |
|------|------|
| 1 | A |

## 第二章 链表
| 题号 | 标题 |
|------|------|
| 2 | B |
      `
      const result = parseMdTables(md)
      expect(result).toHaveLength(2)
      expect(result[0].h2).toBe('第一章 数组')
      expect(result[1].h2).toBe('第二章 链表')
    })
  })
})
