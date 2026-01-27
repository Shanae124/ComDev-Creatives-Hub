// Authentication Middleware
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Authenticate user from JWT token
 */
function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Require specific permission
 */
function requirePermission(permission) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if user has permission
      // This would integrate with OrganizationService.checkPermission()
      const hasPermission = req.user.permissions?.includes(permission) ||
                          req.user.permissions?.includes('*') ||
                          req.user.role === 'admin';

      if (!hasPermission) {
        return res.status(403).json({ error: `Permission denied: ${permission}` });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
}

/**
 * Require specific role
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
}

/**
 * Optional authentication (attach user if token present, but don't require it)
 */
function optionalAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Invalid token, but continue without authentication
    next();
  }
}

module.exports = {
  authenticate,
  requirePermission,
  requireRole,
  optionalAuth,
  JWT_SECRET
};
