/**
 * Stats Routes
 * GitHub commit statistics
 */

const express = require('express')
const db = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

router.use(authMiddleware)

// GET /api/stats
router.get('/', async (req, res) => {
  try {
    const stats = await db.get(
      'SELECT github_username, total_commits, current_streak, longest_streak, calendar, updated_at FROM github_stats WHERE user_id = $1',
      [req.userId]
    )

    if (!stats) {
      return res.json({
        githubUsername: '',
        totalCommits: 0,
        currentStreak: 0,
        longestStreak: 0,
        calendar: {},
        updatedAt: null
      })
    }

    res.json({
      githubUsername: stats.github_username,
      totalCommits: stats.total_commits,
      currentStreak: stats.current_streak,
      longestStreak: stats.longest_streak,
      calendar: typeof stats.calendar === 'string' ? JSON.parse(stats.calendar || '{}') : (stats.calendar || {}),
      updatedAt: stats.updated_at
    })
  } catch (e) {
    console.error('[Stats] Get error:', e)
    res.status(500).json({ error: 'failed to get stats' })
  }
})

// PUT /api/stats/github - Update GitHub username
router.put('/github', async (req, res) => {
  const { githubUsername } = req.body

  if (!githubUsername || typeof githubUsername !== 'string') {
    return res.status(400).json({ error: 'githubUsername required' })
  }

  try {
    const existing = await db.get('SELECT user_id FROM github_stats WHERE user_id = $1', [req.userId])
    if (existing) {
      await db.run(
        'UPDATE github_stats SET github_username = $1 WHERE user_id = $2',
        [githubUsername, req.userId]
      )
    } else {
      await db.run(
        'INSERT INTO github_stats (user_id, github_username) VALUES ($1, $2)',
        [req.userId, githubUsername]
      )
    }

    res.json({ success: true, githubUsername })
  } catch (e) {
    console.error('[Stats] Update error:', e)
    res.status(500).json({ error: 'failed to update github username' })
  }
})

// POST /api/stats/refresh - Manually refresh stats
router.post('/refresh', async (req, res) => {
  try {
    const stats = await db.get('SELECT github_username FROM github_stats WHERE user_id = $1', [req.userId])

    if (!stats || !stats.github_username) {
      return res.status(400).json({ error: 'no github username configured' })
    }

    const { fetchUserStats } = require('../scripts/fetch-github-stats')
    const result = await fetchUserStats(stats.github_username)

    if (result) {
      await db.run(`
        UPDATE github_stats SET
          total_commits = $1,
          current_streak = $2,
          longest_streak = $3,
          calendar = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $5
      `, [
        result.totalCommits,
        result.currentStreak,
        result.longestStreak,
        JSON.stringify(result.calendar),
        req.userId
      ])
    }

    res.json({ success: true, stats: result })
  } catch (e) {
    console.error('[Stats] Refresh error:', e)
    res.status(500).json({ error: 'failed to fetch stats: ' + e.message })
  }
})

module.exports = router
