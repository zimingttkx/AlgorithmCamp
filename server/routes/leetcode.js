/**
 * LeetCode API Routes
 * Public endpoints for fetching LeetCode user statistics
 *
 * Implements in-memory caching with 1-hour TTL
 */

const express = require('express')
const fetch = require('node-fetch')

const router = express.Router()

// Simple in-memory cache with TTL support
class SimpleCache {
  constructor(ttlSeconds) {
    this.cache = new Map()
    this.ttl = ttlSeconds * 1000
  }

  get(key) {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.value
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttl
    })
  }

  del(key) {
    return this.cache.delete(key)
  }

  // Clear all entries for a user
  clearUser(username) {
    const prefix = `leetcode:${username}`
    for (const key of this.cache.keys()) {
      if (key.includes(prefix) || key.includes(`:${username}:`)) {
        this.cache.delete(key)
      }
    }
  }

  getStats() {
    let hits = 0
    let misses = 0
    let size = 0
    for (const entry of this.cache.values()) {
      size++
      if (Date.now() <= entry.expiresAt) {
        hits++
      } else {
        misses++
      }
    }
    return { size, hits, misses }
  }
}

// Cache with 1-hour TTL
const cache = new SimpleCache(3600)

// Rate limiter for LeetCode API calls (prevent abuse)
const rateLimiter = new Map()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX = 10 // max 10 requests per minute per IP

function checkRateLimit(ip) {
  const now = Date.now()
  const record = rateLimiter.get(ip)

  if (!record) {
    rateLimiter.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (now > record.resetAt) {
    rateLimiter.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false
  }

  record.count++
  return true
}

// LeetCode GraphQL endpoint
const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql'

// GraphQL queries
const userStatsQuery = `
  query userStats($username: String!) {
    matchedUser(username: $username) {
      username
      submitCalendar: submitCalendarGlobal
      contributions {
        points
      }
      profile {
        ranking
        realName
        userAvatar
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
  }
`

const solvedProblemsQuery = `
  query solvedProblems($username: String!) {
    matchedUser(username: $username) {
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
      problemsSolvedBeatsStats {
        difficulty
        percentage
      }
      recentSubmissionList(pageSize: 100) {
        title
        titleSlug
        timestamp
        statusDisplay
        difficulty
      }
    }
  }
`

/**
 * Execute GraphQL query against LeetCode API
 */
async function leetCodeGraphQL(query, variables, username) {
  if (!checkRateLimit('global')) {
    throw new Error('Rate limit exceeded, please try again later')
  }

  // Small delay to avoid hitting LeetCode too fast
  await new Promise(resolve => setTimeout(resolve, 200))

  const response = await fetch(LEETCODE_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    body: JSON.stringify({ query, variables })
  })

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('LeetCode API rate limit exceeded. Please try again later.')
    }
    throw new Error(`LeetCode API error: ${response.status}`)
  }

  const data = await response.json()

  if (data.errors) {
    const errorMsg = data.errors[0]?.message || 'Unknown GraphQL error'
    if (errorMsg.includes('user does not exist') || errorMsg.includes('No such user')) {
      throw new Error(`User '${username}' not found on LeetCode`)
    }
    throw new Error(errorMsg)
  }

  return data.data
}

/**
 * GET /api/leetcode/:username
 * Get LeetCode user statistics
 */
