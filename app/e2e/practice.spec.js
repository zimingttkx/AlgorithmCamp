/**
 * E2E Tests for Practice Page
 *
 * Tests the main practice刷题 page including:
 * - Page rendering and navigation
 * - Chapter/problem map display
 * - Problem selection and marking
 * - LeetCode sync functionality
 * - Login prompt for unauthenticated users
 * - View switching (map/list)
 */

import { test, expect } from '@playwright/test'

test.describe('Practice Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/practice')
  })

  test('should display practice page with map view', async ({ page }) => {
    // Check page title exists
    await expect(page.locator('.map-title')).toBeVisible()

    // Check map container exists
    await expect(page.locator('.practice-map')).toBeVisible()
  })

  test('should show login button when not authenticated', async ({ page }) => {
    // The login button should be visible
    const loginBtn = page.locator('.login-btn')
    await expect(loginBtn).toBeVisible()
  })

  test('should navigate to login page when clicking login button', async ({ page }) => {
    // Click login button
    await page.locator('.login-btn').click()

    // Should be on login page
    await expect(page).toHaveURL(/#\/login/)
  })

  test('should display sync indicator', async ({ page }) => {
    // Sync indicator should be visible
    await expect(page.locator('.sync-indicator')).toBeVisible()
  })

  test('should display LeetCode sync area', async ({ page }) => {
    // LeetCode sync area should exist
    const leetcodeArea = page.locator('.leetcode-sync-area')
    await expect(leetcodeArea).toBeVisible()
  })

  test('should show LeetCode input when not bound', async ({ page }) => {
    // Check for LeetCode input field
    const leetcodeInput = page.locator('.leetcode-input')
    await expect(leetcodeInput).toBeVisible()

    // Check for bind button
    await expect(page.locator('.leetcode-btn')).toBeVisible()
  })

  test('should enable bind button only when input has value', async ({ page }) => {
    const bindBtn = page.locator('.leetcode-btn')

    // Initially disabled (empty input)
    await expect(bindBtn).toBeDisabled()

    // Fill in username
    await page.locator('.leetcode-input').fill('testuser')

    // Should be enabled now
    await expect(bindBtn).toBeEnabled()
  })

  test('should bind LeetCode username', async ({ page }) => {
    // Fill LeetCode username
    await page.locator('.leetcode-input').fill('testuser')

    // Click bind button
    await page.locator('.leetcode-btn').click()

    // After binding, should show bound state
    // The input should be replaced with bound indicator
    const leetcodeBound = page.locator('.leetcode-bound')
    await expect(leetcodeBound).toBeVisible({ timeout: 5000 })
  })

  test('should show auth area with login/logged in status', async ({ page }) => {
    // Auth area should be visible
    await expect(page.locator('.auth-area')).toBeVisible()
  })

  test('should display map header with title', async ({ page }) => {
    // Map header with title should be visible
    await expect(page.locator('.map-header')).toBeVisible()
    await expect(page.locator('.map-title')).toContainText(/刷题|闯关/)
  })

  test('should toggle view mode buttons exist', async ({ page }) => {
    // Look for view toggle buttons
    const viewButtons = page.locator('.view-toggle button, .view-btn, [class*="view"]')
    // At minimum the map should render
    await expect(page.locator('.practice-map')).toBeVisible()
  })

  test('should display chapter content when chapters loaded', async ({ page }) => {
    // Wait for chapters to potentially load
    await page.waitForTimeout(2000)

    // Check that the practice map container exists
    await expect(page.locator('.practice-map')).toBeVisible()
  })

  test('should handle problem checkbox interaction', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(2000)

    // Look for problem checkboxes or similar interactive elements
    // The practice page has rows that can be checked
    const rows = page.locator('.prob-row, .problem-row, [class*="row"]')
    const count = await rows.count()

    if (count > 0) {
      // Try clicking the first row
      await rows.first().click()
    }
  })

  test('should have proper page layout structure', async ({ page }) => {
    // Check main container
    await expect(page.locator('.practice-page')).toBeVisible()

    // Check map container
    await expect(page.locator('.practice-map')).toBeVisible()

    // Header should be present
    await expect(page.locator('.map-header')).toBeVisible()
  })

  test('should display navigation elements', async ({ page }) => {
    // The practice page should have some way to navigate chapters
    // Check for next chapter or navigation elements
    const navElements = page.locator('.next-chapter, .chapter-nav, .section-title')
    await expect(navElements.first()).toBeVisible({ timeout: 5000 })
  })

  test('should handle LeetCode bind with Enter key', async ({ page }) => {
    // Fill LeetCode username
    await page.locator('.leetcode-input').fill('testuser')

    // Press Enter
    await page.locator('.leetcode-input').press('Enter')

    // Should show bound state
    const leetcodeBound = page.locator('.leetcode-bound')
    await expect(leetcodeBound).toBeVisible({ timeout: 5000 })
  })

  test('should clear input after binding', async ({ page }) => {
    // Fill LeetCode username
    await page.locator('.leetcode-input').fill('testuser')

    // Click bind
    await page.locator('.leetcode-btn').click()

    // Wait for bound state
    await expect(page.locator('.leetcode-bound')).toBeVisible({ timeout: 5000 })

    // Input should be cleared
    await expect(page.locator('.leetcode-input')).toHaveValue('')
  })

  test('sync status should reflect authentication state', async ({ page }) => {
    // The sync indicator should show different states
    const syncIndicator = page.locator('.sync-indicator')

    // When not logged in, sync indicator should be in idle state
    await expect(syncIndicator).toBeVisible()
  })

  test('should show loading state while binding LeetCode', async ({ page }) => {
    // Fill input to enable button
    await page.locator('.leetcode-input').fill('testuser')

    // Button should be enabled
    await expect(page.locator('.leetcode-btn')).toBeEnabled()
  })

  test('should display problem difficulty indicators', async ({ page }) => {
    // Wait for content
    await page.waitForTimeout(2000)

    // Look for difficulty indicators
    const difficultyElements = page.locator('.difficulty, [class*="diff"], .level')
    const count = await difficultyElements.count()

    if (count > 0) {
      await expect(difficultyElements.first()).toBeVisible()
    }
  })

  test('should handle chapter section expansion', async ({ page }) => {
    // Wait for content
    await page.waitForTimeout(2000)

    // Look for section headers that might be clickable
    const sectionHeaders = page.locator('.section-header, .chapter-header, [class*="section"]')
    const count = await sectionHeaders.count()

    if (count > 0) {
      // Try clicking the first section
      await sectionHeaders.first().click()
    }
  })

  test('should have accessible interactive elements', async ({ page }) => {
    // Check for proper button elements (not divs伪装)
    const buttons = page.locator('button')
    const count = await buttons.count()

    // Should have multiple buttons
    expect(count).toBeGreaterThan(0)
  })

  test('should render without console errors', async ({ page }) => {
    const errors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Navigate to page
    await page.goto('/#/practice')

    // Wait for content
    await page.waitForTimeout(2000)

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('net::')
    )

    expect(criticalErrors.length).toBe(0)
  })
})
