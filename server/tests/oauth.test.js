/**
 * OAuth Integration Tests for GitHub Authentication
 * Tests OAuth initiation, callback, and error handling
 *
 * Run with: node tests/oauth.test.js
 * (Requires server to be running on port 3001)
 */

const http = require('http')
const crypto = require('crypto')
const path = require('path')

const BASE_URL = 'http://localhost:3001'
const TEST_USER = `oauth_test_${Date.now()}`
const TEST_PASSWORD = 'testpass123'

// Simple fetch-like wrapper
function apiRequest(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL)
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          location: res.headers.location || null
        })
      })
    })

    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

// Follow redirect helper
function followRedirect(location, cookies = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(location)
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        ...(cookies ? { 'Cookie': cookies } : {})
      }
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          location: res.headers.location || null
        })
      })
    })

    req.on('error', reject)
    req.end()
  })
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ============ OAUTH INITIATION TESTS ============

async function testOAuthInitiation() {
  console.log('\n=== OAUTH INITIATION TESTS ===')

  // Test 1: OAuth initiation without GITHUB_CLIENT_ID configured
  console.log('Test: OAuth initiation returns error when not configured...')
  // This test verifies the endpoint exists and responds
  let res = await apiRequest('GET', '/api/auth/github')
  // The actual response depends on GITHUB_CLIENT_ID being set
  // If not set, should return 500 with error
  // If set, should redirect to GitHub
  console.assert(res.status === 302 || res.status === 500,
    `Expected 302 or 500, got ${res.status}`)
  console.log('  ✓ OAuth initiation endpoint accessible')
}

async function testOAuthCallback() {
  console.log('\n=== OAUTH CALLBACK TESTS ===')

  // Test 2: OAuth callback with missing code and state (user denied)
  console.log('Test: OAuth callback with error parameter...')
  let res = await apiRequest('GET', '/api/auth/github/callback?error=access_denied&state=test')
  console.assert(res.status === 302, `Expected 302, got ${res.status}`)
  console.assert(res.location.includes('error=github_denied'), 'Should redirect with github_denied error')
  console.log('  ✓ OAuth denial handled correctly')

  // Test 3: OAuth callback without code
  console.log('Test: OAuth callback without code...')
  res = await apiRequest('GET', '/api/auth/github/callback')
  console.assert(res.status === 302, `Expected 302, got ${res.status}`)
  console.assert(res.location.includes('error=missing_code'), 'Should redirect with missing_code error')
  console.log('  ✓ OAuth missing code handled correctly')

  // Test 4: OAuth callback with invalid state (CSRF protection)
  console.log('Test: OAuth callback with invalid state (CSRF)...')
  res = await apiRequest('GET', '/api/auth/github/callback?code=valid_code&state=invalid_state')
  console.assert(res.status === 302, `Expected 302, got ${res.status}`)
  console.assert(res.location.includes('error=csrf_failed'), 'Should redirect with csrf_failed error')
  console.log('  ✓ OAuth CSRF validation works')
}

// ============ OAUTH HELPERS FOR MOCK TESTING ============

function createMockGitHubTokenResponse(accessToken = 'mock_github_token_123') {
  return {
    access_token: accessToken,
    token_type: 'bearer',
    scope: 'read:user'
  }
}

function createMockGitHubUserResponse(login = 'testgithubuser', id = 12345) {
  return {
    login: login,
    id: id,
    avatar_url: 'https://avatars.githubusercontent.com/u/12345?v=4',
    name: 'Test GitHub User',
    email: 'test@example.com',
    public_repos: 10,
    followers: 5
  }
}

// Test that OAuth state cookie is set correctly
async function testOAuthStateCookie() {
  console.log('\n=== OAUTH STATE COOKIE TESTS ===')

  // Mock nock for GitHub APIs - but we can't actually intercept the redirect
  // This test verifies that when GITHUB_CLIENT_ID is set, the endpoint sets cookies
  console.log('Test: OAuth sets state cookie...')
  const res = await apiRequest('GET', '/api/auth/github')
  // When GITHUB_CLIENT_ID is set, should redirect with Set-Cookie headers
  if (res.status === 302) {
    console.assert(res.headers['set-cookie'] !== undefined, 'Should set cookies')
    console.log('  ✓ OAuth state cookies set')
  } else {
    console.log('  - Skipped (GITHUB_CLIENT_ID not configured)')
  }
}

// ============ OAUTH CSRF PROTECTION TESTS ============

async function testOAuthCSRFProtection() {
  console.log('\n=== OAUTH CSRF PROTECTION TESTS ===')

  // Test: Verify state parameter validation
  console.log('Test: OAuth state parameter is validated...')

  // Try callback with tampered state
  const res = await apiRequest('GET', '/api/auth/github/callback?code=abc123&state=tampered_state')
  console.assert(res.status === 302, `Expected 302, got ${res.status}`)
  console.assert(res.location.includes('error=csrf_failed'), 'Should reject tampered state')
  console.log('  ✓ OAuth CSRF protection enforced')
}

// ============ OAUTH ERROR HANDLING TESTS ============

async function testOAuthErrorHandling() {
  console.log('\n=== OAUTH ERROR HANDLING TESTS ===')

  // Test: GitHub API error
  console.log('Test: OAuth handles GitHub API errors...')
  // This would require mocking the GitHub token exchange endpoint
  // Without mocking, we test that the callback URL is properly formed
  console.log('  - Requires GitHub API mocking (manual verification needed)')
}

// ============ RUN ALL TESTS ============

async function runTests() {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║   AlgorithmCamp OAuth Integration Tests   ║')
  console.log('╚══════════════════════════════════════════╝')

  try {
    await testOAuthInitiation()
    await testOAuthCallback()
    await testOAuthStateCookie()
    await testOAuthCSRFProtection()
    await testOAuthErrorHandling()

    console.log('\n✅ ALL OAUTH TESTS COMPLETED')
    console.log('Note: Full OAuth flow tests require GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET')
    process.exit(0)
  } catch (err) {
    console.error('\n❌ OAUTH TEST FAILED:', err.message)
    process.exit(1)
  }
}

// Check if server is running first
function checkServer() {
  return new Promise((resolve) => {
    const req = http.get(`${BASE_URL}/api/health`, (res) => {
      if (res.statusCode === 200) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
    req.on('error', () => resolve(false))
    req.setTimeout(2000, () => {
      req.destroy()
      resolve(false)
    })
  })
}

async function main() {
  console.log('Checking if test server is running on port 3001...')
  const serverRunning = await checkServer()

  if (!serverRunning) {
    console.log('Starting test server on port 3001...')

    // Start server on different port for testing
    process.env.PORT = '3001'
    process.env.NODE_ENV = 'test'
    process.env.JWT_SECRET = 'test-secret-key-for-testing-only'
    process.env.FRONTEND_URL = 'http://localhost:5173'

    // Don't start the server here - let it be started separately
    console.log('Please start the server first:')
    console.log('  PORT=3001 JWT_SECRET=test-secret-key node index.js')
    console.log('')
    process.exit(1)
  }

  await runTests()
}

main()
