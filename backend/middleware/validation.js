import { body, validationResult } from 'express-validator';

/**
 * Middleware to check validation results
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      statusCode: 422,
      fields: errors.array().reduce((acc, err) => {
        acc[err.path] = err.msg;
        return acc;
      }, {})
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
export const registerValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('displayName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Display name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Display name can only contain letters, numbers, spaces, hyphens, and underscores'),
  validate
];

/**
 * Validation rules for user login
 */
export const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

/**
 * Validation rules for refresh token
 */
export const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
  validate
];
