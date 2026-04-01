/**
 * GitHub Stats Fetcher
 *
 * Fetches commit statistics from GitHub Search API for a given username.
 * Implements monthly pagination to work around the 1000-result limit.
 *
 * Usage:
 *   node scripts/fetch-github-stats.js          # Run once (for cron)
 *   node scripts/fetch-github-stats.js --all   # Update stats for all users
 *
 * Environment:
 *   GITHUB_TOKEN       - GitHub Personal Access Token
 *   PGHOST, PGPORT... - PostgreSQL connection settings
 */

require('dotenv').config()
const { Pool } = require('pg')

// PostgreSQL pool
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || 'algorithmcamp',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
})

/**
 * Fetch stats for a single GitHub user
 */
async function fetchUserStats(username) {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is required')
  }

  const today = new Date().toISOString().split('T')[0]
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const dailyCounts = {}
  let totalCommits = 0

  console.log(`[GitHub Stats] Fetching commits for ${username} (${oneYearAgo} to ${today})`)

  // Query monthly batches (GitHub Search API limit: 1000 results per query)
  let current = oneYearAgo
  while (current < today) {
    const monthEnd = getMonthEnd(current)
    const end = monthEnd > today ? today : monthEnd

    const query = `author:${username} author-date:${current}..${end}`
    let page = 1
    let hasMore = true

    while (hasMore && page <= 10) {
      const url = `https://api.github.com/search/commits?q=${encodeURIComponent(query)}&per_page=100&page=${page}`

      try {
        const res = await fetch(url, {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.cloak-preview+json',
            'User-Agent': 'AlgorithmCamp-Stats-Fetcher'
          }
        })

        if (res.status === 422) {
          // 422 means no results for this query
          hasMore = false
          break
        }

        if (!res.ok) {
          const body = await res.text()
          throw new Error(`GitHub API error: ${res.status} ${body}`)
        }

        const data = await res.json()
        const items = data.items || []

        if (items.length === 0) {
          hasMore = false
          break
        }

        for (const item of items) {
          const day = item.commit.author.date.split('T')[0]
          dailyCounts[day] = (dailyCounts[day] || 0) + 1
          totalCommits++
        }

        if (items.length < 100) {
          hasMore = false
          break
        }

        page++
      } catch (e) {
        console.error(`[GitHub Stats] Error fetching page ${page} for ${current}-${end}:`, e.message)
        hasMore = false
      }
    }

    current = getNextMonthStart(current)
  }

  // Calculate streaks
  const { current: currentStreak, longest: longestStreak } = calcStreaks(dailyCounts)

  console.log(`[GitHub Stats] ${username}: ${totalCommits} commits, current streak: ${currentStreak}, longest: ${longestStreak}`)

  return { totalCommits, currentStreak, longestStreak, calendar: dailyCounts }
}

/**
 * Update stats for a specific user in the database
 */
async function updateDbStats(userId, username) {
  const stats = await fetchUserStats(username)

  await pool.query(`
    UPDATE github_stats SET
      total_commits = $1,
      current_streak = $2,
      longest_streak = $3,
      calendar = $4,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $5
  `, [
    stats.totalCommits,
    stats.currentStreak,
    stats.longestStreak,
    JSON.stringify(stats.calendar),
    userId
  ])

  return stats
}

/**
 * Update stats for all users with GitHub usernames configured
 */
async function updateAllStats() {
  const result = await pool.query(
    "SELECT user_id, github_username FROM github_stats WHERE github_username IS NOT NULL AND github_username != ''"
  )

  const users = result.rows
  console.log(`[GitHub Stats] Updating stats for ${users.length} users`)

  for (const { user_id, github_username } of users) {
    try {
      const stats = await updateDbStats(user_id, github_username)
      console.log(`[GitHub Stats] Updated ${github_username}: ${stats.totalCommits} commits`)
    } catch (e) {
      console.error(`[GitHub Stats] Failed for ${github_username}:`, e.message)
    }
  }
}

/**
 * Run as standalone script
 */
if (require.main === module) {
  const args = process.argv.slice(2)
  const mode = args[0]

  ;(async () => {
    try {
      if (mode === '--all') {
        // Update all users
        await updateAllStats()
      } else {
        // Update default user (GITHUB_USER env var)
        const username = process.env.GITHUB_USER
        if (!username) {
          console.error('[GitHub Stats] GITHUB_USER environment variable required when running standalone')
          process.exit(1)
        }
        const stats = await updateDbStats(null, username)
        console.log('[GitHub Stats] Done:', stats)
      }
    } finally {
      await pool.end()
    }
  })().catch(e => {
    console.error('[GitHub Stats] Fatal error:', e)
    process.exit(1)
  })
}

function getMonthEnd(dateStr) {
  const [y, m] = dateStr.split('-').map(Number)
  return new Date(y, m, 0).toISOString().split('T')[0]
}

function getNextMonthStart(dateStr) {
  const [y, m] = dateStr.split('-').map(Number)
  return new Date(y, m, 1).toISOString().split('T')[0]
}

function calcStreaks(dailyCounts) {
  const dates = Object.keys(dailyCounts).sort()
  if (dates.length === 0) return { current: 0, longest: 0 }

  // Longest streak - find max consecutive days with commits
  let longest = 0
  let temp = 0
  let prev = null

  for (const d of dates) {
    if (!dailyCounts[d]) {
      temp = 0
      prev = null
      continue
    }
    if (prev && new Date(d) - new Date(prev) === 86400000) {
      temp++
    } else {
      temp = 1
    }
    longest = Math.max(longest, temp)
    prev = d
  }

  // Current streak - count backwards from today
  let current = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let check = new Date(today)

  // If no commit today, start from yesterday
  const todayStr = check.toISOString().split('T')[0]
  if (!dailyCounts[todayStr]) {
    check.setDate(check.getDate() - 1)
  }

  while (dailyCounts[check.toISOString().split('T')[0]]) {
    current++
    check.setDate(check.getDate() - 1)
  }

  return { current, longest }
}

module.exports = { fetchUserStats, updateDbStats, updateAllStats }
