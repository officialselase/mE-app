import User from '../models/User.js';
import TokenManager from '../utils/tokenManager.js';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;

    // Create user
    const user = await User.create({
      email,
      password,
      displayName,
      role: 'user'
    });

    // Generate tokens
    const accessToken = TokenManager.generateAccessToken(user);
    const refreshToken = TokenManager.generateRefreshToken(user);

    // Store refresh token
    await TokenManager.storeRefreshToken(user.id, refreshToken);

    // Update last login
    await User.updateLastLogin(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    if (error.message === 'Email already exists') {
      return res.status(409).json({
        error: 'Email already exists',
        code: 'EMAIL_EXISTS',
        statusCode: 409
      });
    }
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'AUTH_FAILED',
        statusCode: 401
      });
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'AUTH_FAILED',
        statusCode: 401
      });
    }

    // Generate tokens
    const accessToken = TokenManager.generateAccessToken(user);
    const refreshToken = TokenManager.generateRefreshToken(user);

    // Store refresh token
    await TokenManager.storeRefreshToken(user.id, refreshToken);

    // Update last login
    await User.updateLastLogin(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Revoke refresh token
      await TokenManager.revokeRefreshToken(refreshToken);
    }

    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    // User is attached to req by auth middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND',
        statusCode: 404
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role,
        emailVerified: user.email_verified,
        lastLogin: user.last_login,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token JWT signature
    let decoded;
    try {
      decoded = TokenManager.verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({
        error: 'Invalid or expired refresh token',
        code: 'INVALID_REFRESH_TOKEN',
        statusCode: 401
      });
    }

    // Validate token in database (check if revoked or expired)
    const tokenData = await TokenManager.validateRefreshToken(refreshToken);

    if (!tokenData) {
      return res.status(401).json({
        error: 'Refresh token is invalid, revoked, or expired',
        code: 'INVALID_REFRESH_TOKEN',
        statusCode: 401
      });
    }

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND',
        statusCode: 404
      });
    }

    // Generate new access token
    const accessToken = TokenManager.generateAccessToken(user);

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};
