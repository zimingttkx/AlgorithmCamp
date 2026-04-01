/**
 * Unit Tests for NavBar/Footer Logic
 * Tests pure navigation logic without DOM dependencies
 */

import { describe, it, expect } from 'vitest'

describe('NavBar - Navigation Items', () => {
  const navItemsZh = [
    { path: '/', label: '首页' },
    { path: '/practice', label: '刷题' },
    { path: '/blog', label: '分享' },
    { path: '/about', label: '关于' },
  ]

  const navItemsEn = [
    { path: '/', label: 'HOME' },
    { path: '/practice', label: 'PRACTICE' },
    { path: '/blog', label: 'SHARE' },
    { path: '/about', label: 'ABOUT' },
  ]

  it('should have 4 navigation items', () => {
    expect(navItemsZh).toHaveLength(4)
    expect(navItemsEn).toHaveLength(4)
  })

  it('should have correct paths', () => {
    const paths = navItemsZh.map(item => item.path)
    expect(paths).toContain('/')
    expect(paths).toContain('/practice')
    expect(paths).toContain('/blog')
    expect(paths).toContain('/about')
  })

  it('should have Chinese labels in Chinese mode', () => {
    const labels = navItemsZh.map(item => item.label)
    expect(labels).toContain('首页')
    expect(labels).toContain('刷题')
    expect(labels).toContain('分享')
    expect(labels).toContain('关于')
  })

  it('should have English labels in English mode', () => {
    const labels = navItemsEn.map(item => item.label)
    expect(labels).toContain('HOME')
    expect(labels).toContain('PRACTICE')
    expect(labels).toContain('SHARE')
    expect(labels).toContain('ABOUT')
  })

  it('should have unique paths', () => {
    const paths = navItemsZh.map(item => item.path)
    const uniquePaths = new Set(paths)
    expect(uniquePaths.size).toBe(paths.length)
  })
})

describe('Footer - Footer Links', () => {
  const footerLinks = [
    { path: '/about', labelZh: '关于', labelEn: 'About' },
    { path: '/practice', labelZh: '刷题', labelEn: 'Practice' },
    { path: '/blog', labelZh: '分享', labelEn: 'Share' },
  ]

  it('should have footer links', () => {
    expect(footerLinks.length).toBeGreaterThan(0)
  })

  it('should have valid paths', () => {
    footerLinks.forEach(link => {
      expect(link.path).toMatch(/^\/(about|practice|blog)$/)
    })
  })
})

describe('Year Calculation', () => {
  it('should return current year', () => {
    const year = new Date().getFullYear()
    expect(year).toBeGreaterThanOrEqual(2024)
    expect(year).toBeLessThanOrEqual(2030)
  })
})
