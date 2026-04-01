/**
 * Unit Tests for i18n.js - Internationalization composable
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useLang } from '../src/composables/i18n.js'

describe('useLang', () => {
  beforeEach(() => {
    // Reset language to Chinese before each test
    const { lang } = useLang()
    lang.value = 'zh'
  })

  afterEach(() => {
    // Clean up after each test
    const { lang } = useLang()
    lang.value = 'zh'
  })

  describe('t() function', () => {
    it('should return Chinese text when lang is zh', () => {
      const { t, lang } = useLang()
      lang.value = 'zh'
      expect(t('你好', 'Hello')).toBe('你好')
    })

    it('should return English text when lang is en', () => {
      const { t, lang } = useLang()
      lang.value = 'en'
      expect(t('你好', 'Hello')).toBe('Hello')
    })

    it('should handle empty strings', () => {
      const { t } = useLang()
      expect(t('', '')).toBe('')
      // When lang is 'zh', returns zh param
      expect(t('', 'Hello')).toBe('') // zh is empty, so returns empty
    })

    it('should handle same zh/en values', () => {
      const { t } = useLang()
      expect(t('测试', '测试')).toBe('测试')
    })

    it('should handle unicode characters', () => {
      const { t } = useLang()
      expect(t('中文', 'English')).toBe('中文')
    })
  })

  describe('isZh computed', () => {
    it('should return true when lang is zh', () => {
      const { isZh, lang } = useLang()
      lang.value = 'zh'
      expect(isZh.value).toBe(true)
    })

    it('should return false when lang is en', () => {
      const { isZh, lang } = useLang()
      lang.value = 'en'
      expect(isZh.value).toBe(false)
    })
  })

  describe('toggle() function', () => {
    it('should toggle from zh to en', () => {
      const { lang, toggle } = useLang()
      lang.value = 'zh'
      toggle()
      expect(lang.value).toBe('en')
    })

    it('should toggle from en to zh', () => {
      const { lang, toggle } = useLang()
      lang.value = 'en'
      toggle()
      expect(lang.value).toBe('zh')
    })

    it('should toggle multiple times', () => {
      const { lang, toggle } = useLang()
      lang.value = 'zh'
      toggle() // zh -> en
      toggle() // en -> zh
      toggle() // zh -> en
      expect(lang.value).toBe('en')
    })
  })
})
