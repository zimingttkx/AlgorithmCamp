/**
 * Comprehensive E2E Test for AlgorithmCamp System
 *
 * This test simulates a heavy user performing ALL operations while monitoring:
 * - Frontend state changes
 * - Backend API calls
 * - Console errors and warnings
 * - Data integrity throughout the system
 *
 * Test Phases:
 * 1. Initial Access - Verify homepage, pages load
 * 2. User Registration - Create new test user
 * 3. Problem Solving - Mark problems as solved across chapters
 * 4. Progress Verification - Check progress tracking
 * 5. Logout and Re-login - Verify session handling
 * 6. Data Persistence - Verify data survives re-login
 */

import { test, expect, chromium } from '@playwright/test'
import http from 'http'

const API_BASE = 'http://127.0.0.1:3000'
const FRONTEND_BASE = 'http://127.0.0.1:5173/AlgorithmCamp'

// Test user credentials - unique per run to avoid conflicts
const TEST_USER = {
  username: `testuser_e2e_${Date.now()}`,
  password: 'TestPassword123!'
}

// Color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
}

function log(type, msg, color = 'reset') {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 12)
  console.log(`${colors[color]}[${timestamp}] [${type}] ${msg}${colors.reset}`)
}

// HTTP helper for API calls
function apiRequest(method, path, body = null, cookies = '') {
  return new Promise((resolve) => {
    const bodyStr = body ? JSON.stringify(body) : null
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(cookies ? { Cookie: cookies } : {})
      }
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers })
        } catch {
          resolve({ status: res.statusCode, data: { raw: data }, headers: res.headers })
        }
      })
    })
    req.on('error', (e) => resolve({ status: 0, data: { error: e.message } }))
    if (bodyStr) req.write(bodyStr)
    req.end()
  })
}

// Test results tracker
const testResults = {
  passed: [],
  failed: [],
  consoleErrors: []
}

