/**
 * Comprehensive Unit Tests for i18n.js - Internationalization composable
 *
 * Tests cover:
 * 1. t(key) function - translation function with zh/en parameters
 * 2. isZh computed - boolean computed reflecting current language
 * 3. toggle() function - language switching
 * 4. lang ref - reactive language state
 * 5. Translation behavior verification
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useLang } from '../src/composables/i18n.js'

describe('useLang Composable', () => {
  // Store original lang value to restore after tests
  const originalLang = 'zh'

  beforeEach(() => {
    // Reset language to Chinese before each test
    const { lang } = useLang()
    lang.value = 'zh'
  })

  afterEach(() => {
    // Clean up after each test
    const { lang } = useLang()
    lang.value = originalLang
  })

  describe('1. t() translation function', () => {
    it('should return Chinese text when lang is zh', () => {
      const { t, lang } = useLang()
      lang.value = 'zh'
      expect(t('中文文本', 'English text')).toBe('中文文本')
    })

    it('should return English text when lang is en', () => {
      const { t, lang } = useLang()
      lang.value = 'en'
      expect(t('中文文本', 'English text')).toBe('English text')
    })

    it('should return string type for Chinese translations', () => {
      const { t, lang } = useLang()
      lang.value = 'zh'
      const result = t('导航', 'Nav')
      expect(typeof result).toBe('string')
    })

    it('should return string type for English translations', () => {
      const { t, lang } = useLang()
      lang.value = 'en'
      const result = t('导航', 'Nav')
      expect(typeof result).toBe('string')
    })

    it('should switch translation when lang changes', () => {
      const { t, lang } = useLang()
      lang.value = 'zh'
      const zhResult = t('主页', 'Home')
      lang.value = 'en'
      const enResult = t('主页', 'Home')
      expect(zhResult).toBe('主页')
      expect(enResult).toBe('Home')
    })

    it('should handle empty strings correctly', () => {
      const { t, lang } = useLang()
      lang.value = 'zh'
      expect(t('', '')).toBe('')
      expect(t('', 'Hello')).toBe('')
      lang.value = 'en'
      expect(t('', '')).toBe('')
      expect(t('你好', '')).toBe('')
    })

    it('should handle unicode and special characters', () => {
      const { t, lang } = useLang()
      lang.value = 'zh'
      expect(t('中文测试', 'English Test')).toBe('中文测试')
      expect(t('繁体中文', 'Traditional Chinese')).toBe('繁体中文')
    })

    it('should handle numerical values in strings', () => {
      const { t, lang } = useLang()
      lang.value = 'zh'
      expect(t('第1章', 'Chapter 1')).toBe('第1章')
      lang.value = 'en'
      expect(t('第1章', 'Chapter 1')).toBe('Chapter 1')
    })
  })

  describe('2. isZh computed property', () => {
    it('should return boolean type', () => {
      const { isZh } = useLang()
      expect(typeof isZh.value).toBe('boolean')
    })

    it('should return true when lang is zh', () => {
      const { isZh, lang } = useLang()
      lang.value = 'zh'
      expect(isZh.value).toBe(true)
      expect(isZh.value).toStrictEqual(true)
    })

    it('should return false when lang is en', () => {
      const { isZh, lang } = useLang()
      lang.value = 'en'
      expect(isZh.value).toBe(false)
      expect(isZh.value).toStrictEqual(false)
    })

    it('should reactively change when lang changes', () => {
      const { isZh, lang } = useLang()
      expect(isZh.value).toBe(true) // default is zh

      lang.value = 'en'
      expect(isZh.value).toBe(false)

      lang.value = 'zh'
      expect(isZh.value).toBe(true)
    })

    it('should be a computed ref, not a plain value', () => {
      const { isZh } = useLang()
      expect(isZh.value).toBeDefined()
      // isZh should have a value property (ref)
      expect(isZh).toHaveProperty('value')
    })
  })

  describe('3. toggle() function', () => {
    it('should exist and be a function', () => {
      const { toggle } = useLang()
      expect(typeof toggle).toBe('function')
    })

    it('should switch from zh to en', () => {
      const { lang, toggle } = useLang()
      lang.value = 'zh'
      toggle()
      expect(lang.value).toBe('en')
    })

    it('should switch from en to zh', () => {
      const { lang, toggle } = useLang()
      lang.value = 'en'
      toggle()
      expect(lang.value).toBe('zh')
    })

    it('should toggle correctly multiple times', () => {
      const { lang, toggle } = useLang()
      lang.value = 'zh'

      toggle() // zh -> en
      expect(lang.value).toBe('en')

      toggle() // en -> zh
      expect(lang.value).toBe('zh')

      toggle() // zh -> en
      expect(lang.value).toBe('en')

      toggle() // en -> zh
      expect(lang.value).toBe('zh')
    })

    it('should toggle lang and affect isZh', () => {
      const { isZh, toggle } = useLang()
      expect(isZh.value).toBe(true)

      toggle()
      expect(isZh.value).toBe(false)

      toggle()
      expect(isZh.value).toBe(true)
    })

    it('should toggle lang and affect t() output', () => {
      const { t, toggle } = useLang()
      const zhResult = t('中文', 'English')

      toggle()
      const enResult = t('中文', 'English')

      expect(zhResult).toBe('中文')
      expect(enResult).toBe('English')
    })
  })

  describe('4. lang ref', () => {
    it('should exist and be a ref', () => {
      const { lang } = useLang()
      expect(lang).toBeDefined()
      expect(lang).toHaveProperty('value')
    })

    it('should accept valid language values', () => {
      const { lang } = useLang()
      lang.value = 'zh'
      expect(lang.value).toBe('zh')

      lang.value = 'en'
      expect(lang.value).toBe('en')
    })

    it('should be reactive when changed', () => {
      const { lang, isZh } = useLang()
      lang.value = 'zh'
      expect(isZh.value).toBe(true)

      lang.value = 'en'
      expect(isZh.value).toBe(false)
    })
  })

  describe('5. Shared state between useLang calls', () => {
    it('should share same lang ref across calls', () => {
      const instance1 = useLang()
      const instance2 = useLang()

      instance1.lang.value = 'en'
      expect(instance2.lang.value).toBe('en')

      instance2.lang.value = 'zh'
      expect(instance1.lang.value).toBe('zh')
    })

    it('should share toggle function state', () => {
      const { lang, toggle } = useLang()
      toggle()
      expect(lang.value).toBe('en')

      const { lang: lang2, toggle: toggle2 } = useLang()
      expect(lang2.value).toBe('en')
    })
  })

  describe('6. Translation behavior with various content types', () => {
    it('should handle navigation-related translations', () => {
      const { t, lang } = useLang()
      lang.value = 'zh'

      // Common nav items
      expect(t('首页', 'Home')).toBe('首页')
      expect(t('练习', 'Practice')).toBe('练习')
      expect(t('关于', 'About')).toBe('关于')
      expect(t('博客', 'Blog')).toBe('博客')
      expect(t('项目', 'Projects')).toBe('项目')
    })

    it('should handle button label translations', () => {
      const { t, lang } = useLang()
      lang.value = 'zh'

      expect(t('开始', 'Start')).toBe('开始')
      expect(t('继续', 'Continue')).toBe('继续')
      expect(t('提交', 'Submit')).toBe('提交')
      expect(t('保存', 'Save')).toBe('保存')
    })

    it('should handle page title translations', () => {
      const { t, lang } = useLang()
      lang.value = 'zh'

      expect(t('学习进度', 'Learning Progress')).toBe('学习进度')
      expect(t('算法笔记', 'Algorithm Notes')).toBe('算法笔记')
    })

    it('should handle status message translations', () => {
      const { t, lang } = useLang()
      lang.value = 'zh'

      expect(t('加载中', 'Loading')).toBe('加载中')
      expect(t('错误', 'Error')).toBe('错误')
      expect(t('成功', 'Success')).toBe('成功')
    })

    it('should handle algorithm topic translations', () => {
      const { t, lang } = useLang()
      lang.value = 'zh'

      expect(t('排序', 'Sorting')).toBe('排序')
      expect(t('搜索', 'Search')).toBe('搜索')
      expect(t('动态规划', 'Dynamic Programming')).toBe('动态规划')
      expect(t('图论', 'Graph Theory')).toBe('图论')
    })

    it('should differentiate zh/en translations for same key concept', () => {
      const { t, lang } = useLang()

      lang.value = 'zh'
      const zhSorting = t('排序', 'Sorting')
      const zhSearch = t('搜索', 'Search')
      const zhDP = t('动态规划', 'Dynamic Programming')

      lang.value = 'en'
      const enSorting = t('排序', 'Sorting')
      const enSearch = t('搜索', 'Search')
      const enDP = t('动态规划', 'Dynamic Programming')

      // Chinese translations should differ from English
      expect(zhSorting).not.toBe(enSorting)
      expect(zhSearch).not.toBe(enSearch)
      expect(zhDP).not.toBe(enDP)

      // Each should match its respective language
      expect(zhSorting).toBe('排序')
      expect(enSorting).toBe('Sorting')
    })
  })

  describe('7. Edge cases and error handling', () => {
    it('should handle very long translation strings', () => {
      const { t, lang } = useLang()
      const longZh = '这是是一个很长的中文字符串用于测试极长的翻译内容是否能够正确处理'
      const longEn = 'This is a very long English string for testing extremely long translation content'

      lang.value = 'zh'
      expect(t(longZh, longEn)).toBe(longZh)

      lang.value = 'en'
      expect(t(longZh, longEn)).toBe(longEn)
    })

    it('should handle strings with special characters', () => {
      const { t, lang } = useLang()
      lang.value = 'zh'

      expect(t('你好，世界！', 'Hello, World!')).toBe('你好，世界！')
      expect(t('中文@#$%^&*()', 'English@#$%^&*()')).toBe('中文@#$%^&*()')
    })

    it('should handle single character translations', () => {
      const { t, lang } = useLang()
      lang.value = 'zh'
      expect(t('中', 'E')).toBe('中')
      lang.value = 'en'
      expect(t('中', 'E')).toBe('E')
    })

    it('should handle whitespace-only strings', () => {
      const { t, lang } = useLang()
      lang.value = 'zh'
      expect(t('   ', '   ')).toBe('   ')
      expect(t('  中文  ', '  English  ')).toBe('  中文  ')
    })
  })

  describe('8. Return value verification', () => {
    it('should return all expected properties from useLang', () => {
      const result = useLang()
      expect(result).toHaveProperty('lang')
      expect(result).toHaveProperty('isZh')
      expect(result).toHaveProperty('toggle')
      expect(result).toHaveProperty('t')
    })

    it('should return lang as a ref', () => {
      const { lang } = useLang()
      expect(lang.value).toBeDefined()
    })

    it('should return isZh as a computed', () => {
      const { isZh } = useLang()
      expect(isZh.value).toBeDefined()
    })

    it('should return toggle as a function', () => {
      const { toggle } = useLang()
      expect(typeof toggle).toBe('function')
    })

    it('should return t as a function', () => {
      const { t } = useLang()
      expect(typeof t).toBe('function')
    })
  })
})
