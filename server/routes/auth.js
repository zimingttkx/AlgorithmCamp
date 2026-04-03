/**
 * 简单的用户名密码认证
 */
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const db = require('../db/mongodb')

const router = express.Router()
const SALT_ROUNDS = 12
const ACCESS_TOKEN_TTL = '15m'
const REFRESH_TOKEN_TTL = '7d'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
  path: '/'
}

function generateTokens(userId, username) {
  const accessToken = jwt.sign(
    { userId, username, type: 'access' },
    process.env.JWT_SECRET || 'dev-secret-key',
    { expiresIn: ACCESS_TOKEN_TTL }
  )
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET || 'dev-secret-key',
    { expiresIn: REFRESH_TOKEN_TTL }
  )
  return { accessToken, refreshToken }
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// POST /api/auth/register - 注册
router.post('/register', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码必填' })
  }
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: '用户名需要3-20个字符' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少6个字符' })
  }

  try {
    const existing = await db.findUserByUsername(username)
    if (existing) {
      return res.status(409).json({ error: '用户名已被占用' })
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    const userId = await db.createUser(username, hash)

    await db.updateUserSettings(userId, { theme: 'dark', lang: 'zh' })

    const { accessToken, refreshToken } = generateTokens(userId.toString(), username)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await db.storeRefreshToken(userId, hashToken(refreshToken), null, expiresAt)

    res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 })
    res.cookie('refresh_token', refreshToken, COOKIE_OPTIONS)

    res.status(201).json({ user: { id: userId.toString(), username } })
  } catch (e) {
    console.error('[Auth] Register error:', e)
    res.status(500).json({ error: '注册失败' })
  }
})

// POST /api/auth/login - 登录
router.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码必填' })
  }

  try {
    const user = await db.findUserByUsername(username)
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.username)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await db.storeRefreshToken(user._id, hashToken(refreshToken), null, expiresAt)

    res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 })
    res.cookie('refresh_token', refreshToken, COOKIE_OPTIONS)

    res.json({ user: { id: user._id.toString(), username: user.username } })
  } catch (e) {
    console.error('[Auth] Login error:', e)
    res.status(500).json({ error: '登录失败' })
  }
})

// POST /api/auth/refresh - 刷新token
router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.refresh_token

  if (!refreshToken) {
    return res.status(401).json({ error: '需要刷新令牌' })
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'dev-secret-key')
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: '无效令牌' })
    }

    const storedToken = await db.findRefreshToken(hashToken(refreshToken))
    if (!storedToken) {
      return res.status(401).json({ error: '令牌已失效' })
    }

    const user = await db.findUserById(decoded.userId)
    if (!user) {
      return res.status(401).json({ error: '用户不存在' })
    }

    await db.revokeToken(hashToken(refreshToken))

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString(), user.username)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await db.storeRefreshToken(user._id, hashToken(newRefreshToken), null, expiresAt)

    res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 })
    res.cookie('refresh_token', newRefreshToken, COOKIE_OPTIONS)

    res.json({ user: { id: user._id.toString(), username: user.username } })
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '令牌已过期' })
    }
    console.error('[Auth] Refresh error:', e)
    res.status(401).json({ error: '刷新失败' })
  }
})

// POST /api/auth/logout - 登出
router.post('/logout', async (req, res) => {
  console.log('[Auth] Logout called')
  const refreshToken = req.cookies?.refresh_token
  console.log('[Auth] Refresh token found:', !!refreshToken)
  
  if (refreshToken) {
    try {
      const result = await db.revokeToken(hashToken(refreshToken))
      console.log('[Auth] Token revoked:', result)
    } catch (e) {
      console.error('[Auth] Revoke token error:', e)
    }
  }
  
  res.clearCookie('access_token', COOKIE_OPTIONS)
  res.clearCookie('refresh_token', COOKIE_OPTIONS)
  console.log('[Auth] Cookies cleared, sending success response')
  res.json({ success: true })
})

// GET /api/auth/me - 获取当前用户
router.get('/me', async (req, res) => {
  const accessToken = req.cookies?.access_token || req.headers.authorization?.replace('Bearer ', '')

  if (!accessToken) {
    return res.status(401).json({ error: '未登录' })
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET || 'dev-secret-key')
    if (decoded.type !== 'access') {
      return res.status(401).json({ error: '无效令牌' })
    }

    const user = await db.findUserById(decoded.userId)
    if (!user) {
      return res.status(401).json({ error: '用户不存在' })
    }

    const settings = await db.getUserSettings(user._id)
    res.json({ user: { id: user._id.toString(), username: user.username, settings } })
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '令牌已过期' })
    }
    res.status(401).json({ error: '认证失败' })
  }
})

// PUT /api/auth/settings - 更新设置
router.put('/settings', async (req, res) => {
  const accessToken = req.cookies?.access_token || req.headers.authorization?.replace('Bearer ', '')

  if (!accessToken) {
    return res.status(401).json({ error: '未登录' })
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET || 'dev-secret-key')
    const { theme, lang } = req.body
    const updates = {}
    if (theme) updates.theme = theme
    if (lang) updates.lang = lang
    await db.updateUserSettings(decoded.userId, updates)
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: '更新失败' })
  }
})

module.exports = {
  router,
  startTokenGC: () => {
    setInterval(async () => {
      try {
        await db.cleanupExpiredTokens()
        console.log('[Auth] Expired tokens cleaned')
      } catch (e) {
        console.error('[Auth] Token cleanup error:', e)
      }
    }, 24 * 60 * 60 * 1000)
    console.log('[Auth] Token GC started')
  },
  stopTokenGC: () => {}
}
