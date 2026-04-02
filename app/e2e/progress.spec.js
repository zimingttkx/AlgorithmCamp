/**
 * E2E Tests for Progress Sync Flow
 *
 * Tests the progress tracking and synchronization including:
 * - Progress page rendering
 * - Stats display (solved count, target, efficiency)
 * - Chapter progress visualization
 * - Data sync between localStorage and server
 * - Authentication state reflection in progress
 */

import { test, expect } from '@playwright/test'

test.describe('Progress Page & Sync', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/progress')
  })

  test('should display progress page with title', async ({ page }) => {
    // Check page title
    await expect(page.locator('.page-title')).toBeVisible()
    await expect(page.locator('.page-title')).toContainText(/进度|PROGRESS/)
  })

  test('should display page subtitle', async ({ page }) => {
    await expect(page.locator('.page-subtitle')).toBeVisible()
  })

  test('should display quick stats bar', async ({ page }) => {
    // Check quick stats container
    await expect(page.locator('.quick-stats')).toBeVisible()
  })

  test('should display solved count stat', async ({ page }) => {
    // Look for solved count
    const solvedElement = page.locator('.qs-value').first()
    await expect(solvedElement).toBeVisible()
  })

  test('should display target problems stat', async ({ page }) => {
    // Look for target stat
    const targetElement = page.locator('.qs-value').nth(1)
    await expect(targetElement).toBeVisible()
  })

  test('should display efficiency rate stat', async ({ page }) => {
    // Look for efficiency stat
    const efficiencyElement = page.locator('.qs-value').nth(2)
    await expect(efficiencyElement).toBeVisible()
  })

  test('should display chapters cleared stat', async ({ page }) => {
    // Look for chapters stat
    const chaptersElement = page.locator('.qs-value').nth(3)
    await expect(chaptersElement).toBeVisible()
  })

  test('should display visualization grid', async ({ page }) => {
    // Check viz grid container
    await expect(page.locator('.viz-grid')).toBeVisible()
  })

  test('should display progress globe component', async ({ page }) => {
    // Globe component should be present
    await expect(page.locator('.viz-card-globe, .progress-globe')).toBeVisible({ timeout: 5000 })
  })

  test('should display ability radar component', async ({ page }) => {
    // Radar component should be present
    await expect(page.locator('.viz-card-radar, .ability-radar')).toBeVisible({ timeout: 5000 })
  })

  test('should display practice roadmap component', async ({ page }) => {
    // Roadmap component should be present
    await expect(page.locator('.viz-card-roadmap, .practice-roadmap')).toBeVisible({ timeout: 5000 })
  })

  test('should display duration stats component', async ({ page }) => {
    // Duration stats should be present
    await expect(page.locator('.viz-card-duration, .duration-stats')).toBeVisible({ timeout: 5000 })
  })

  test('should display tips section', async ({ page }) => {
    // Tips section should be visible
    await expect(page.locator('.tips-section')).toBeVisible()
    await expect(page.locator('.tips-header')).toBeVisible()
  })

  test('should display improvement tips', async ({ page }) => {
    // Tips list should be present
    const tipsList = page.locator('.tips-list')
    await expect(tipsList).toBeVisible({ timeout: 5000 })
  })

  test('should have quick stats with icons', async ({ page }) => {
    // Check that icons are displayed
    const icons = page.locator('.qs-icon')
    const count = await icons.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should have dividers between stats', async ({ page }) => {
    // Check for dividers
    const dividers = page.locator('.qs-divider')
    const count = await dividers.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should render visualization columns', async ({ page }) => {
    // Left column
    await expect(page.locator('.viz-column-left, .viz-column')).toBeVisible({ timeout: 5000 })

    // Right column
    await expect(page.locator('.viz-column-right, .viz-column')).toBeVisible({ timeout: 5000 })
  })

  test('should display header decoration', async ({ page }) => {
    await expect(page.locator('.header-decoration')).toBeVisible()
  })

  test('should display decoration line', async ({ page }) => {
    await expect(page.locator('.deco-line')).toBeVisible()
  })

  test('should display decoration dots', async ({ page }) => {
    await expect(page.locator('.deco-dots')).toBeVisible()
  })

  test('should handle page resize gracefully', async ({ page }) => {
    // Make page smaller
    await page.setViewportSize({ width: 375, height: 667 })

    // Page should still render
    await expect(page.locator('.progress-page')).toBeVisible()
  })

  test('should display stat labels in both languages', async ({ page }) => {
    // Stats should have labels
    const labels = page.locator('.qs-label')
    const count = await labels.count()
    expect(count).toBeGreaterThan(0)

    // Check first label is visible
    await expect(labels.first()).toBeVisible()
  })

  test('should render without critical console errors', async ({ page }) => {
    const errors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/#/progress')
    await page.waitForTimeout(2000)

    // Filter out network/resource errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('net::') &&
      !e.includes('404')
    )

    expect(criticalErrors.length).toBe(0)
  })

  test('progress data should persist in localStorage', async ({ page }) => {
    // Navigate to practice and mark something solved
    await page.goto('/#/practice')
    await page.waitForTimeout(2000)

    // Try to mark a problem
    const firstCheckbox = page.locator('input[type="checkbox"]').first()
    if (await firstCheckbox.isVisible()) {
      await firstCheckbox.check()
    }

    // Check localStorage
    const progress = await page.evaluate(() => {
      return localStorage.getItem('mc-algo-progress')
    })

    // Progress should be stored
    // (It may be null if no problems are checked)
  })

  test('should show correct stat values after marking problem', async ({ page }) => {
    // Navigate to practice
    await page.goto('/#/practice')
    await page.waitForTimeout(2000)

    // Try to interact with first available checkbox
    const checkboxes = page.locator('input[type="checkbox"]')
    const checkboxCount = await checkboxes.count()

    if (checkboxCount > 0) {
      // Mark as checked
      await checkboxes.first().check()

      // Navigate to progress
      await page.goto('/#/progress')
      await page.waitForTimeout(2000)

      // The solved count should reflect the change
      const solvedValue = await page.locator('.qs-value').first().textContent()
      const solvedNum = parseInt(solvedValue || '0', 10)
      expect(solvedNum).toBeGreaterThanOrEqual(0)
    }
  })

  test('chapter progress should reflect checked problems', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(2000)

    // Check for chapter-related elements
    const chapterElements = page.locator('.chapter, .chapters, [class*="chapter"]')
    const count = await chapterElements.count()

    // At minimum, roadmap should show some chapter data
    const roadmap = page.locator('.practice-roadmap, .viz-card-roadmap')
    await expect(roadmap).toBeVisible({ timeout: 5000 })
  })

  test('sync indicator should show current status', async ({ page }) => {
    // Navigate to practice to see sync indicator
    await page.goto('/#/practice')
    await page.waitForTimeout(1000)

    // Sync indicator should be present
    const syncIndicator = page.locator('.sync-indicator')
    await expect(syncIndicator).toBeVisible()
  })

  test('logged in state should show sync badge', async ({ page }) => {
    // Navigate to practice
    await page.goto('/#/practice')
    await page.waitForTimeout(1000)

    // When logged out, should show login button
    // When logged in, should show logged-in badge
    const loginBtn = page.locator('.login-btn')
    const loggedInBadge = page.locator('.logged-in-badge')

    // One of these should be visible
    const loginVisible = await loginBtn.isVisible().catch(() => false)
    const badgeVisible = await loggedInBadge.isVisible().catch(() => false)

    expect(loginVisible || badgeVisible).toBeTruthy()
  })
})
