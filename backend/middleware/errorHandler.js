// Custom error class for API errors
export class APIError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', field = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.field = field;
    this.name = 'APIError';
  }
}

// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Handle API errors
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      field: err.field,
      statusCode: err.statusCode
    });
  }

  // Handle validation errors from express-validator
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      fields: err.errors,
      statusCode: 422
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      code: 'INVALID_TOKEN',
      statusCode: 401
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      code: 'TOKEN_EXPIRED',
      statusCode: 401
    });
  }

  // Handle database errors
  if (err.code && err.code.startsWith('23')) {
    // PostgreSQL constraint violations
    return res.status(400).json({
      error: 'Database constraint violation',
      code: 'DB_CONSTRAINT_ERROR',
      statusCode: 400
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(statusCode).json({
    error: message,
    code: 'INTERNAL_ERROR',
    statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'NOT_FOUND',
    statusCode: 404,
    path: req.originalUrl
  });
};

// Async handler wrapper to catch errors in async route handlers
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
