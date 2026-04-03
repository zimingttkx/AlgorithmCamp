/**
 * Progress Routes (MongoDB Version)
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
    req.clientId = decoded.clientId
    next()
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'token expired' })
    }
    return res.status(401).json({ error: 'authentication failed' })
  }
}

router.use(authMiddleware)

// GET /api/progress
router.get('/', async (req, res) => {
  try {
    const userProgress = await db.getProgress(req.userId)
    res.json({ progress: userProgress?.data || {} })
  } catch (e) {
    console.error('[Progress] Get error:', e)
    res.status(500).json({ error: 'failed to get progress' })
  }
})

// PUT /api/progress - Save all progress
router.put('/', async (req, res) => {
  const { progress } = req.body

  if (!progress || typeof progress !== 'object') {
    return res.status(400).json({ error: 'progress object required' })
  }

  try {
    await db.saveProgress(req.userId, progress)
    res.json({ success: true, updatedAt: new Date().toISOString() })
  } catch (e) {
    console.error('[Progress] Save error:', e)
    res.status(500).json({ error: 'save failed' })
  }
})

// PUT /api/progress/:chapterId/:problemId - Toggle single
router.put('/:chapterId/:problemId', async (req, res) => {
  const { chapterId, problemId } = req.params
  const { checked } = req.body

  try {
    const userProgress = await db.getProgress(req.userId) || { data: {} }
    const currentValue = userProgress.data?.[chapterId]?.[problemId]
    
    const newValue = checked !== undefined ? checked : !currentValue?.checked

    await db.updateChapterProgress(req.userId, chapterId, problemId, {
      checked: newValue,
      checkedAt: new Date().toISOString()
    })

    res.json({
      chapterId,
      problemId,
      checked: newValue,
      updatedAt: new Date().toISOString()
    })
  } catch (e) {
    console.error('[Progress] Toggle error:', e)
    res.status(500).json({ error: 'toggle failed' })
  }
})

// POST /api/progress/sync - Incremental sync
router.post('/sync', async (req, res) => {
  const { items } = req.body

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'items array required' })
  }

  try {
    const userProgress = await db.getProgress(req.userId) || { data: {} }
    const progressData = userProgress.data || {}
    const syncTime = new Date().toISOString()
    
    const updated = []
    const conflicts = []

    for (const item of items) {
      const { chapterId, problemId, checked, checkedAt } = item

      if (!chapterId || !problemId) continue

      const existing = progressData[chapterId]?.[problemId]
      
      // Client wins (newer timestamp)
      if (!existing || new Date(checkedAt) > new Date(existing.checkedAt || 0)) {
        if (!progressData[chapterId]) {
          progressData[chapterId] = {}
        }
        progressData[chapterId][problemId] = {
          checked,
          checkedAt
        }
        updated.push({ chapterId, problemId, checked })
      } else {
        // Server is newer - report conflict
        conflicts.push({
          chapterId,
          problemId,
          serverValue: existing.checked,
          clientValue: checked
        })
      }
    }

    await db.saveProgress(req.userId, progressData)

    res.json({
      success: true,
      syncTime,
      stats: {
        updated: updated.length,
        conflicts: conflicts.length
      },
      updated,
      conflicts
    })
  } catch (e) {
    console.error('[Progress] Sync error:', e)
    res.status(500).json({ error: 'sync failed' })
  }
})

// GET /api/progress/stats - Get progress stats
router.get('/stats', async (req, res) => {
  try {
    const userProgress = await db.getProgress(req.userId)
    const progressData = userProgress?.data || {}
    
    // Calculate stats
    let total = 0
    let completed = 0
    const byChapter = {}
    const heatmapMap = new Map()

    for (const [chapterId, problems] of Object.entries(progressData)) {
      byChapter[chapterId] = { done: 0, total: 0 }
      
      for (const [problemId, data] of Object.entries(problems)) {
        if (data?.checked) {
          completed++
          byChapter[chapterId].done++
          
          // Build heatmap
          if (data.checkedAt) {
            const date = data.checkedAt.split('T')[0]
            heatmapMap.set(date, (heatmapMap.get(date) || 0) + 1)
          }
        }
        total++
      }
    }

    // Build 365-day heatmap
    const heatmap = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      heatmap.push({
        date: dateStr,
        count: heatmapMap.get(dateStr) || 0
      })
    }

    res.json({
      completed,
      total,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      byChapter,
      heatmap
    })
  } catch (e) {
    console.error('[Progress] Stats error:', e)
    res.status(500).json({ error: 'failed to get stats' })
  }
})

module.exports = router
