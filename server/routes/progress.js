/**
 * Progress Routes
 * All routes require authentication
 */

const express = require('express')
const db = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

router.use(authMiddleware)

// GET /api/progress
router.get('/', async (req, res) => {
  try {
    const rows = await db.all(
      'SELECT chapter_id, problem_id, checked, checked_at FROM progress WHERE user_id = $1',
      [req.userId]
    )

    const progress = {}
    for (const row of rows) {
      if (!progress[row.chapter_id]) {
        progress[row.chapter_id] = {}
      }
      progress[row.chapter_id][row.problem_id] = {
        checked: !!row.checked,
        checkedAt: row.checked_at
      }
    }

    res.json({ progress })
  } catch (e) {
    console.error('[Progress] Get error:', e)
    res.status(500).json({ error: 'failed to get progress' })
  }
})

// PUT /api/progress - Bulk sync
router.put('/', async (req, res) => {
  const { progress } = req.body

  if (!progress || typeof progress !== 'object') {
    return res.status(400).json({ error: 'progress object required' })
  }

  try {
    const settings = await db.get('SELECT client_id FROM user_settings WHERE user_id = $1', [req.userId])
    const clientId = settings?.client_id || req.clientId || 'unknown'

    const client = await db.getClient()

    try {
      await client.query('BEGIN')

      for (const [chapterId, problems] of Object.entries(progress)) {
        if (typeof problems !== 'object') continue

        for (const [problemId, val] of Object.entries(problems)) {
          const checked = val === true || (typeof val === 'object' && val.checked === true)

          // Upsert progress
          const existing = await client.query(
            'SELECT checked FROM progress WHERE user_id = $1 AND chapter_id = $2 AND problem_id = $3',
            [req.userId, chapterId, problemId]
          )

          if (existing.rows.length > 0) {
            await client.query(
              'UPDATE progress SET checked = $1, checked_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND chapter_id = $3 AND problem_id = $4',
              [checked, req.userId, chapterId, problemId]
            )
          } else {
            await client.query(
              'INSERT INTO progress (user_id, chapter_id, problem_id, checked, checked_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
              [req.userId, chapterId, problemId, checked]
            )
          }

          // Insert history
          await client.query(
            'INSERT INTO progress_history (user_id, chapter_id, problem_id, checked, client_id) VALUES ($1, $2, $3, $4, $5)',
            [req.userId, chapterId, problemId, checked, clientId]
          )
        }
      }

      await client.query('COMMIT')
      res.json({ success: true, updatedAt: new Date().toISOString() })
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  } catch (e) {
    console.error('[Progress] Bulk sync error:', e)
    res.status(500).json({ error: 'sync failed' })
  }
})

// PUT /api/progress/:chapterId/:problemId - Toggle single
router.put('/:chapterId/:problemId', async (req, res) => {
  const { chapterId, problemId } = req.params
  const { checked } = req.body

  if (!chapterId || !problemId) {
    return res.status(400).json({ error: 'chapterId and problemId are required' })
  }

  try {
    const existing = await db.get(
      'SELECT checked FROM progress WHERE user_id = $1 AND chapter_id = $2 AND problem_id = $3',
      [req.userId, chapterId, problemId]
    )

    const newValue = checked !== undefined ? checked : !existing?.checked

    const settings = await db.get('SELECT client_id FROM user_settings WHERE user_id = $1', [req.userId])
    const clientId = settings?.client_id || req.clientId || 'unknown'

    if (existing) {
      await db.run(
        'UPDATE progress SET checked = $1, checked_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND chapter_id = $3 AND problem_id = $4',
        [newValue, req.userId, chapterId, problemId]
      )
    } else {
      await db.run(
        'INSERT INTO progress (user_id, chapter_id, problem_id, checked, checked_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
        [req.userId, chapterId, problemId, newValue]
      )
    }

    await db.run(
      'INSERT INTO progress_history (user_id, chapter_id, problem_id, checked, client_id) VALUES ($1, $2, $3, $4, $5)',
      [req.userId, chapterId, problemId, newValue, clientId]
    )

    res.json({
      chapterId,
      problemId,
      checked: !!newValue,
      updatedAt: new Date().toISOString()
    })
  } catch (e) {
    console.error('[Progress] Toggle error:', e)
    res.status(500).json({ error: 'toggle failed' })
  }
})

// POST /api/progress/sync - Incremental sync with conflict resolution (server wins)
router.post('/sync', async (req, res) => {
  const { items, lastSyncAt } = req.body

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'items array required' })
  }

  try {
    const settings = await db.get('SELECT client_id FROM user_settings WHERE user_id = $1', [req.userId])
    const clientId = settings?.client_id || req.clientId || 'unknown'
    const syncTime = new Date()

    const client = await db.getClient()

    try {
      await client.query('BEGIN')

      const conflicts = []
      const updated = []
      const skipped = []
      const resultItems = []

      for (const item of items) {
        const { chapterId, problemId, checked, clientTimestamp } = item

        if (!chapterId || !problemId) {
          skipped.push({ chapterId, problemId, reason: 'missing chapterId or problemId' })
          continue
        }

        const clientTime = clientTimestamp ? new Date(clientTimestamp) : new Date(0)

        // Get existing progress from server
        const existing = await client.query(
          'SELECT checked, checked_at FROM progress WHERE user_id = $1 AND chapter_id = $2 AND problem_id = $3',
          [req.userId, chapterId, problemId]
        )

        if (existing.rows.length > 0) {
          const serverRecord = existing.rows[0]
          const serverTime = serverRecord.checked_at ? new Date(serverRecord.checked_at) : new Date(0)

          // Server timestamp wins conflict resolution
          if (serverTime > clientTime) {
            // Server is newer - keep server value, report conflict
            conflicts.push({
              chapterId,
              problemId,
              serverValue: !!serverRecord.checked,
              clientValue: !!checked,
              serverTimestamp: serverRecord.checked_at,
              resolution: 'server_wins'
            })
            resultItems.push({
              chapterId,
              problemId,
              checked: !!serverRecord.checked,
              checkedAt: serverRecord.checked_at,
              source: 'server'
            })
          } else {
            // Client is newer or equal - update server
            await client.query(
              'UPDATE progress SET checked = $1, checked_at = $2 WHERE user_id = $3 AND chapter_id = $4 AND problem_id = $5',
              [checked, syncTime, req.userId, chapterId, problemId]
            )

            await client.query(
              'INSERT INTO progress_history (user_id, chapter_id, problem_id, checked, client_id) VALUES ($1, $2, $3, $4, $5)',
              [req.userId, chapterId, problemId, checked, clientId]
            )

            updated.push({ chapterId, problemId, checked })
            resultItems.push({
              chapterId,
              problemId,
              checked: !!checked,
              checkedAt: syncTime.toISOString(),
              source: 'client'
            })
          }
        } else {
          // No existing record - insert new
          await client.query(
            'INSERT INTO progress (user_id, chapter_id, problem_id, checked, checked_at) VALUES ($1, $2, $3, $4, $5)',
            [req.userId, chapterId, problemId, checked, syncTime]
          )

          await client.query(
            'INSERT INTO progress_history (user_id, chapter_id, problem_id, checked, client_id) VALUES ($1, $2, $3, $4, $5)',
            [req.userId, chapterId, problemId, checked, clientId]
          )

          updated.push({ chapterId, problemId, checked })
          resultItems.push({
            chapterId,
            problemId,
            checked: !!checked,
            checkedAt: syncTime.toISOString(),
            source: 'client'
          })
        }
      }

      await client.query('COMMIT')

      res.json({
        success: true,
        syncTime: syncTime.toISOString(),
        stats: {
          total: items.length,
          updated: updated.length,
          conflicts: conflicts.length,
          skipped: skipped.length
        },
        updated,
        conflicts,
        skipped,
        progress: resultItems
      })
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  } catch (e) {
    console.error('[Progress] Sync error:', e)
    res.status(500).json({ error: 'sync failed' })
  }
})

