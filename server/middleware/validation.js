/**
 * Zod Validation Middleware
 * Validates request bodies, queries, and params using Zod schemas
 */

const { z } = require('zod')

// Validation schemas
const schemas = {
  register: z.object({
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
    password: z.string().min(6),
    githubUsername: z.string().max(39).optional(),
  }),

  login: z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  }),

  updateSettings: z.object({
    theme: z.enum(['dark', 'light']).optional(),
    lang: z.enum(['zh', 'en']).optional(),
  }),

  progressBulk: z.object({
    progress: z.record(z.record(z.union([z.boolean(), z.object({
      checked: z.boolean(),
      checkedAt: z.string().optional()
    })])))
  }),

  progressToggle: z.object({
    checked: z.boolean().optional(),
  }),

  githubUsername: z.object({
    githubUsername: z.string().min(1).max(39),
  })
}

/**
 * Create validation middleware for request body
 */
function validateBody(schemaName) {
  return (req, res, next) => {
    const schema = schemas[schemaName]
    if (!schema) {
      return res.status(500).json({ error: 'Unknown validation schema' })
    }

    try {
      req.body = schema.parse(req.body)
      next()
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: e.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        })
      }
      return res.status(500).json({ error: 'Validation error' })
    }
  }
}

/**
 * Validate query parameters
 */
function validateQuery(schema) {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query)
      next()
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Invalid query parameters',
          details: e.errors
        })
      }
      return res.status(500).json({ error: 'Validation error' })
    }
  }
}

module.exports = { validateBody, schemas }