router.get('/:username', async (req, res) => {
  const { username } = req.params

  // Validate username (prevent XSS/injection)
  if (!username || !/^[a-zA-Z0-9_-]+$/.test(username)) {
    return res.status(400).json({ error: 'Invalid username format' })
  }

  const cacheKey = `leetcode:stats:${username}`

  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached) {
    return res.json({
      ...cached,
      cached: true
    })
  }

  try {
    const data = await leetCodeGraphQL(userStatsQuery, { username }, username)
    const user = data.matchedUser

    if (!user) {
      return res.status(404).json({ error: `User '${username}' not found on LeetCode` })
    }

    // Parse submit calendar (it's a JSON string)
    let calendar = {}
    try {
      calendar = JSON.parse(user.submitCalendar || '{}')
    } catch {
      calendar = {}
    }

    // Build stats response
    const stats = {
      username: user.username,
      ranking: user.profile?.ranking || null,
      realName: user.profile?.realName || null,
      avatar: user.profile?.userAvatar || null,
      points: user.contributions?.points || 0,
      totalSolved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
      calendar,
      fetchedAt: new Date().toISOString()
    }

    // Parse submission counts
    if (user.submitStatsGlobal?.acSubmissionNum) {
      for (const item of user.submitStatsGlobal.acSubmissionNum) {
        const difficulty = (item.difficulty || '').toLowerCase()
        if (difficulty === 'all') {
          stats.totalSolved = item.count
        } else if (difficulty === 'easy') {
          stats.easySolved = item.count
        } else if (difficulty === 'medium') {
          stats.mediumSolved = item.count
        } else if (difficulty === 'hard') {
          stats.hardSolved = item.count
        }
      }
    }

    // Cache the result
    cache.set(cacheKey, stats)

    res.json({
      ...stats,
      cached: false
    })
  } catch (e) {
    console.error(`[LeetCode] Stats error for ${username}:`, e.message)
    res.status(500).json({ error: e.message || 'Failed to fetch LeetCode stats' })
  }
})

/**
 * GET /api/leetcode/:username/solved
 * Get list of solved problems for a user
 */
router.get('/:username/solved', async (req, res) => {
  const { username } = req.params
  const { difficulty } = req.query

  // Validate username
  if (!username || !/^[a-zA-Z0-9_-]+$/.test(username)) {
    return res.status(400).json({ error: 'Invalid username format' })
  }

  const cacheKey = difficulty
    ? `leetcode:solved:${username}:${difficulty}`
    : `leetcode:solved:${username}:all`

  // Check cache
  const cached = cache.get(cacheKey)
  if (cached) {
    return res.json({
      ...cached,
      cached: true
    })
  }

  try {
    const data = await leetCodeGraphQL(solvedProblemsQuery, { username }, username)
    const user = data.matchedUser

    if (!user) {
      return res.status(404).json({ error: `User '${username}' not found on LeetCode` })
    }

    // Get unique solved problems from recent submissions
    const solvedMap = new Map()

    for (const submission of user.recentSubmissionList || []) {
      // Only count accepted submissions
      if (submission.statusDisplay === 'Accepted') {
        if (!solvedMap.has(submission.titleSlug)) {
          solvedMap.set(submission.titleSlug, {
            title: submission.title,
            titleSlug: submission.titleSlug,
            difficulty: submission.difficulty,
            lastSubmitted: parseInt(submission.timestamp) * 1000
          })
        }
      }
    }

    // Convert to array
    let problems = Array.from(solvedMap.values())

    // Filter by difficulty if specified
    if (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      problems = problems.filter(p => p.difficulty === difficulty)
    }

    // Sort by difficulty then by title
    const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 }
    problems.sort((a, b) => {
      const diffCompare = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
      if (diffCompare !== 0) return diffCompare
      return a.title.localeCompare(b.title)
    })

    const result = {
      username,
      totalSolved: problems.length,
      byDifficulty: {
        Easy: problems.filter(p => p.difficulty === 'Easy').length,
        Medium: problems.filter(p => p.difficulty === 'Medium').length,
        Hard: problems.filter(p => p.difficulty === 'Hard').length
      },
      problems,
      fetchedAt: new Date().toISOString()
    }

    // Cache the result
    cache.set(cacheKey, result)

    res.json({
      ...result,
      cached: false
    })
  } catch (e) {
    console.error(`[LeetCode] Solved error for ${username}:`, e.message)
    res.status(500).json({ error: e.message || 'Failed to fetch solved problems' })
  }
})

/**
 * DELETE /api/leetcode/:username/cache
 * Invalidate cache for a specific user
 */
router.delete('/:username/cache', (req, res) => {
  const { username } = req.params

  if (!username || !/^[a-zA-Z0-9_-]+$/.test(username)) {
    return res.status(400).json({ error: 'Invalid username format' })
  }

  cache.clearUser(username)

  res.json({ success: true, message: `Cache cleared for user ${username}` })
})

/**
 * GET /api/leetcode/cache/stats
 * Get cache statistics (for monitoring)
 */
router.get('/cache/stats', (req, res) => {
  const stats = cache.getStats()
  res.json({
    keys: stats.size,
    hits: stats.hits,
    misses: stats.misses
  })
})

module.exports = router