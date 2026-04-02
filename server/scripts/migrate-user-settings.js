/**
 * Migration: Add user settings columns
 * Adds practice goal and notification settings to user_settings table
 *
 * Usage:
 *   node scripts/migrate-user-settings.js
 */

require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || 'algorithmcamp',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
})

async function migrate() {
  console.log('[Migration] Starting user_settings migration...')

  const client = await pool.connect()

  try {
    // Check if columns already exist
    const checkResult = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'user_settings' AND column_name IN ('practice_goal_daily', 'practice_goal_weekly', 'notification_email', 'notification_progress', 'notification_github')
    `)

    const existingColumns = checkResult.rows.map(r => r.column_name)

    const migrations = []

    if (!existingColumns.includes('practice_goal_daily')) {
      migrations.push('ALTER TABLE user_settings ADD COLUMN practice_goal_daily INTEGER DEFAULT 3')
      console.log('[Migration] Adding practice_goal_daily column...')
    }

    if (!existingColumns.includes('practice_goal_weekly')) {
      migrations.push('ALTER TABLE user_settings ADD COLUMN practice_goal_weekly INTEGER DEFAULT 15')
      console.log('[Migration] Adding practice_goal_weekly column...')
    }

    if (!existingColumns.includes('notification_email')) {
      migrations.push('ALTER TABLE user_settings ADD COLUMN notification_email BOOLEAN DEFAULT TRUE')
      console.log('[Migration] Adding notification_email column...')
    }

    if (!existingColumns.includes('notification_progress')) {
      migrations.push('ALTER TABLE user_settings ADD COLUMN notification_progress BOOLEAN DEFAULT TRUE')
      console.log('[Migration] Adding notification_progress column...')
    }

    if (!existingColumns.includes('notification_github')) {
      migrations.push('ALTER TABLE user_settings ADD COLUMN notification_github BOOLEAN DEFAULT FALSE')
      console.log('[Migration] Adding notification_github column...')
    }

    if (migrations.length === 0) {
      console.log('[Migration] All columns already exist, nothing to do.')
    } else {
      for (const sql of migrations) {
        await client.query(sql)
      }
      console.log(`[Migration] Successfully applied ${migrations.length} column additions.`)
    }

    // Verify columns now exist
    const verifyResult = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'user_settings'
      ORDER BY column_name
    `)

    console.log('[Migration] Current user_settings columns:')
    verifyResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} default: ${row.column_default}`)
    })

    console.log('[Migration] Migration complete!')
  } catch (err) {
    console.error('[Migration] Error:', err.message)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

migrate().catch(e => {
  console.error('[Migration] Fatal error:', e)
  process.exit(1)
})