// GET /api/progress/history
router.get('/history', async (req, res) => {
  const { chapterId, limit = 50, cursor } = req.query

  try {
    let query = `
      SELECT id, chapter_id, problem_id, checked, changed_at, client_id
      FROM progress_history
      WHERE user_id = $1
    `
    const params = [req.userId]

    if (chapterId) {
      query += ' AND chapter_id = $' + (params.length + 1)
      params.push(chapterId)
    }

    if (cursor) {
      query += ' AND id < $' + (params.length + 1)
      params.push(parseInt(cursor))
    }

    query += ' ORDER BY changed_at DESC LIMIT $' + (params.length + 1)
    params.push(parseInt(limit) + 1) // Fetch one extra to check if there are more

    const rows = await db.all(query, params)

    const hasMore = rows.length > parseInt(limit)
    if (hasMore) rows.pop()

    const nextCursor = rows.length > 0 ? rows[rows.length - 1].id : null

    res.json({
      history: rows,
      nextCursor: hasMore ? nextCursor : null
    })
  } catch (e) {
    console.error('[Progress] History error:', e)
    res.status(500).json({ error: 'failed to get history' })
  }
})

// GET /api/progress/stats
router.get('/stats', async (req, res) => {
  try {
    const totalChapters = await db.get('SELECT COUNT(*) as count FROM chapters')?.count || 0
    const totalProblems = await db.get('SELECT SUM(total_problems) as count FROM chapters')?.count || 0
    const completed = await db.get(
      'SELECT COUNT(*) as count FROM progress WHERE user_id = $1 AND checked = TRUE',
      [req.userId]
    )?.count || 0

    const byChapter = await db.all(`
      SELECT
        p.chapter_id,
        c.title,
        COUNT(CASE WHEN p.checked = TRUE THEN 1 END) as done,
        c.total_problems as total
      FROM progress p
      JOIN chapters c ON c.id = p.chapter_id
      WHERE p.user_id = $1
      GROUP BY p.chapter_id
      ORDER BY p.chapter_id
    `, [req.userId])

    res.json({
      totalChapters,
      totalProblems,
      completed,
      completionRate: totalProblems > 0 ? Math.round((completed / totalProblems) * 100) : 0,
      byChapter
    })
  } catch (e) {
    console.error('[Progress] Stats error:', e)
    res.status(500).json({ error: 'failed to get stats' })
  }
})

module.exports = router
