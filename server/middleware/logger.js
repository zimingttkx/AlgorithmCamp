/**
 * Request Logger Middleware
 * Logs all requests to file and console
 */

const fs = require('fs')
const path = require('path')

const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '../logs')
const LOG_FILE = path.join(LOG_DIR, 'access.log')

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

function logger(req, res, next) {
  const start = Date.now()
  const { method, url, ip } = req

  // Capture response finish
  res.on('finish', () => {
    const duration = Date.now() - start
    const { statusCode } = res
    const timestamp = new Date().toISOString()

    const logLine = `[${timestamp}] ${method} ${url} ${statusCode} ${duration}ms - ${ip || 'unknown'}\n`

    // Console output
    if (process.env.NODE_ENV !== 'production' || statusCode >= 400) {
      console.log(logLine.trim())
    }

    // File output (append)
    fs.appendFile(LOG_FILE, logLine, (err) => {
      if (err) console.error('[Logger] Failed to write to log file:', err)
    })
  })

  next()
}

module.exports = { logger }
