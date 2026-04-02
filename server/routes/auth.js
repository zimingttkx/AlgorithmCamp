/**
 * Authentication Routes
 * - httpOnly cookies for tokens
 * - Refresh token rotation with family tracking
 * - GitHub OAuth login
 */

const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const fetch = require('node-fetch')
const db = require('../db')
const { authMiddleware, verifyRefresh } = require('../middleware/auth')
const { validateBody } = require('../middleware/validation')

const router = express.Router()

const SALT_ROUNDS = 12
const ACCESS_TOKEN_TTL = '15m'
const REFRESH_TOKEN_TTL = '7d'
const REFRESH_TOKEN_FAMILY_SIZE = 5

// Cookie options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/'
}

// Helper to generate tokens
function generateTokens(userId, username, clientId) {
  const accessToken = jwt.sign(
    { userId, username, clientId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  )

  const refreshToken = jwt.sign(
    { userId, type: 'refresh', family: crypto.randomUUID() },
    process.env.JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  )

  return { accessToken, refreshToken }
}

// Helper to hash token for storage
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// POST /api/auth/register
router.post('/register', validateBody('register'), async (req, res) => {
  const { username, password, githubUsername } = req.body

  try {
    // Check existing user
    const existing = await db.get('SELECT id FROM users WHERE username = $1', [username])
    if (existing) {
      return res.status(409).json({ error: 'username already taken' })
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    const clientId = 'dev-' + crypto.randomBytes(4).toString('hex')

    const result = await db.run(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id',
      [username, hash]
    )
    const userId = result.lastInsertRowid

    await db.run(
      'INSERT INTO user_settings (user_id, client_id, theme, lang) VALUES ($1, $2, $3, $4)',
      [userId, clientId, 'dark', 'zh']
    )

    if (githubUsername) {
      await db.run(
        'INSERT INTO github_stats (user_id, github_username) VALUES ($1, $2)',
        [userId, githubUsername]
      )
    }

    const { accessToken, refreshToken } = generateTokens(userId, username, clientId)

    // Store refresh token
    await db.run(
      `INSERT INTO refresh_tokens (user_id, token_hash, family, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [userId, hashToken(refreshToken), 'pending', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    )

    // Set cookies
    res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 })
    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 })

    res.status(201).json({
      user: { id: userId, username, clientId }
    })
  } catch (e) {
    console.error('[Auth] Register error:', e)
    res.status(500).json({ error: 'registration failed' })
  }
})

// POST /api/auth/login
router.post('/login', validateBody('login'), async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await db.get('SELECT * FROM users WHERE username = $1', [username])
    if (!user) {
      return res.status(401).json({ error: 'invalid credentials' })
    }

    if (!user.password_hash) {
      return res.status(401).json({ error: 'invalid credentials' })
    }

    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      return res.status(401).json({ error: 'invalid credentials' })
    }

    // Update last login
    await db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id])

    let settings = await db.get('SELECT * FROM user_settings WHERE user_id = $1', [user.id])
    if (!settings) {
      const clientId = 'dev-' + crypto.randomBytes(4).toString('hex')
      await db.run(
        'INSERT INTO user_settings (user_id, client_id) VALUES ($1, $2)',
        [user.id, clientId]
      )
      settings = await db.get('SELECT * FROM user_settings WHERE user_id = $1', [user.id])
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.username, settings.client_id)

    // Store refresh token
    const family = crypto.randomUUID()
    await db.run(
      `INSERT INTO refresh_tokens (user_id, token_hash, family, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [user.id, hashToken(refreshToken), family, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    )

    // Set cookies
    res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 })
    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 })

    res.json({
      user: {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatar_url,
        githubLogin: user.github_login,
        clientId: settings.client_id
      }
    })
  } catch (e) {
    console.error('[Auth] Login error:', e)
    res.status(500).json({ error: 'login failed' })
  }
})

