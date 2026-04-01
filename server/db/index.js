/**
 * PostgreSQL Database Module
 * Uses pg Pool for connection management
 */

const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || 'algorithmcamp',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err)
})

/**
 * Execute a query and return all results
 */
async function all(sql, params = []) {
  const result = await pool.query(sql, params)
  return result.rows
}

/**
 * Execute a query and return the first result
 */
async function get(sql, params = []) {
  const rows = await all(sql, params)
  return rows[0] || null
}

/**
 * Execute a query (INSERT/UPDATE/DELETE) and return { lastInsertRowid, changes }
 * For PostgreSQL, we return { rows: result.rowCount }
 */
async function run(sql, params = []) {
  const result = await pool.query(sql, params)
  return { lastInsertRowid: result.rows[0]?.id || 0, changes: result.rowCount }
}

/**
 * Get a client from the pool for transactions
 */
async function getClient() {
  return pool.connect()
}

/**
 * Close the pool
 */
async function close() {
  await pool.end()
}

module.exports = { pool, all, get, run, getClient, close }