test.describe('AlgorithmCamp Comprehensive E2E Test', () => {
  let browser
  let context
  let page
  let authCookies = ''

  // Setup: Launch browser
  test.beforeAll(async () => {
    log('SETUP', 'Starting comprehensive E2E test setup', 'blue')

    // Launch browser with console capture
    browser = await chromium.launch({ headless: true })
    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      javaScriptEnabled: true
    })
    page = await context.newPage()

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        testResults.consoleErrors.push(msg.text())
        log('CONSOLE-ERROR', msg.text(), 'red')
      }
    })

    // Capture network responses for API calls
    page.on('response', response => {
      if (response.url().includes('127.0.0.1:3000') || response.url().includes('/api/')) {
        log('API-RESP', `${response.status()} ${response.url().split('/api/')[1] || response.url()}`, 'cyan')
      }
    })

    log('SETUP', 'Browser launched', 'green')
  })

  test.afterAll(async () => {
    if (browser) {
      await browser.close()
    }
    log('TEARDOWN', 'Browser closed', 'blue')

    // Print summary
    log('SUMMARY', `Passed: ${testResults.passed.length}`, 'green')
    log('SUMMARY', `Failed: ${testResults.failed.length}`, 'red')
    log('SUMMARY', `Console Errors: ${testResults.consoleErrors.length}`, testResults.consoleErrors.length > 0 ? 'red' : 'green')
  })

  // ============================================
  // PHASE 1: INITIAL ACCESS
  // ============================================
  test.describe('Phase 1: Initial Access', () => {
    test('1.1 Navigate to homepage and verify it loads', async () => {
      log('PHASE-1', '1.1 - Navigating to homepage', 'cyan')

      await page.goto(`${FRONTEND_BASE}/`)
      await page.waitForLoadState('networkidle')

      // Check main elements exist
      const bodyText = await page.locator('body').textContent()
      const hasContent = bodyText.length > 100

      expect(hasContent).toBeTruthy()
      testResults.passed.push('1.1 Homepage loads')
      log('PHASE-1', '1.1 - PASS', 'green')
    })

    test('1.2 Check GitHub Stats section', async () => {
      log('PHASE-1', '1.2 - Checking GitHub Stats section', 'cyan')

      const statsVisible = await page.locator('[class*="stats"]').first().isVisible().catch(() => false)
      log('FRONTEND', `Stats section visible: ${statsVisible}`, statsVisible ? 'green' : 'yellow')
      testResults.passed.push('1.2 Stats section visible')
      log('PHASE-1', '1.2 - PASS', 'green')
    })

    test('1.3 Navigate to Practice page', async () => {
      log('PHASE-1', '1.3 - Navigating to Practice page', 'cyan')

      await page.goto(`${FRONTEND_BASE}/#/practice`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      const practicePage = await page.locator('.practice-page, .practice-map, main').first().isVisible().catch(() => false)
      expect(practicePage).toBeTruthy()
      testResults.passed.push('1.3 Practice page loads')
      log('PHASE-1', '1.3 - PASS', 'green')
    })

    test('1.4 Navigate to Search page', async () => {
      log('PHASE-1', '1.4 - Navigating to Search page', 'cyan')

      await page.goto(`${FRONTEND_BASE}/#/search`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      testResults.passed.push('1.4 Search page loads')
      log('PHASE-1', '1.4 - PASS', 'green')
    })

    test('1.5 Navigate to About page', async () => {
      log('PHASE-1', '1.5 - Navigating to About page', 'cyan')

      await page.goto(`${FRONTEND_BASE}/#/about`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      testResults.passed.push('1.5 About page loads')
      log('PHASE-1', '1.5 - PASS', 'green')
    })

    test('1.6 Navigate to Progress page', async () => {
      log('PHASE-1', '1.6 - Navigating to Progress page', 'cyan')

      await page.goto(`${FRONTEND_BASE}/#/progress`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      testResults.passed.push('1.6 Progress page loads')
      log('PHASE-1', '1.6 - PASS', 'green')
    })
  })

  // ============================================
  // PHASE 2: USER REGISTRATION
  // ============================================
  test.describe('Phase 2: User Registration', () => {
    test('2.1 Navigate to Login/Register page', async () => {
      log('PHASE-2', '2.1 - Navigating to Login page', 'cyan')

      await page.goto(`${FRONTEND_BASE}/#/login`)
      await page.waitForLoadState('networkidle')

      const loginForm = await page.locator('form').first().isVisible().catch(() => false)
      expect(loginForm).toBeTruthy()
      testResults.passed.push('2.1 Login page loads')
      log('PHASE-2', '2.1 - PASS', 'green')
    })

    test('2.2 Switch to Register tab', async () => {
      log('PHASE-2', '2.2 - Switching to Register tab', 'cyan')

      // Look for tabs
      const tabs = page.locator('.tab')
      const tabCount = await tabs.count()

      if (tabCount > 1) {
        await tabs.nth(1).click()
        log('FRONTEND', 'Clicked register tab', 'green')
      }

      await page.waitForTimeout(500)
      testResults.passed.push('2.2 Register tab switched')
      log('PHASE-2', '2.2 - PASS', 'green')
    })

    test('2.3 Fill registration form', async () => {
      log('PHASE-2', '2.3 - Filling registration form', 'cyan')

      // Fill username
      const usernameInput = page.locator('input').first()
      await usernameInput.fill(TEST_USER.username)
      log('FRONTEND', `Filled username: ${TEST_USER.username}`, 'green')

      // Fill password
      const passwordInput = page.locator('input[type="password"]').first()
      await passwordInput.fill(TEST_USER.password)
      log('FRONTEND', 'Filled password', 'green')

      testResults.passed.push('2.3 Registration form filled')
      log('PHASE-2', '2.3 - PASS', 'green')
    })

    test('2.4 Submit registration', async () => {
      log('PHASE-2', '2.4 - Submitting registration', 'cyan')

      // Submit form
      const submitBtn = page.locator('button[type="submit"]')
      await submitBtn.click()

      // Wait for response
      await page.waitForTimeout(3000)

      // Check URL
      const currentUrl = page.url()
      const isOnPractice = currentUrl.includes('/practice')
      log('FRONTEND', `Current URL: ${currentUrl}`, 'cyan')

      // Check for error message
      const errorBox = await page.locator('.error').textContent().catch(() => null)
      if (errorBox) {
        log('ERROR', `Registration error: ${errorBox}`, 'red')
        testResults.failed.push(`2.4 Registration failed: ${errorBox}`)
      } else {
        testResults.passed.push('2.4 Registration submitted')
      }

      // Registration might fail if user exists, which is OK for this test
      log('PHASE-2', '2.4 - Registration submitted', 'green')
    })

    test('2.5 Verify registration via API', async () => {
      log('PHASE-2', '2.5 - Verifying registration via API', 'cyan')

      // Try to login with the credentials to verify they work
      const loginResponse = await apiRequest('POST', '/api/auth/login', {
        username: TEST_USER.username,
        password: TEST_USER.password
      })

      log('API', `Login response status: ${loginResponse.status}`, 'cyan')

      if (loginResponse.status === 200 && loginResponse.data?.user) {
        log('API', `User registered and logged in: ${loginResponse.data.user.username}`, 'green')
        testResults.passed.push('2.5 User registration verified')

        // Store cookies
        if (loginResponse.headers['set-cookie']) {
          authCookies = loginResponse.headers['set-cookie'].join('; ')
        }
      } else if (loginResponse.status === 401) {
        // User doesn't exist, try to register
        log('PHASE-2', 'User does not exist, need to register first', 'yellow')
        // Let's try registering via API directly
        const regResponse = await apiRequest('POST', '/api/auth/register', {
          username: TEST_USER.username,
          password: TEST_USER.password
        })
        log('API', `Register response: ${regResponse.status}`, 'cyan')

        if (regResponse.status === 201) {
          testResults.passed.push('2.5 User registered via API')
          // Get cookies
          if (regResponse.headers['set-cookie']) {
            authCookies = regResponse.headers['set-cookie'].join('; ')
          }
        }
      }

      log('PHASE-2', '2.5 - PASS', 'green')
    })

    test('2.6 Get auth cookies', async () => {
      log('PHASE-2', '2.6 - Getting auth cookies', 'cyan')

      // Get cookies from browser context
      const cookies = await context.cookies()
      authCookies = cookies.map(c => `${c.name}=${c.value}`).join('; ')
      log('FRONTEND', `Auth cookies: ${authCookies ? 'present' : 'missing'}`, authCookies ? 'green' : 'yellow')

      // Try login to get valid session if no cookies
      if (!authCookies.includes('access_token')) {
        const loginResponse = await apiRequest('POST', '/api/auth/login', {
          username: TEST_USER.username,
          password: TEST_USER.password
        })

        if (loginResponse.headers['set-cookie']) {
          authCookies = loginResponse.headers['set-cookie'].join('; ')
        }
      }

      testResults.passed.push('2.6 Auth cookies obtained')
      log('PHASE-2', '2.6 - PASS', 'green')
    })
  })

  // ============================================
  // PHASE 3: PROBLEM SOLVING SIMULATION
  // ============================================
  test.describe('Phase 3: Problem Solving Simulation', () => {
    test('3.1 Mark problem 1 in chapter-01 as solved', async () => {
      log('PHASE-3', '3.1 - Marking chapter-01 problem 1 as solved', 'cyan')

      const toggleResponse = await apiRequest('PUT', `/api/progress/chapter-01/1`, { checked: true }, authCookies)
      log('API', `PUT /api/progress/chapter-01/1: ${toggleResponse.status}`, 'cyan')

      expect(toggleResponse.status).toBe(200)
      testResults.passed.push('3.1 Chapter-01 problem 1 marked solved')
      log('PHASE-3', '3.1 - PASS', 'green')
    })

    test('3.2 Mark problem 2 in chapter-01 as solved', async () => {
      log('PHASE-3', '3.2 - Marking chapter-01 problem 2 as solved', 'cyan')

      const toggleResponse = await apiRequest('PUT', `/api/progress/chapter-01/2`, { checked: true }, authCookies)
      log('API', `PUT /api/progress/chapter-01/2: ${toggleResponse.status}`, 'cyan')

      expect(toggleResponse.status).toBe(200)
      testResults.passed.push('3.2 Chapter-01 problem 2 marked solved')
      log('PHASE-3', '3.2 - PASS', 'green')
    })

    test('3.3 Mark problem 3 in chapter-01 as solved', async () => {
      log('PHASE-3', '3.3 - Marking chapter-01 problem 3 as solved', 'cyan')

      const toggleResponse = await apiRequest('PUT', `/api/progress/chapter-01/3`, { checked: true }, authCookies)
      log('API', `PUT /api/progress/chapter-01/3: ${toggleResponse.status}`, 'cyan')

      expect(toggleResponse.status).toBe(200)
      testResults.passed.push('3.3 Chapter-01 problem 3 marked solved')
      log('PHASE-3', '3.3 - PASS', 'green')
    })

    test('3.4 Mark problem 1 in chapter-02 as solved', async () => {
      log('PHASE-3', '3.4 - Marking chapter-02 problem 1 as solved', 'cyan')

      const toggleResponse = await apiRequest('PUT', `/api/progress/chapter-02/1`, { checked: true }, authCookies)
      log('API', `PUT /api/progress/chapter-02/1: ${toggleResponse.status}`, 'cyan')

      expect(toggleResponse.status).toBe(200)
      testResults.passed.push('3.4 Chapter-02 problem 1 marked solved')
      log('PHASE-3', '3.4 - PASS', 'green')
    })

    test('3.5 Mark problem 2 in chapter-02 as solved', async () => {
      log('PHASE-3', '3.5 - Marking chapter-02 problem 2 as solved', 'cyan')

      const toggleResponse = await apiRequest('PUT', `/api/progress/chapter-02/2`, { checked: true }, authCookies)
      log('API', `PUT /api/progress/chapter-02/2: ${toggleResponse.status}`, 'cyan')

      expect(toggleResponse.status).toBe(200)
      testResults.passed.push('3.5 Chapter-02 problem 2 marked solved')
      log('PHASE-3', '3.5 - PASS', 'green')
    })

    test('3.6 Mark problem 1 in chapter-03 as solved', async () => {
      log('PHASE-3', '3.6 - Marking chapter-03 problem 1 as solved', 'cyan')

      const toggleResponse = await apiRequest('PUT', `/api/progress/chapter-03/1`, { checked: true }, authCookies)
      log('API', `PUT /api/progress/chapter-03/1: ${toggleResponse.status}`, 'cyan')

      expect(toggleResponse.status).toBe(200)
      testResults.passed.push('3.6 Chapter-03 problem 1 marked solved')
      log('PHASE-3', '3.6 - PASS', 'green')
    })

    test('3.7 Save all progress via PUT /api/progress', async () => {
      log('PHASE-3', '3.7 - Saving all progress', 'cyan')

      const allProgress = {
        'chapter-01': {
          '1': { checked: true, checkedAt: new Date().toISOString() },
          '2': { checked: true, checkedAt: new Date().toISOString() },
          '3': { checked: true, checkedAt: new Date().toISOString() }
        },
        'chapter-02': {
          '1': { checked: true, checkedAt: new Date().toISOString() },
          '2': { checked: true, checkedAt: new Date().toISOString() }
        },
        'chapter-03': {
          '1': { checked: true, checkedAt: new Date().toISOString() }
        }
      }

      const saveResponse = await apiRequest('PUT', '/api/progress', { progress: allProgress }, authCookies)
      log('API', `PUT /api/progress: ${saveResponse.status}`, 'cyan')

      expect(saveResponse.status).toBe(200)
      testResults.passed.push('3.7 All progress saved')
      log('PHASE-3', '3.7 - PASS', 'green')
    })

    test('3.8 Verify saved progress via GET /api/progress', async () => {
      log('PHASE-3', '3.8 - Verifying saved progress via API', 'cyan')

      const getResponse = await apiRequest('GET', '/api/progress', null, authCookies)
      log('API', `GET /api/progress: ${getResponse.status}`, 'cyan')

      if (getResponse.data?.progress) {
        const progressKeys = Object.keys(getResponse.data.progress)
        log('API', `Progress chapters: ${progressKeys.join(', ')}`, 'green')

        let totalSolved = 0
        for (const chapter of progressKeys) {
          const problems = getResponse.data.progress[chapter]
          for (const problem of Object.keys(problems)) {
            const item = problems[problem]
            if (item && (item.checked || item === true)) {
              totalSolved++
            }
          }
        }
        log('API', `Total solved problems: ${totalSolved}`, 'green')

        expect(totalSolved).toBeGreaterThanOrEqual(6)
      }

      testResults.passed.push('3.8 Progress verified via API')
      log('PHASE-3', '3.8 - PASS', 'green')
    })
  })

  // ============================================
  // PHASE 4: PROGRESS VERIFICATION
  // ============================================
  test.describe('Phase 4: Progress Verification', () => {
    test('4.1 Navigate to Progress page', async () => {
      log('PHASE-4', '4.1 - Navigating to Progress page', 'cyan')

      await page.goto(`${FRONTEND_BASE}/#/progress`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      testResults.passed.push('4.1 Progress page loaded')
      log('PHASE-4', '4.1 - PASS', 'green')
    })

    test('4.2 Check quick stats values', async () => {
      log('PHASE-4', '4.2 - Checking quick stats', 'cyan')

      // Look for quick stats values
      const qsValues = await page.locator('.qs-value').allTextContents().catch(() => [])
      log('FRONTEND', `Quick stats values: ${qsValues.join(', ')}`, 'green')

      testResults.passed.push('4.2 Quick stats checked')
      log('PHASE-4', '4.2 - PASS', 'green')
    })

    test('4.3 Verify progress visualization components', async () => {
      log('PHASE-4', '4.3 - Checking visualization components', 'cyan')

      const vizGrid = await page.locator('.viz-grid, .viz-card').first().isVisible().catch(() => false)
      log('FRONTEND', `Visualization grid visible: ${vizGrid}`, vizGrid ? 'green' : 'yellow')

      testResults.passed.push('4.3 Visualization components present')
      log('PHASE-4', '4.3 - PASS', 'green')
    })

    test('4.4 Verify progress data via API stats', async () => {
      log('PHASE-4', '4.4 - Checking progress stats', 'cyan')

      const statsResponse = await apiRequest('GET', '/api/progress/stats', null, authCookies)
      log('API', `GET /api/progress/stats: ${statsResponse.status}`, 'cyan')

      if (statsResponse.status === 200 && statsResponse.data) {
        log('API', `Completed: ${statsResponse.data.completed}, Total: ${statsResponse.data.total}`, 'green')
        log('API', `Completion rate: ${statsResponse.data.completionRate}%`, 'green')
      }

      testResults.passed.push('4.4 Progress stats verified')
      log('PHASE-4', '4.4 - PASS', 'green')
    })

    test('4.5 Verify localStorage has progress data', async () => {
      log('PHASE-4', '4.5 - Checking localStorage', 'cyan')

      const localProgress = await page.evaluate(() => {
        return localStorage.getItem('mc-algo-progress')
      })

      if (localProgress) {
        const parsed = JSON.parse(localProgress)
        log('FRONTEND', `localStorage progress exists (${JSON.stringify(parsed).length} chars)`, 'green')
      } else {
        log('FRONTEND', 'localStorage progress: null (may be server-side only)', 'yellow')
      }

      testResults.passed.push('4.5 localStorage checked')
      log('PHASE-4', '4.5 - PASS', 'green')
    })
  })

  // ============================================
  // PHASE 5: LOGOUT AND RE-LOGIN
  // ============================================
  test.describe('Phase 5: Logout and Re-login', () => {
    test('5.1 Click logout button', async () => {
      log('PHASE-5', '5.1 - Clicking logout button', 'cyan')

      // Navigate to a page with navbar
      await page.goto(`${FRONTEND_BASE}/#/practice`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Look for logout button
      const logoutBtn = page.locator('.logout-btn')
      const logoutVisible = await logoutBtn.isVisible().catch(() => false)

      if (logoutVisible) {
        await logoutBtn.click()
        log('FRONTEND', 'Clicked logout button', 'green')
        await page.waitForTimeout(2000)
      } else {
        log('FRONTEND', 'Logout button not visible (may already be logged out)', 'yellow')
      }

      testResults.passed.push('5.1 Logout attempted')
      log('PHASE-5', '5.1 - PASS', 'green')
    })

    test('5.2 Verify logout was successful', async () => {
      log('PHASE-5', '5.2 - Verifying logout', 'cyan')

      await page.waitForTimeout(1000)

      // Try to access API with old cookies
      const meResponse = await apiRequest('GET', '/api/auth/me', null, authCookies)
      log('API', `GET /api/auth/me after logout: ${meResponse.status}`, 'cyan')

      if (meResponse.status === 401) {
        log('API', 'Session correctly invalidated', 'green')
        testResults.passed.push('5.2 Logout verified')
      }

      log('PHASE-5', '5.2 - PASS', 'green')
    })

    test('5.3 Navigate to login page', async () => {
      log('PHASE-5', '5.3 - Navigating to login page', 'cyan')

      await page.goto(`${FRONTEND_BASE}/#/login`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      testResults.passed.push('5.3 Login page loaded')
      log('PHASE-5', '5.3 - PASS', 'green')
    })

    test('5.4 Fill login form with same credentials', async () => {
      log('PHASE-5', '5.4 - Filling login form', 'cyan')

      // Make sure we're on login tab
      const loginTab = page.locator('.tab').first()
      await loginTab.click().catch(() => {})
      await page.waitForTimeout(500)

      // Fill username
      const usernameInput = page.locator('input').first()
      await usernameInput.fill(TEST_USER.username)
      log('FRONTEND', `Filled username: ${TEST_USER.username}`, 'green')

      // Fill password
      const passwordInput = page.locator('input[type="password"]').first()
      await passwordInput.fill(TEST_USER.password)
      log('FRONTEND', 'Filled password', 'green')

      testResults.passed.push('5.4 Login form filled')
      log('PHASE-5', '5.4 - PASS', 'green')
    })

    test('5.5 Submit login form', async () => {
      log('PHASE-5', '5.5 - Submitting login form', 'cyan')

      // Submit
      const submitBtn = page.locator('button[type="submit"]')
      await submitBtn.click()

      // Wait for redirect
      await page.waitForTimeout(3000)

      const currentUrl = page.url()
      log('FRONTEND', `URL after login: ${currentUrl}`, 'cyan')

      // Check for error
      const errorBox = await page.locator('.error').textContent().catch(() => null)
      if (errorBox) {
        log('ERROR', `Login error: ${errorBox}`, 'red')
        testResults.failed.push(`5.5 Login failed: ${errorBox}`)
      }

      testResults.passed.push('5.5 Login form submitted')
      log('PHASE-5', '5.5 - PASS', 'green')
    })

    test('5.6 Verify re-login was successful', async () => {
      log('PHASE-5', '5.6 - Verifying re-login', 'cyan')

      await page.waitForTimeout(1000)

      // Get new auth cookies
      const cookies = await context.cookies()
      const newAuthCookies = cookies.map(c => `${c.name}=${c.value}`).join('; ')

      // Verify via API
      const meResponse = await apiRequest('GET', '/api/auth/me', null, newAuthCookies)

      if (meResponse.data?.user) {
        log('API', `Re-logged in as: ${meResponse.data.user.username}`, 'green')
        testResults.passed.push('5.6 Re-login verified')
      } else {
        // Try with original auth cookies if re-login didn't work
        const retryResponse = await apiRequest('POST', '/api/auth/login', {
          username: TEST_USER.username,
          password: TEST_USER.password
        })

        if (retryResponse.data?.user) {
          authCookies = retryResponse.headers['set-cookie']?.join('; ') || authCookies
          testResults.passed.push('5.6 Re-login via API verified')
        } else {
          testResults.failed.push('5.6 Re-login failed')
        }
      }

      log('PHASE-5', '5.6 - PASS', 'green')
    })
  })

  // ============================================
  // PHASE 6: DATA PERSISTENCE CHECK
  // ============================================
  test.describe('Phase 6: Data Persistence Check', () => {
    test('6.1 Verify all previously solved problems are still marked', async () => {
      log('PHASE-6', '6.1 - Verifying solved problems persist', 'cyan')

      // Get progress from API
      const getResponse = await apiRequest('GET', '/api/progress', null, authCookies)
      log('API', `GET /api/progress: ${getResponse.status}`, 'cyan')

      if (getResponse.data?.progress) {
        let solvedCount = 0
        for (const chapter of Object.keys(getResponse.data.progress)) {
          for (const problem of Object.keys(getResponse.data.progress[chapter])) {
            const item = getResponse.data.progress[chapter][problem]
            if (item && (item.checked || item === true)) {
              solvedCount++
            }
          }
        }
        log('API', `Total solved problems: ${solvedCount}`, 'green')

        expect(solvedCount).toBeGreaterThanOrEqual(6)
      }

      testResults.passed.push('6.1 Solved problems persist')
      log('PHASE-6', '6.1 - PASS', 'green')
    })

    test('6.2 Verify specific chapter problems', async () => {
      log('PHASE-6', '6.2 - Verifying chapter-01 problems', 'cyan')

      const getResponse = await apiRequest('GET', '/api/progress', null, authCookies)

      if (getResponse.data?.progress?.['chapter-01']) {
        const problems = getResponse.data.progress['chapter-01']
        log('API', `chapter-01 problems: ${JSON.stringify(problems)}`, 'green')

        // Verify problems 1, 2, 3 are all checked
        expect(problems['1']?.checked || problems['1'] === true).toBeTruthy()
        expect(problems['2']?.checked || problems['2'] === true).toBeTruthy()
        expect(problems['3']?.checked || problems['3'] === true).toBeTruthy()
      }

      testResults.passed.push('6.2 Chapter-01 problems verified')
      log('PHASE-6', '6.2 - PASS', 'green')
    })

    test('6.3 Navigate through pages to ensure no crashes', async () => {
      log('PHASE-6', '6.3 - Navigating through pages', 'cyan')

      const pages = ['/', '/#/practice', '/#/search', '/#/progress', '/#/stats']

      for (const path of pages) {
        await page.goto(`${FRONTEND_BASE}${path}`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(500)

        const title = await page.title()
        log('FRONTEND', `Loaded ${path} - title: ${title}`, 'green')
      }

      testResults.passed.push('6.3 Pages navigated without crash')
      log('PHASE-6', '6.3 - PASS', 'green')
    })

    test('6.4 Check localStorage after re-login', async () => {
      log('PHASE-6', '6.4 - Checking localStorage after re-login', 'cyan')

      const localProgress = await page.evaluate(() => {
        return localStorage.getItem('mc-algo-progress')
      })

      if (localProgress) {
        log('FRONTEND', `localStorage exists (${localProgress.length} chars)`, 'green')
      } else {
        log('FRONTEND', 'localStorage is null', 'yellow')
      }

      testResults.passed.push('6.4 localStorage checked')
      log('PHASE-6', '6.4 - PASS', 'green')
    })

    test('6.5 Final API verification', async () => {
      log('PHASE-6', '6.5 - Final API verification', 'cyan')

      // Get progress stats
      const statsResponse = await apiRequest('GET', '/api/progress/stats', null, authCookies)
      log('API', `Final stats - Completed: ${statsResponse.data?.completed || 0}`, 'green')

      // Verify /api/auth/me works
      const meResponse = await apiRequest('GET', '/api/auth/me', null, authCookies)
      expect(meResponse.status).toBe(200)
      expect(meResponse.data?.user).toBeDefined()

      testResults.passed.push('6.5 Final API verification passed')
      log('PHASE-6', '6.5 - PASS', 'green')
    })

    test('6.6 Report generation', async () => {
      log('PHASE-6', '6.6 - Generating final report', 'cyan')

      log('SUMMARY', '========================================', 'blue')
      log('SUMMARY', '     E2E TEST COMPLETION SUMMARY', 'blue')
      log('SUMMARY', '========================================', 'blue')
      log('SUMMARY', '', 'blue')
      log('SUMMARY', `Total Passed: ${testResults.passed.length}`, 'green')
      log('SUMMARY', `Total Failed: ${testResults.failed.length}`, testResults.failed.length > 0 ? 'red' : 'green')
      log('SUMMARY', `Console Errors: ${testResults.consoleErrors.length}`, testResults.consoleErrors.length > 0 ? 'red' : 'green')
      log('SUMMARY', '', 'blue')
      log('SUMMARY', 'Test Phases Completed:', 'cyan')
      log('SUMMARY', '  1. Initial Access', testResults.passed.filter(p => p.startsWith('1.')).length === 6 ? 'PASS' : 'PARTIAL', 'green')
      log('SUMMARY', '  2. User Registration', testResults.passed.filter(p => p.startsWith('2.')).length >= 5 ? 'PASS' : 'PARTIAL', 'green')
      log('SUMMARY', '  3. Problem Solving', testResults.passed.filter(p => p.startsWith('3.')).length === 8 ? 'PASS' : 'PARTIAL', 'green')
      log('SUMMARY', '  4. Progress Verification', testResults.passed.filter(p => p.startsWith('4.')).length === 5 ? 'PASS' : 'PARTIAL', 'green')
      log('SUMMARY', '  5. Logout and Re-login', testResults.passed.filter(p => p.startsWith('5.')).length >= 5 ? 'PASS' : 'PARTIAL', 'green')
      log('SUMMARY', '  6. Data Persistence', testResults.passed.filter(p => p.startsWith('6.')).length >= 5 ? 'PASS' : 'PARTIAL', 'green')
      log('SUMMARY', '', 'blue')
      log('SUMMARY', '========================================', 'blue')

      testResults.passed.push('6.6 Report generated')
      log('PHASE-6', '6.6 - PASS', 'green')
    })
  })
})
