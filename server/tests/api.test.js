/**
 * Integration Tests for Server API Routes
 * Tests auth, progress, and stats endpoints
 *
 * Run with: node tests/api.test.js
 * (Requires server to be running on port 3001)
 */

const http = require('http')

const BASE_URL = 'http://localhost:3001'
const TEST_USER = `testuser_${Date.now()}`
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
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null
          })
        } catch {
          resolve({ status: res.statusCode, data })
        }
      })
    })

    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms))
}

let accessToken = ''
let refreshToken = ''
let userId = ''

// ============ AUTH TESTS ============

async function testAuth() {
  console.log('\n=== AUTH TESTS ===')

  // Test 1: Register
  console.log('Test: Register new user...')
  let res = await apiRequest('POST', '/api/auth/register', {
    username: TEST_USER,
    password: TEST_PASSWORD,
    githubUsername: 'zimingttkx'
  })
  console.assert(res.status === 201, `Expected 201, got ${res.status}`)
  console.assert(res.data.accessToken, 'Should return accessToken')
  console.assert(res.data.refreshToken, 'Should return refreshToken')
  console.assert(res.data.username === TEST_USER, 'Should return username')
  accessToken = res.data.accessToken
  refreshToken = res.data.refreshToken
  userId = TEST_USER
  console.log('  ✓ Register passed')

  // Test 2: Register duplicate username
  console.log('Test: Register duplicate username...')
  res = await apiRequest('POST', '/api/auth/register', {
    username: TEST_USER,
    password: TEST_PASSWORD
  })
  console.assert(res.status === 409, `Expected 409, got ${res.status}`)
  console.log('  ✓ Duplicate registration rejected')

  // Test 3: Login with correct credentials
  console.log('Test: Login correct credentials...')
  res = await apiRequest('POST', '/api/auth/login', {
    username: TEST_USER,
    password: TEST_PASSWORD
  })
  console.assert(res.status === 200, `Expected 200, got ${res.status}`)
  console.assert(res.data.accessToken, 'Should return accessToken')
  console.log('  ✓ Login passed')

  // Test 4: Login with wrong password
  console.log('Test: Login wrong password...')
  res = await apiRequest('POST', '/api/auth/login', {
    username: TEST_USER,
    password: 'wrongpassword'
  })
  console.assert(res.status === 401, `Expected 401, got ${res.status}`)
  console.log('  ✓ Wrong password rejected')

  // Test 5: Login with non-existent user
  console.log('Test: Login non-existent user...')
  res = await apiRequest('POST', '/api/auth/login', {
    username: 'nonexistent',
    password: TEST_PASSWORD
  })
  console.assert(res.status === 401, `Expected 401, got ${res.status}`)
  console.log('  ✓ Non-existent user rejected')

  // Test 6: Get current user (with valid token)
  console.log('Test: Get current user with valid token...')
  res = await apiRequest('GET', '/api/auth/me', null, {
    'Authorization': `Bearer ${accessToken}`
  })
  console.assert(res.status === 200, `Expected 200, got ${res.status}`)
  console.assert(res.data.user.username === TEST_USER, 'Should return correct username')
  console.log('  ✓ Get current user passed')

  // Test 7: Get current user without token
  console.log('Test: Get current user without token...')
  res = await apiRequest('GET', '/api/auth/me')
  console.assert(res.status === 401, `Expected 401, got ${res.status}`)
  console.log('  ✓ Unauthenticated request rejected')

  // Test 8: Refresh token
  console.log('Test: Refresh access token...')
  res = await apiRequest('POST', '/api/auth/refresh', {
    refreshToken
  })
  console.assert(res.status === 200, `Expected 200, got ${res.status}`)
  console.assert(res.data.accessToken, 'Should return new accessToken')
  console.log('  ✓ Token refresh passed')

  // Test 9: Refresh with invalid token
  console.log('Test: Refresh with invalid token...')
  res = await apiRequest('POST', '/api/auth/refresh', {
    refreshToken: 'invalid_token'
  })
  console.assert(res.status === 401, `Expected 401, got ${res.status}`)
  console.log('  ✓ Invalid refresh token rejected')
}

// ============ PROGRESS TESTS ============