// POST /api/auth/refresh - Token refresh with rotation
router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken

  if (!refreshToken) {
    return res.status(400).json({ error: 'refresh token required' })
  }

  const verifyResult = verifyRefresh(refreshToken)
  if (verifyResult.error) {
    return res.status(401).json({ error: verifyResult.error, code: 'TOKEN_EXPIRED' })
  }

  const { payload } = verifyResult
  const tokenHash = hashToken(refreshToken)

  try {
    // Check if token exists and is not revoked
    const stored = await db.get(
      `SELECT * FROM refresh_tokens
       WHERE token_hash = $1 AND user_id = $2 AND revoked = FALSE`,
      [tokenHash, payload.userId]
    )

    if (!stored) {
      // Token reuse detected - revoke entire family (security breach)
      await db.run(
        'UPDATE refresh_tokens SET revoked = TRUE WHERE family = $1',
        [payload.family]
      )
      return res.status(401).json({ error: 'token reuse detected', code: 'TOKEN_REVOKED' })
    }

    // Get user
    const user = await db.get('SELECT * FROM users WHERE id = $1', [payload.userId])
    if (!user) {
      return res.status(401).json({ error: 'user not found' })
    }

    // Revoke old token
    await db.run('UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1', [stored.id])

    // Check family size - rotate family if too large
    const familyCount = await db.get(
      'SELECT COUNT(*) as count FROM refresh_tokens WHERE family = $1 AND revoked = FALSE',
      [payload.family]
    )

    let family = payload.family
    if (familyCount && familyCount.count >= REFRESH_TOKEN_FAMILY_SIZE) {
      // Rotate to new family
      family = crypto.randomUUID()
      await db.run('UPDATE refresh_tokens SET revoked = TRUE WHERE family = $1', [payload.family])
    }

    // Generate new tokens
    const settings = await db.get('SELECT client_id FROM user_settings WHERE user_id = $1', [user.id])
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user.id,
      user.username,
      settings?.client_id
    )

    // Store new refresh token
    await db.run(
      `INSERT INTO refresh_tokens (user_id, token_hash, family, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [user.id, hashToken(newRefreshToken), family, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    )

    // Clean up expired tokens
    await db.run('DELETE FROM refresh_tokens WHERE expires_at < CURRENT_TIMESTAMP')

    // Set new cookies
    res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 })
    res.cookie('refreshToken', newRefreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 })

    res.json({
      user: {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatar_url,
        githubLogin: user.github_login
      }
    })
  } catch (e) {
    console.error('[Auth] Refresh error:', e)
    res.status(500).json({ error: 'refresh failed' })
  }
})

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken

  if (refreshToken) {
    const tokenHash = hashToken(refreshToken)
    // Revoke this token
    await db.run(
      'UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1',
      [tokenHash]
    )
  }

  // Clear cookies
  res.clearCookie('accessToken', COOKIE_OPTIONS)
  res.clearCookie('refreshToken', COOKIE_OPTIONS)

  res.json({ success: true })
})

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await db.get(
      'SELECT id, username, avatar_url, github_login, github_id, created_at, last_login FROM users WHERE id = $1',
      [req.userId]
    )

    if (!user) {
      return res.status(401).json({ error: 'user not found' })
    }

    const settings = await db.get(
      'SELECT theme, lang, client_id FROM user_settings WHERE user_id = $1',
      [req.userId]
    )

    const githubStats = await db.get(
      'SELECT github_username, total_commits, current_streak, longest_streak, calendar, updated_at FROM github_stats WHERE user_id = $1',
      [req.userId]
    )

    res.json({
      user: {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatar_url,
        githubLogin: user.github_login,
        createdAt: user.created_at,
        lastLogin: user.last_login
      },
      settings: settings || { theme: 'dark', lang: 'zh', clientId: '' },
      githubStats
    })
  } catch (e) {
    console.error('[Auth] Me error:', e)
    res.status(500).json({ error: 'failed to get user info' })
  }
})

// PUT /api/auth/settings
router.put('/settings', authMiddleware, async (req, res) => {
  const { theme, lang } = req.body

  try {
    const updates = []
    const values = []
    let paramCount = 0

    if (theme && ['dark', 'light'].includes(theme)) {
      paramCount++
      updates.push(`theme = $${paramCount}`)
      values.push(theme)
    }
    if (lang && ['zh', 'en'].includes(lang)) {
      paramCount++
      updates.push(`lang = $${paramCount}`)
      values.push(lang)
    }

    if (updates.length > 0) {
      paramCount++
      values.push(req.userId)
      await db.run(
        `UPDATE user_settings SET ${updates.join(', ')} WHERE user_id = $${paramCount}`,
        values
      )
    }

    const settings = await db.get(
      'SELECT theme, lang, client_id FROM user_settings WHERE user_id = $1',
      [req.userId]
    )

    res.json({ success: true, settings })
  } catch (e) {
    console.error('[Auth] Settings error:', e)
    res.status(500).json({ error: 'failed to update settings' })
  }
})

// GET /api/auth/github - Initiate GitHub OAuth
router.get('/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID
  const redirectUri = `${process.env.API_URL || 'http://localhost:3000'}/api/auth/github/callback`
  const scope = 'read:user'

  if (!clientId) {
    return res.status(500).json({ error: 'GitHub OAuth not configured' })
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
  })

  res.redirect(`https://github.com/login/oauth/authorize?${params}`)
})

