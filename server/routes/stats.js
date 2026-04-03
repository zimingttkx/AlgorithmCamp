/**
 * Stats Routes (MongoDB Version)
 */

const express = require('express')
const jwt = require('jsonwebtoken')
const db = require('../db/mongodb')

const router = express.Router()

// Auth middleware
async function authMiddleware(req, res, next) {
  const token = req.cookies?.access_token || req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'not authenticated' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.type !== 'access') {
      return res.status(401).json({ error: 'invalid token type' })
    }
    
    req.userId = decoded.userId
    next()
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'token expired' })
    }
    return res.status(401).json({ error: 'authentication failed' })
  }
}

router.use(authMiddleware)

// GET /api/stats - Get user stats
router.get('/', async (req, res) => {
  try {
    const userProgress = await db.getProgress(req.userId)
    const progressData = userProgress?.data || {}
    
    // Calculate stats
    let total = 0
    let completed = 0
    const heatmapMap = new Map()

    for (const [chapterId, problems] of Object.entries(progressData)) {
      for (const [problemId, data] of Object.entries(problems)) {
        total++
        if (data?.checked) {
          completed++
          if (data.checkedAt) {
            const date = data.checkedAt.split('T')[0]
            heatmapMap.set(date, (heatmapMap.get(date) || 0) + 1)
          }
        }
      }
    }

    // Build heatmap
    const heatmap = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 89; i >= 0; i--) { // Last 90 days
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      heatmap.push({
        date: dateStr,
        count: heatmapMap.get(dateStr) || 0
      })
    }

    res.json({
      totalProblems: total,
      solvedProblems: completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      heatmap
    })
  } catch (e) {
    console.error('[Stats] Error:', e)
    res.status(500).json({ error: 'failed to get stats' })
  }
})

module.exports = router
