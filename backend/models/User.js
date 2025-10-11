import db, { query, queryOne } from '../config/database.js';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

const SALT_ROUNDS = 12;

/**
 * Generate a UUID-like ID
 */
const generateId = () => {
  return randomBytes(16).toString('hex');
};

class User {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {string} userData.email - User email
   * @param {string} userData.password - Plain text password
   * @param {string} userData.displayName - User display name
   * @param {string} [userData.role='user'] - User role
   * @returns {Promise<Object>} Created user (without password)
   */
  static async create({ email, password, displayName, role = 'user' }) {
    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const id = generateId();

    const sql = `
      INSERT INTO users (id, email, password_hash, display_name, role)
      VALUES (?, ?, ?, ?, ?)
    `;

    const values = [id, email.toLowerCase().trim(), passwordHash, displayName.trim(), role];

    try {
      query(sql, values);
      
      // Return the created user
      return this.findById(id);
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  static async findByEmail(email) {
    const sql = `
      SELECT id, email, password_hash, display_name, role, email_verified, last_login, created_at, updated_at
      FROM users
      WHERE email = ? COLLATE NOCASE
    `;

    return queryOne(sql, [email.toLowerCase().trim()]);
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User object (without password) or null
   */
  static async findById(id) {
    const sql = `
      SELECT id, email, display_name, role, email_verified, last_login, created_at, updated_at
      FROM users
      WHERE id = ?
    `;

    return queryOne(sql, [id]);
  }

  /**
   * Verify password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>} True if password matches
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update last login timestamp
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  static async updateLastLogin(userId) {
    const sql = `
      UPDATE users
      SET last_login = datetime('now')
      WHERE id = ?
    `;

    query(sql, [userId]);
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated user (without password)
   */
  static async update(userId, updates) {
    const allowedFields = ['display_name', 'email_verified'];
    const fields = [];
    const values = [];

    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(userId);

    const sql = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = ?
    `;

    query(sql, values);
    return this.findById(userId);
  }

  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} True if deleted
   */
  static async delete(userId) {
    const sql = 'DELETE FROM users WHERE id = ?';
    const result = query(sql, [userId]);
    return result.rowCount > 0;
  }

  /**
   * Get all users (admin only)
   * @param {Object} options - Query options
   * @param {number} [options.limit=50] - Number of users to return
   * @param {number} [options.offset=0] - Offset for pagination
   * @returns {Promise<Array>} Array of users (without passwords)
   */
  static async findAll({ limit = 50, offset = 0 } = {}) {
    const sql = `
      SELECT id, email, display_name, role, email_verified, last_login, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const result = query(sql, [limit, offset]);
    return result.rows;
  }

  /**
   * Count total users
   * @returns {Promise<number>} Total user count
   */
  static async count() {
    const sql = 'SELECT COUNT(*) as count FROM users';
    const result = queryOne(sql);
    return result.count;
  }
}

export default User;
