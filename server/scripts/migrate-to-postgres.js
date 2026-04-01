/**
 * Migration Script: sql.js → PostgreSQL
 *
 * Reads data from the existing sql.js database and migrates to PostgreSQL.
 * Run this ONCE before switching to the new PostgreSQL-based server.
 *
 * Usage:
 *   node scripts/migrate-to-postgres.js
 *
 * Environment:
 *   DB_PATH     - Path to existing sql.js database
 *   PGHOST      - PostgreSQL host
 *   PGPORT      - PostgreSQL port
 *   PGDATABASE  - PostgreSQL database name
 *   PGUSER      - PostgreSQL user
 *   PGPASSWORD  - PostgreSQL password
 */

require('dotenv').config()
const initSqlJs = require('sql.js')
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/algorithmcamp.db')

// PostgreSQL connection
const pgPool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || 'algorithmcamp',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
})

// Helper to hash tokens for storage
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

async function migrate() {
  console.log('[Migration] Starting migration from sql.js to PostgreSQL...')

  // 1. Load sql.js database
  console.log('[Migration] Loading sql.js database from:', DB_PATH)
  const SQL = await initSqlJs()
  let db

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH)
    db = new SQL.Database(buffer)
  } else {
    console.log('[Migration] No existing database found, starting fresh')
    db = null
  }

  if (db) {
    // 2. Migrate users
    console.log('[Migration] Migrating users...')
    const users = db.exec('SELECT * FROM users')
    if (users.length > 0) {
      const columns = users[0].columns
      const values = users[0].values

      for (const row of values) {
        const user = {}
        columns.forEach((col, i) => user[col] = row[i])

        await pgPool.query(`
          INSERT INTO users (id, username, password_hash, github_id, github_login, avatar_url, created_at, last_login)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (username) DO UPDATE SET
            password_hash = EXCLUDED.password_hash,
            last_login = EXCLUDED.last_login
        `, [
          user.id,
          user.username,
          user.password || null,
          null, // github_id - will be set via GitHub OAuth
          null, // github_login - will be set via GitHub OAuth
          null, // avatar_url - will be set via GitHub OAuth
          user.created_at || null,
          user.last_login || null
        ])
      }
      console.log(`[Migration] Migrated ${values.length} users`)
    }

    // 3. Migrate progress
    console.log('[Migration] Migrating progress...')
    const progress = db.exec('SELECT * FROM progress')
    if (progress.length > 0) {
      const columns = progress[0].columns
      const values = progress[0].values

      for (const row of values) {
        const p = {}
        columns.forEach((col, i) => p[col] = row[i])

        await pgPool.query(`
          INSERT INTO progress (user_id, chapter_id, problem_id, checked, checked_at)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (user_id, chapter_id, problem_id) DO UPDATE SET
            checked = EXCLUDED.checked,
            checked_at = EXCLUDED.checked_at
        `, [
          p.user_id,
          p.chapter_id,
          p.problem_id,
          p.checked === 1,
          p.checked_at || null
        ])
      }
      console.log(`[Migration] Migrated ${values.length} progress records`)
    }

    // 4. Migrate progress_history
    console.log('[Migration] Migrating progress_history...')
    const history = db.exec('SELECT * FROM progress_history')
    if (history.length > 0) {
      const columns = history[0].columns
      const values = history[0].values

      for (const row of values) {
        const h = {}
        columns.forEach((col, i) => h[col] = row[i])

        await pgPool.query(`
          INSERT INTO progress_history (user_id, chapter_id, problem_id, checked, changed_at, client_id)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          h.user_id,
          h.chapter_id,
          h.problem_id,
          h.checked === 1,
          h.changed_at || null,
          h.client_id || 'migration'
        ])
      }
      console.log(`[Migration] Migrated ${values.length} history records`)
    }

    // 5. Migrate github_stats
    console.log('[Migration] Migrating github_stats...')
    const ghStats = db.exec('SELECT * FROM github_stats')
    if (ghStats.length > 0) {
      const columns = ghStats[0].columns
      const values = ghStats[0].values

      for (const row of values) {
        const s = {}
        columns.forEach((col, i) => s[col] = row[i])

        await pgPool.query(`
          INSERT INTO github_stats (user_id, github_username, total_commits, current_streak, longest_streak, calendar, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (user_id) DO UPDATE SET
            github_username = EXCLUDED.github_username,
            total_commits = EXCLUDED.total_commits,
            current_streak = EXCLUDED.current_streak,
            longest_streak = EXCLUDED.longest_streak,
            calendar = EXCLUDED.calendar,
            updated_at = EXCLUDED.updated_at
        `, [
          s.user_id,
          s.github_username,
          s.total_commits || 0,
          s.current_streak || 0,
          s.longest_streak || 0,
          s.calendar || '{}',
          s.updated_at || null
        ])
      }
      console.log(`[Migration] Migrated ${values.length} github_stats records`)
    }

    // 6. Migrate user_settings
    console.log('[Migration] Migrating user_settings...')
    const settings = db.exec('SELECT * FROM user_settings')
    if (settings.length > 0) {
      const columns = settings[0].columns
      const values = settings[0].values

      for (const row of values) {
        const s = {}
        columns.forEach((col, i) => s[col] = row[i])

        await pgPool.query(`
          INSERT INTO user_settings (user_id, theme, lang, client_id)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (user_id) DO UPDATE SET
            theme = EXCLUDED.theme,
            lang = EXCLUDED.lang,
            client_id = EXCLUDED.client_id
        `, [
          s.user_id,
          s.theme || 'dark',
          s.lang || 'zh',
          s.client_id || 'migrated-' + Math.random().toString(36).slice(2, 10)
        ])
      }
      console.log(`[Migration] Migrated ${values.length} user_settings records`)
    }

    db.close()
  }

  // 7. Verify counts
  const userCount = await pgPool.query('SELECT COUNT(*) FROM users')
  const progressCount = await pgPool.query('SELECT COUNT(*) FROM progress')
  const historyCount = await pgPool.query('SELECT COUNT(*) FROM progress_history')

  console.log('[Migration] Verification:')
  console.log(`  Users: ${userCount.rows[0].count}`)
  console.log(`  Progress: ${progressCount.rows[0].count}`)
  console.log(`  History: ${historyCount.rows[0].count}`)

  await pgPool.end()
  console.log('[Migration] Complete!')
}

migrate().catch(e => {
  console.error('[Migration] Failed:', e)
  process.exit(1)
})
