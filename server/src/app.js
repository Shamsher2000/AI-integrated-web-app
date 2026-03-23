import compression from 'compression'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { apiRouter } from './routes/index.js'

const app = express()
const allowedOrigins = new Set(env.clientUrls)

// ============================================
// SECURITY & PERFORMANCE MIDDLEWARE
// ============================================

// CORS with proper configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true)
        return
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`))
    },
    credentials: false,
  }),
)

// Security headers
app.use(helmet())

// Response compression (gzip, brotli)
// Skip SSE endpoints so streaming tokens are not buffered or truncated.
app.use(
  compression({
    filter: (req, res) => {
      const acceptHeader = req.headers.accept || ''

      if (
        req.path.endsWith('/message/stream') ||
        acceptHeader.includes('text/event-stream')
      ) {
        return false
      }

      return compression.filter(req, res)
    },
  }),
)

// Request logging (optimized for production)
app.use(morgan(env.isProduction ? 'combined' : 'dev'))

// Request body size limits
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// ============================================
// STATIC FILE SERVING WITH CACHE HEADERS
// ============================================

// Serve uploaded files with proper cache headers
app.use(
  '/uploads',
  (req, res, next) => {
    // Cache images for 1 week
    res.set('Cache-Control', 'public, max-age=604800, immutable')
    res.set('ETag', 'W/"uploads"')
    next()
  },
  express.static(path.resolve(process.cwd(), 'uploads'), {
    maxAge: '1w',
    etag: false,
  }),
)

// ============================================
// ROOT HEALTH CHECK
// ============================================

app.get('/', (_req, res) => {
  // Set cache control for health check
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  
  res.json({
    success: true,
    message: 'MERN AI Assistant backend is running',
    timestamp: new Date().toISOString(),
  })
})

// ============================================
// RATE LIMITING
// ============================================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300, // 300 requests per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again later.',
  statusCode: 429,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/'
  },
})

// Apply rate limiter to API routes
app.use('/api/', apiLimiter)

// ============================================
// API ROUTES
// ============================================

app.use('/api/v1', apiRouter)

// ============================================
// ERROR HANDLING
// ============================================

app.use(notFoundHandler)
app.use(errorHandler)

export default app
