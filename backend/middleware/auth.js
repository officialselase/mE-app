import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production';

/**
 * Middleware to authenticate JWT token
 * Verifies the access token and attaches user info to req.user
 */
export const authenticateToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access token required',
      code: 'TOKEN_REQUIRED',
      statusCode: 401
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access token expired',
        code: 'TOKEN_EXPIRED',
        statusCode: 401
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid access token',
        code: 'INVALID_TOKEN',
        statusCode: 401
      });
    }

    return res.status(500).json({
      error: 'Token verification failed',
      code: 'TOKEN_VERIFICATION_FAILED',
      statusCode: 500
    });
  }
};

/**
 * Middleware to check if user has required role
 * @param {string[]} roles - Array of allowed roles
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
        statusCode: 401
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
        statusCode: 403
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Middleware to check if user is instructor or admin
 */
export const requireInstructor = requireRole(['instructor', 'admin']);

/**
 * Middleware to check if user is student, instructor, or admin
 */
export const requireStudent = requireRole(['student', 'instructor', 'admin']);

/**
 * Optional authentication - attaches user if token is valid, but doesn't require it
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    // Token is invalid, but we don't fail the request
    console.log('Optional auth: Invalid token provided');
  }

  next();
};