// GET /api/auth/github/callback - GitHub OAuth callback
router.get('/github/callback', async (req, res) => {
  const { code, error } = req.query

  if (error) {
    console.error('[Auth] GitHub OAuth error:', error)
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/login?error=github_denied`)
  }

  if (!code) {
    return res.status(400).json({ error: 'missing code' })
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    const tokenData = await tokenRes.json()
    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error)
    }

    const accessToken = tokenData.access_token

    // Get GitHub user info
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    const githubUser = await userRes.json()

    // Find or create user by github_id
    let user = await db.get('SELECT * FROM users WHERE github_id = $1', [githubUser.id])

    if (!user) {
      // Check if user exists by github_login (previously linked)
      user = await db.get('SELECT * FROM users WHERE github_login = $1', [githubUser.login])

      if (user) {
        // Update github_id for existing user
        await db.run(
          'UPDATE users SET github_id = $1, avatar_url = $2 WHERE id = $3',
          [githubUser.id, githubUser.avatar_url, user.id]
        )
      } else {
        // Create new user
        const clientId = 'dev-' + crypto.randomBytes(4).toString('hex')
        const result = await db.run(
          `INSERT INTO users (username, github_id, github_login, avatar_url)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [githubUser.login, githubUser.id, githubUser.login, githubUser.avatar_url]
        )

        const userId = result.lastInsertRowid

        // Create default settings
        await db.run(
          'INSERT INTO user_settings (user_id, client_id, theme, lang) VALUES ($1, $2, $3, $4)',
          [userId, clientId, 'dark', 'zh']
        )

        // Create empty github_stats
        await db.run(
          'INSERT INTO github_stats (user_id, github_username) VALUES ($1, $2)',
          [userId, githubUser.login]
        )

        user = await db.get('SELECT * FROM users WHERE id = $1', [userId])
      }
    } else {
      // Update avatar if changed
      if (user.avatar_url !== githubUser.avatar_url) {
        await db.run(
          'UPDATE users SET avatar_url = $1 WHERE id = $2',
          [githubUser.avatar_url, user.id]
        )
      }
    }

    // Update last login
    await db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id])

    // Get settings
    let settings = await db.get('SELECT * FROM user_settings WHERE user_id = $1', [user.id])

    // Generate tokens
    const { accessToken: newAccessToken, refreshToken } = generateTokens(
      user.id,
      user.username,
      settings?.client_id
    )

    // Store refresh token
    const family = crypto.randomUUID()
    await db.run(
      `INSERT INTO refresh_tokens (user_id, token_hash, family, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [user.id, hashToken(refreshToken), family, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    )

    // Set cookies
    res.cookie('accessToken', newAccessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 })
    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 })

    // Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/practice?login=success`)
  } catch (e) {
    console.error('[Auth] GitHub callback error:', e)
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/login?error=oauth_failed`)
  }
})

// Refresh token garbage collection interval (24 hours)
const GC_INTERVAL_MS = 24 * 60 * 60 * 1000
// Keep revoked/expired tokens for 7 days before deletion (for audit)
const TOKEN_RETENTION_DAYS = 7

let gcTimer = null

/**
 * Garbage collect expired and old revoked tokens
 * Called on startup and periodically
 */
async function cleanupExpiredTokens() {
  try {
    const cutoffDate = new Date(Date.now() - TOKEN_RETENTION_DAYS * 24 * 60 * 60 * 1000)

    // Delete expired tokens older than retention period
    const result = await db.run(
      `DELETE FROM refresh_tokens
       WHERE expires_at < $1 AND created_at < $2`,
      [new Date(), cutoffDate]
    )

    if (result.changes > 0) {
      console.log(`[Auth] GC: Removed ${result.changes} old expired refresh tokens`)
    }

    // Also clean up orphaned tokens (user deleted but tokens remain)
    const orphanedResult = await db.run(
      `DELETE FROM refresh_tokens rt
       WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = rt.user_id)`
    )

    if (orphanedResult.changes > 0) {
      console.log(`[Auth] GC: Removed ${orphanedResult.changes} orphaned refresh tokens`)
    }
  } catch (e) {
    console.error('[Auth] GC error:', e)
  }
}

/**
 * Start garbage collection scheduler
 */
function startTokenGC() {
  if (gcTimer) return

  // Run immediately on start
  cleanupExpiredTokens()

  // Then run periodically
  gcTimer = setInterval(cleanupExpiredTokens, GC_INTERVAL_MS)
  console.log(`[Auth] Token GC scheduled every ${GC_INTERVAL_MS / (60 * 60 * 1000)} hours`)
}

/**
 * Stop garbage collection scheduler
 */
function stopTokenGC() {
  if (gcTimer) {
    clearInterval(gcTimer)
    gcTimer = null
  }
}

// GET /api/auth/token-status - Check token expiration status
router.get('/token-status', async (req, res) => {
  const accessToken = req.cookies?.accessToken || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null)

  if (!accessToken) {
    return res.json({
      authenticated: false,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      needsRefresh: true
    })
  }

  try {
    const payload = jwt.verify(accessToken, process.env.JWT_SECRET)
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = payload.exp
    const timeUntilExpiry = expiresAt - now

    // Access token expires in 15 minutes, consider refresh if < 5 minutes left
    const needsRefresh = timeUntilExpiry < 5 * 60

    // Check refresh token status if present
    const refreshToken = req.cookies?.refreshToken
    let refreshExpiresAt = null
    let refreshNeedsRefresh = false

    if (refreshToken) {
      const refreshResult = verifyRefresh(refreshToken)
      if (refreshResult.payload) {
        refreshExpiresAt = refreshResult.payload.exp
        const refreshTimeLeft = refreshExpiresAt - now
        // Need to refresh if < 1 day left
        refreshNeedsRefresh = refreshTimeLeft < 24 * 60 * 60
      } else {
        // Refresh token invalid or expired
        refreshNeedsRefresh = true
      }
    }

    res.json({
      authenticated: true,
      userId: payload.userId,
      username: payload.username,
      accessTokenExpiresAt: new Date(expiresAt * 1000).toISOString(),
      timeUntilAccessExpiry: timeUntilExpiry,
      needsAccessRefresh: needsRefresh,
      hasRefreshToken: !!refreshToken,
      refreshTokenExpiresAt: refreshExpiresAt ? new Date(refreshExpiresAt * 1000).toISOString() : null,
      needsRefresh: needsRefresh || refreshNeedsRefresh || !refreshToken
    })
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return res.json({
        authenticated: false,
        accessTokenExpired: true,
        needsRefresh: true,
        error: 'access token expired'
      })
    }
    return res.status(401).json({ error: 'invalid token' })
  }
})

// POST /api/auth/cleanup - Manual cleanup endpoint (admin only)
router.post('/cleanup', authMiddleware, async (req, res) => {
  // Simple admin check - in production, use proper role-based access
  if (!process.env.ADMIN_API_KEY || req.headers['x-admin-key'] !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ error: 'admin access required' })
  }

  await cleanupExpiredTokens()
  res.json({ success: true, message: 'Token cleanup completed' })
})

// Export GC functions for server lifecycle
module.exports = { router, startTokenGC, stopTokenGC }
