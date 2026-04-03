/**
 * Chapters Routes (MongoDB Version)
 */

const express = require('express')
const db = require('../db/mongodb')

const router = express.Router()

// GET /api/chapters - Get all chapters
router.get('/', async (req, res) => {
  try {
    const chapters = await db.getAllChapters()
    res.json({ chapters })
  } catch (e) {
    console.error('[Chapters] Error:', e)
    res.status(500).json({ error: 'failed to get chapters' })
  }
})

// POST /api/chapters - Save chapters
router.post('/', async (req, res) => {
  const { chapters } = req.body

  if (!chapters || !Array.isArray(chapters)) {
    return res.status(400).json({ error: 'chapters array required' })
  }

  try {
    await db.saveChapters(chapters)
    res.json({ success: true, count: chapters.length })
  } catch (e) {
    console.error('[Chapters] Save error:', e)
    res.status(500).json({ error: 'failed to save chapters' })
  }
})

module.exports = router
