/**
 * Database Initialization Script
 * Run this once to set up the PostgreSQL database schema and seed data
 *
 * Usage:
 *   node db/init.js
 *
 * Environment:
 *   PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD
 */

require('dotenv').config()
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || 'algorithmcamp',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
})

async function init() {
  console.log('[Init] Starting database initialization...')
  console.log(`[Init] Connecting to: ${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'algorithmcamp'}`)

  const schemaPath = path.join(__dirname, 'schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf-8')

  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    console.log('[Init] Executing schema.sql...')

    // Execute schema (split by semicolons for individual statements)
    const statements = schema
      .split(/;(\s*\n|$)/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      try {
        await client.query(statement)
      } catch (err) {
        // Ignore "already exists" errors for idempotent setup
        if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
          console.error('[Init] Statement failed:', err.message)
          throw err
        }
      }
    }

    await client.query('COMMIT')
    console.log('[Init] Schema executed successfully')

    // Verify chapters were seeded
    const chapters = await pool.query('SELECT COUNT(*) FROM chapters')
    console.log(`[Init] Chapters in database: ${chapters.rows[0].count}`)

    // List all tables
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    console.log('[Init] Tables created:')
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`))

    console.log('[Init] Database initialization complete!')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[Init] Initialization failed:', err)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

init().catch(e => {
  console.error('[Init] Fatal error:', e)
  process.exit(1)
})