async function testProgress() {
  console.log('\n=== PROGRESS TESTS ===')
  const auth = { 'Authorization': `Bearer ${accessToken}` }

  // Test 1: Get empty progress
  console.log('Test: Get empty progress for new user...')
  let res = await apiRequest('GET', '/api/progress', null, auth)
  console.assert(res.status === 200, `Expected 200, got ${res.status}`)
  console.assert(Object.keys(res.data.progress || {}).length === 0, 'Should have empty progress')
  console.log('  ✓ Empty progress passed')

  // Test 2: Toggle single problem
  console.log('Test: Toggle single problem...')
  res = await apiRequest('PUT', '/api/progress/chapter-01/prob_1', { checked: true }, auth)
  console.assert(res.status === 200, `Expected 200, got ${res.status}`)
  console.assert(res.data.checked === true, 'Should return checked=true')
  console.log('  ✓ Toggle single problem passed')

  // Test 3: Verify single problem is saved
  console.log('Test: Verify single problem is saved...')
  res = await apiRequest('GET', '/api/progress', null, auth)
  console.assert(res.data.progress['chapter-01']['prob_1'].checked === true, 'Should be checked')
  console.log('  ✓ Problem verification passed')

  // Test 4: Bulk PUT progress
  console.log('Test: Bulk PUT progress...')
  res = await apiRequest('PUT', '/api/progress', {
    progress: {
      'chapter-01': { '2': true, '3': true },
      'chapter-02': { '1': true }
    }
  }, auth)
  console.assert(res.status === 200, `Expected 200, got ${res.status}`)
  console.log('  ✓ Bulk PUT passed')

  // Test 5: Verify bulk PUT
  console.log('Test: Verify bulk PUT results...')
  res = await apiRequest('GET', '/api/progress', null, auth)
  console.assert(res.data.progress['chapter-01']['prob_1'].checked === true, 'Should keep previous')
  console.assert(res.data.progress['chapter-01']['2'].checked === true, 'Should have prob 2')
  console.assert(res.data.progress['chapter-02']['1'].checked === true, 'Should have chapter-02 prob 1')
  console.log('  ✓ Bulk verification passed')

  // Test 6: Toggle same problem back off
  console.log('Test: Toggle problem off...')
  res = await apiRequest('PUT', '/api/progress/chapter-01/prob_1', { checked: false }, auth)
  console.assert(res.status === 200, `Expected 200, got ${res.status}`)
  res = await apiRequest('GET', '/api/progress', null, auth)
  console.assert(res.data.progress['chapter-01']['prob_1'].checked === false, 'Should be unchecked')
  console.log('  ✓ Toggle off passed')

  // Test 7: Unauthenticated request rejected
  console.log('Test: Progress without auth...')
  res = await apiRequest('GET', '/api/progress')
  console.assert(res.status === 401, `Expected 401, got ${res.status}`)
  console.log('  ✓ Unauthenticated rejected')

  // Test 8: Toggle without auth
  console.log('Test: Toggle without auth...')
  res = await apiRequest('PUT', '/api/progress/chapter-01/prob_1', { checked: true })
  console.assert(res.status === 401, `Expected 401, got ${res.status}`)
  console.log('  ✓ Unauthenticated toggle rejected')

  // Test 9: Progress history
  console.log('Test: Get progress history...')
  res = await apiRequest('GET', '/api/progress/history', null, auth)
  console.assert(res.status === 200, `Expected 200, got ${res.status}`)
  console.assert(Array.isArray(res.data.history), 'Should return history array')
  console.log('  ✓ History passed')

  // Test 10: Progress stats
  console.log('Test: Get progress stats...')
  res = await apiRequest('GET', '/api/progress/stats', null, auth)
  console.assert(res.status === 200, `Expected 200, got ${res.status}`)
  console.assert(typeof res.data.totalChapters === 'number', 'Should have totalChapters')
  console.assert(typeof res.data.completed === 'number', 'Should have completed count')
  console.log('  ✓ Stats passed')
}

// ============ STATS TESTS ============

async function testStats() {
  console.log('\n=== STATS TESTS ===')
  const auth = { 'Authorization': `Bearer ${accessToken}` }

  // Test 1: Get empty stats for new user
  console.log('Test: Get empty stats...')
  let res = await apiRequest('GET', '/api/stats', null, auth)
  console.assert(res.status === 200, `Expected 200, got ${res.status}`)
  console.assert(res.data.githubUsername === 'zimingttkx', 'Should have github username')
  console.log('  ✓ Empty stats passed')

  // Test 2: Update github username
  console.log('Test: Update github username...')
  res = await apiRequest('PUT', '/api/stats/github', { githubUsername: 'zimingttkx' }, auth)
  console.assert(res.status === 200, `Expected 200, got ${res.status}`)
  console.log('  ✓ Github username update passed')

  // Test 3: Stats without auth
  console.log('Test: Stats without auth...')
  res = await apiRequest('GET', '/api/stats')
  console.assert(res.status === 401, `Expected 401, got ${res.status}`)
  console.log('  ✓ Stats auth required')
}

// ============ CHAPTERS TESTS ============

async function testChapters() {
  console.log('\n=== CHAPTERS TESTS ===')

  // Test 1: Get all chapters
  console.log('Test: Get all chapters...')
  let res = await apiRequest('GET', '/api/chapters')
  console.assert(res.status === 200, `Expected 200, got ${res.status}`)
  console.assert(Array.isArray(res.data.chapters), 'Should return chapters array')
  console.assert(res.data.chapters.length === 12, 'Should have 12 chapters')
  console.log('  ✓ Get all chapters passed')

  // Test 2: Get single chapter
  console.log('Test: Get single chapter...')
  res = await apiRequest('GET', '/api/chapters/chapter-01')
  console.assert(res.status === 200, `Expected 200, got ${res.status}`)
  console.assert(res.data.chapter.id === 'chapter-01', 'Should return chapter-01')
  console.log('  ✓ Get single chapter passed')

  // Test 3: Get non-existent chapter
  console.log('Test: Get non-existent chapter...')
  res = await apiRequest('GET', '/api/chapters/chapter-99')
  console.assert(res.status === 404, `Expected 404, got ${res.status}`)
  console.log('  ✓ Non-existent chapter returns 404')
}

// ============ HEALTH CHECK ============

async function testHealth() {
  console.log('\n=== HEALTH CHECK ===')
  const res = await apiRequest('GET', '/api/health')
  console.assert(res.status === 200, `Expected 200, got ${res.status}`)
  console.assert(res.data.status === 'ok', 'Should return ok status')
  console.log('  ✓ Health check passed')
}

// ============ RUN ALL TESTS ============

async function runTests() {
  console.log('╔══════════════════════════════════════╗')
  console.log('║   AlgorithmCamp API Integration Tests   ║')
  console.log('╚══════════════════════════════════════╝')

  try {
    await testHealth()
    await testAuth()
    await testProgress()
    await testStats()
    await testChapters()

    console.log('\n✅ ALL TESTS PASSED')
    process.exit(0)
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message)
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

    const server = require('../index.js')

    // Wait for server to start
    await delay(2000)
  }

  await runTests()
}

main()
