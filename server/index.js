require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const rateLimit = require('express-rate-limit')
const cookieParser = require('cookie-parser')

const db = require('./db/mongodb')
const { logger } = require('./middleware/logger')
const { router: authRoutes, startTokenGC, stopTokenGC } = require('./routes/auth')
const progressRoutes = require('./routes/progress')
const chaptersRoutes = require('./routes/chapters')
const statsRoutes = require('./routes/stats')

const app = express()
const PORT = process.env.PORT || 3000

// Cookie parser (needed for httpOnly cookies)
app.use(cookieParser())

// CORS configuration - allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5177',
  'http://127.0.0.1:5177',
  'http://localhost',
  'http://127.0.0.1'
]

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like curl or Postman)
    if (!origin) return callback(null, true)
    // Allow all localhost variants
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true)
    }
    // Allow specific origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Body parsing
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false, limit: '1mb' }))

// Request logger (non-production + all errors)
app.use(logger)

// Rate limiting on auth routes (disabled for development)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
})

// Security
app.disable('x-powered-by')
app.use('/api/auth', authLimiter)

// Health check
app.get('/api/health', async (req, res) => {
  const connected = db.isConnected()
  res.json({ 
    status: connected ? 'ok' : 'degraded', 
    database: connected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString() 
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/chapters', chaptersRoutes)
app.use('/api/stats', statsRoutes)

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../app/dist')
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'))
    } else {
      res.status(404).json({ error: 'not found' })
    }
  })
}

// Error handling
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack)
  res.status(500).json({ error: 'internal server error' })
})

// Start server
async function start() {
  try {
    // Connect to MongoDB
    await db.connect()

    // Start token garbage collection scheduler
    startTokenGC()

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`AlgorithmCamp server running on port ${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`MongoDB: ${process.env.MONGO_URI || 'mongodb://localhost:27017'}`)
    })
  } catch (e) {
    console.error('[Server] Failed to start:', e)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully')
  stopTokenGC()
  await db.close()
  process.exit(0)
})

start()
