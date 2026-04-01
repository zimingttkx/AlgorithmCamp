/**
 * Authentication Middleware
 * Supports both cookie-based and Bearer token authentication
 */

const jwt = require('jsonwebtoken')

/**
 * Main auth middleware - verifies access token
 * Reads from cookie (accessToken) or Authorization header
 */
function authMiddleware(req, res, next) {
  let token = null

  // Try cookie first
  if (req.cookies?.accessToken) {
    token = req.cookies.accessToken
  }
  // Fall back to Bearer header
  else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7)
  }

  if (!token) {
    return res.status(401).json({ error: 'no token provided' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = payload.userId
    req.username = payload.username
    req.clientId = payload.clientId
    next()
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'token expired', code: 'TOKEN_EXPIRED' })
    }
    return res.status(401).json({ error: 'invalid token' })
  }
}

/**
 * Optional auth - sets user info if token present, but doesn't require it
 */
function optionalAuth(req, res, next) {
  let token = null

  if (req.cookies?.accessToken) {
    token = req.cookies.accessToken
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7)
  }

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      req.userId = payload.userId
      req.username = payload.username
      req.clientId = payload.clientId
    } catch (e) {
      // Ignore invalid token for optional auth
    }
  }

  next()
}

/**
 * Verify refresh token and return payload
 */
function verifyRefresh(token, secret) {
  try {
    const payload = jwt.verify(token, secret || process.env.JWT_SECRET)
    if (payload.type !== 'refresh') {
      return { error: 'invalid token type' }
    }
    return { payload }
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return { error: 'refresh token expired' }
    }
    return { error: 'invalid refresh token' }
  }
}

module.exports = { authMiddleware, optionalAuth, verifyRefresh }
