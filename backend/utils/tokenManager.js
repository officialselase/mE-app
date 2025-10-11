import jwt from 'jsonwebtoken';
import { query, queryOne } from '../config/database.js';
import { randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key_here_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate a UUID-like ID
 */
const generateId = () => {
  return randomBytes(16).toString('hex');
};

/**
 * Token Manager - Centralized token operations
 */
class TokenManager {
  /**
   * Generate access token (15 minutes expiration)
   * @param {Object} user - User object
   * @returns {string} JWT access token
   */
  static generateAccessToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        iat: Math.floor(Date.now() / 1000) // Issued at timestamp
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  /**
   * Generate refresh token (7 days expiration)
   * @param {Object} user - User object
   * @returns {string} JWT refresh token
   */
  static generateRefreshToken(user) {
    return jwt.sign(
      {
        id: user.id,
        type: 'refresh',
        jti: generateId() // Unique token ID to prevent duplicates
      },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );
  }

  /**
   * Verify access token
   * @param {string} token - Access token
   * @returns {Object} Decoded token payload
   * @throws {Error} If token is invalid or expired
   */
  static verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET);
  }

  /**
   * Verify refresh token
   * @param {string} token - Refresh token
   * @returns {Object} Decoded token payload
   * @throws {Error} If token is invalid or expired
   */
  static verifyRefreshToken(token) {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  }

  /**
   * Store refresh token in database
   * @param {string} userId - User ID
   * @param {string} token - Refresh token
   * @returns {Promise<void>}
   */
  static async storeRefreshToken(userId, token) {
    const id = generateId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const sql = `
      INSERT INTO refresh_tokens (id, user_id, token, expires_at)
      VALUES (?, ?, ?, ?)
    `;

    query(sql, [id, userId, token, expiresAt.toISOString()]);
  }

  /**
   * Revoke refresh token
   * @param {string} token - Refresh token to revoke
   * @returns {Promise<boolean>} True if token was revoked
   */
  static async revokeRefreshToken(token) {
    const sql = `
      UPDATE refresh_tokens
      SET revoked = 1
      WHERE token = ? AND revoked = 0
    `;

    const result = query(sql, [token]);
    return result.rowCount > 0;
  }

  /**
   * Revoke all refresh tokens for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Number of tokens revoked
   */
  static async revokeAllUserTokens(userId) {
    const sql = `
      UPDATE refresh_tokens
      SET revoked = 1
      WHERE user_id = ? AND revoked = 0
    `;

    const result = query(sql, [userId]);
    return result.rowCount;
  }

  /**
   * Check if refresh token is valid (exists, not revoked, not expired)
   * @param {string} token - Refresh token
   * @returns {Promise<Object|null>} Token data or null if invalid
   */
  static async validateRefreshToken(token) {
    const sql = `
      SELECT user_id, revoked, expires_at
      FROM refresh_tokens
      WHERE token = ?
    `;

    const tokenData = queryOne(sql, [token]);

    if (!tokenData) {
      return null;
    }

    // Check if revoked
    if (tokenData.revoked === 1) {
      return null;
    }

    // Check if expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return null;
    }

    return tokenData;
  }

  /**
   * Clean up expired refresh tokens (should be run periodically)
   * @returns {Promise<number>} Number of tokens deleted
   */
  static async cleanupExpiredTokens() {
    const sql = `
      DELETE FROM refresh_tokens
      WHERE expires_at < datetime('now')
    `;

    const result = query(sql);
    return result.rowCount;
  }

  /**
   * Get all active refresh tokens for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of active tokens
   */
  static async getUserActiveTokens(userId) {
    const sql = `
      SELECT id, token, expires_at, created_at
      FROM refresh_tokens
      WHERE user_id = ? AND revoked = 0 AND expires_at > datetime('now')
      ORDER BY created_at DESC
    `;

    const result = query(sql, [userId]);
    return result.rows;
  }
}

export default TokenManager;
