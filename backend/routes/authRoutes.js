import express from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  refreshAccessToken
} from '../controllers/authController.js';
import {
  registerValidation,
  loginValidation,
  refreshTokenValidation
} from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerValidation, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidation, login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (revoke refresh token)
 * @access  Public
 */
router.post('/logout', logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticateToken, getCurrentUser);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', refreshTokenValidation, refreshAccessToken);

export default router;
