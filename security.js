/**
 * Security Middleware for ProtexxaLearn
 * Add this to server.js for production-grade security
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

/**
 * Helmet - Security headers middleware
 * Protects against common web vulnerabilities
 */
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || "http://localhost:3001"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow iframe embeds for course content
});

/**
 * CORS Configuration - Restrict origins in production
 */
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3001,http://localhost:3000')
      .split(',')
      .map(o => o.trim());
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow Railway production domain
    if (origin && origin.includes('railway.app')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

/**
 * Rate Limiting - Prevent brute force attacks
 */

// General API rate limit
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limit for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again after 15 minutes.',
  skipSuccessfulRequests: true,
});

// Email rate limiter
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 emails per hour
  message: 'Too many emails sent, please try again later.',
});

/**
 * Input Validation Rules
 */

// Registration validation
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2-100 characters')
    .escape(),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('role')
    .optional()
    .isIn(['student', 'instructor', 'admin'])
    .withMessage('Invalid role'),
];

// Login validation
const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Course validation
const validateCourse = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3-200 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description too long'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status'),
];

// Module validation
const validateModule = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2-200 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description too long'),
  body('course_id')
    .isInt()
    .withMessage('Invalid course ID'),
];

// Assignment validation
const validateAssignment = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3-200 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Description too long'),
  body('course_id')
    .isInt()
    .withMessage('Invalid course ID'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
];

/**
 * Validation Error Handler Middleware
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

/**
 * Sanitize HTML Content (for course content)
 * Allows safe HTML tags while removing dangerous scripts
 */
const sanitizeHTML = (html) => {
  if (!html) return html;
  
  // Remove script tags and event handlers
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/javascript:/gi, '');
  
  return clean;
};

/**
 * Request Logger Middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    console.log(`[${logLevel}] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });
  next();
};

/**
 * Error Handler Middleware (must be last)
 */
const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(err.status || 500).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 Handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
};

module.exports = {
  // Middleware functions
  helmetConfig,
  corsOptions,
  generalLimiter,
  authLimiter,
  emailLimiter,
  requestLogger,
  errorHandler,
  notFoundHandler,
  
  // Validation middleware
  validateRegistration,
  validateLogin,
  validateCourse,
  validateModule,
  validateAssignment,
  handleValidationErrors,
  
  // Utilities
  sanitizeHTML,
};
