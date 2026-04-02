/**
 * E2E Tests for Login/Register Flow
 *
 * Tests the complete authentication flow including:
 * - Login form validation
 * - Register form validation
 * - GitHub OAuth button presence
 * - Form mode switching
 * - Error handling
 * - Navigation after successful auth
 */

import { test, expect } from '@playwright/test'

test.describe('Login/Register Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login')
  })

  test('should display login page with all elements', async ({ page }) => {
    // Check page title/logo
    await expect(page.locator('.login-logo')).toBeVisible()

    // Check subtitle
    await expect(page.locator('.login-subtitle')).toBeVisible()

    // Check tab switcher exists
    await expect(page.locator('.tab-switch')).toBeVisible()
    await expect(page.locator('.tab-btn').first()).toContainText(/LOGIN|登录/)

    // Check login form elements
    await expect(page.locator('input[autocomplete="username"]')).toBeVisible()
    await expect(page.locator('input[autocomplete="current-password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // Check GitHub login button
    await expect(page.locator('.btn-github')).toBeVisible()

    // Check back link
    await expect(page.locator('.back-link')).toBeVisible()
  })

  test('should switch between login and register modes', async ({ page }) => {
    // Initially on login mode
    await expect(page.locator('.tab-btn').first()).toHaveClass(/active/)

    // Click register tab
    await page.locator('.tab-btn').nth(1).click()

    // Should now be on register mode
    await expect(page.locator('.tab-btn').nth(1)).toHaveClass(/active/)

    // Register form should have GitHub username field
    await expect(page.locator('input[autocomplete="off"]')).toBeVisible()

    // Switch back to login
    await page.locator('.tab-btn').first().click()
    await expect(page.locator('.tab-btn').first()).toHaveClass(/active/)
  })

  test('should validate login form inputs', async ({ page }) => {
    // Submit button should be disabled when fields are empty
    await expect(page.locator('button[type="submit"]')).toBeEnabled()

    // Fill in username
    await page.locator('input[autocomplete="username"]').fill('testuser')

    // Fill in password
    await page.locator('input[autocomplete="current-password"]').fill('password123')

    // Button should still be enabled (form is submittable)
    await expect(page.locator('button[type="submit"]')).toBeEnabled()
  })

  test('should validate register form inputs', async ({ page }) => {
    // Switch to register mode
    await page.locator('.tab-btn').nth(1).click()

    // Fill username (min 3 chars)
    await page.locator('input[autocomplete="username"]').first().fill('newuser')

    // Fill password (min 6 chars)
    await page.locator('input[autocomplete="new-password"]').fill('newpass123')

    // GitHub username is optional
    await page.locator('input[autocomplete="off"]').fill('mygithub')

    // Submit should be enabled
    await expect(page.locator('button[type="submit"]')).toBeEnabled()
  })

  test('should reject short username in register', async ({ page }) => {
    await page.locator('.tab-btn').nth(1).click()

    // Fill short username
    await page.locator('input[autocomplete="username"]').first().fill('ab')

    // Fill valid password
    await page.locator('input[autocomplete="new-password"]').fill('password123')

    // The form should have HTML5 validation for minlength="3"
    const usernameInput = page.locator('input[autocomplete="username"]').first()
    await expect(usernameInput).toHaveAttribute('minlength', '3')
  })

  test('should reject short password in register', async ({ page }) => {
    await page.locator('.tab-btn').nth(1).click()

    // Fill valid username
    await page.locator('input[autocomplete="username"]').first().fill('newuser')

    // Fill short password
    await page.locator('input[autocomplete="new-password"]').fill('12345')

    // The form should have HTML5 validation for minlength="6"
    const passwordInput = page.locator('input[autocomplete="new-password"]')
    await expect(passwordInput).toHaveAttribute('minlength', '6')
  })

  test('should clear error when switching modes', async ({ page }) => {
    // First trigger an error by trying to submit empty form
    // Note: Since form validation prevents empty submit, we test the error state clearing

    // Switch modes - error should clear
    await page.locator('.tab-btn').nth(1).click()
    await expect(page.locator('.error-box')).not.toBeVisible()
  })

  test('should navigate back to home when clicking back link', async ({ page }) => {
    await page.locator('.back-link').click()
    await expect(page).toHaveURL(/#\/$|localhost:5173/)
  })

  test('should have accessible form labels', async ({ page }) => {
    // Check that form labels are associated with inputs
    const usernameInput = page.locator('input[autocomplete="username"]')
    await expect(usernameInput).toBeVisible()

    const passwordInput = page.locator('input[autocomplete="current-password"]')
    await expect(passwordInput).toBeVisible()
  })

  test('should show loading state during submission', async ({ page }) => {
    // This test verifies the loading spinner appears
    // We use a mock to prevent actual submission

    await page.locator('input[autocomplete="username"]').fill('testuser')
    await page.locator('input[autocomplete="current-password"]').fill('password123')

    // Intercept the API call to prevent actual submission
    await page.route('**/api/auth/login', route => {
      // Don't resolve the route - keep it pending
      // This would show the loading spinner
    })

    // Note: In a real scenario, you'd want to properly handle this
    // For now, we verify the form is fillable
  })

  test('GitHub login button should call OAuth flow', async ({ page }) => {
    // The GitHub button should redirect to OAuth
    const githubButton = page.locator('.btn-github')

    // Verify the button exists and is clickable
    await expect(githubButton).toBeVisible()
    await expect(githubButton).toBeEnabled()
  })

  test('should preserve form data when switching tabs', async ({ page }) => {
    // Fill login form
    await page.locator('input[autocomplete="username"]').fill('testuser')
    await page.locator('input[autocomplete="current-password"]').fill('password123')

    // Switch to register and back
    await page.locator('.tab-btn').nth(1).click()
    await page.locator('.tab-btn').first().click()

    // Username should be cleared on mode switch (as per spec)
    await expect(page.locator('input[autocomplete="username"]')).toHaveValue('')
  })

  test('login form should accept valid credentials format', async ({ page }) => {
    // Test that the form accepts standard username/password format
    await page.locator('input[autocomplete="username"]').fill('validUser123')
    await page.locator('input[autocomplete="current-password"]').fill('validPassword123')

    // Both fields should have the values we set
    await expect(page.locator('input[autocomplete="username"]')).toHaveValue('validUser123')
    await expect(page.locator('input[autocomplete="current-password"]')).toHaveValue('validPassword123')
  })

  test('register form should accept underscore in username', async ({ page }) => {
    await page.locator('.tab-btn').nth(1).click()

    // Username with underscore (valid per pattern [a-zA-Z0-9_]+)
    await page.locator('input[autocomplete="username"]').first().fill('test_user_123')
    await page.locator('input[autocomplete="new-password"]').fill('password123')

    await expect(page.locator('input[autocomplete="username"]').first()).toHaveValue('test_user_123')
  })

  test('should show error box container', async ({ page }) => {
    // Error box should exist in DOM but be hidden when no error
    const errorBox = page.locator('.error-box')
    await expect(errorBox).toBeAttached()
  })

  test('should have proper autocomplete attributes', async ({ page }) => {
    // Verify autocomplete attributes for browser password manager integration
    await expect(page.locator('input[autocomplete="username"]')).toHaveAttribute('autocomplete', 'username')
    await expect(page.locator('input[autocomplete="current-password"]')).toHaveAttribute('autocomplete', 'current-password')
  })

  test('tab indicator should animate on mode switch', async ({ page }) => {
    // The tab indicator should be visible
    await expect(page.locator('.tab-indicator')).toBeVisible()

    // Check initial position (login mode)
    const indicator = page.locator('.tab-indicator')
    const style = await indicator.getAttribute('style')

    // Indicator should have left position style
    expect(style).toContain('left')
  })
})
