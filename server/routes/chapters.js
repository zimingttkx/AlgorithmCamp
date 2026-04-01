const express = require('express')
const db = require('../db')

const router = express.Router()

// GET /api/chapters - Get all chapters (public)
router.get('/', async (req, res) => {
  try {
    const chapters = await db.all('SELECT * FROM chapters ORDER BY id')
    res.json({ chapters })
  } catch (e) {
    console.error('[Chapters] Get all error:', e)
    res.status(500).json({ error: 'failed to get chapters' })
  }
})

// GET /api/chapters/:id - Get single chapter
router.get('/:id', async (req, res) => {
  try {
    const chapter = await db.get('SELECT * FROM chapters WHERE id = $1', [req.params.id])
    if (!chapter) {
      return res.status(404).json({ error: 'chapter not found' })
    }
    res.json({ chapter })
  } catch (e) {
    console.error('[Chapters] Get one error:', e)
    res.status(500).json({ error: 'failed to get chapter' })
  }
})

// PUT /api/chapters/:id/total - Update total problem count
router.put('/:id/total', async (req, res) => {
  const { totalProblems } = req.body
  if (typeof totalProblems !== 'number' || totalProblems < 0) {
    return res.status(400).json({ error: 'valid totalProblems number required' })
  }

  try {
    const existing = await db.get('SELECT id FROM chapters WHERE id = $1', [req.params.id])
    if (!existing) {
      return res.status(404).json({ error: 'chapter not found' })
    }

    await db.run('UPDATE chapters SET total_problems = $1 WHERE id = $2', [totalProblems, req.params.id])
    const chapter = await db.get('SELECT * FROM chapters WHERE id = $1', [req.params.id])
    res.json({ success: true, chapter })
  } catch (e) {
    console.error('[Chapters] Update error:', e)
    res.status(500).json({ error: 'failed to update chapter' })
  }
})

module.exports = router
