import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create data directory if it doesn't exist
const dataDir = join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path
const dbPath = process.env.DB_PATH || join(dataDir, 'portfolio.db');

// Create SQLite database connection
const db = new Database(dbPath, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : null
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

console.log(`✅ SQLite database initialized at: ${dbPath}`);

/**
 * Execute a query and return results
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Object} Query result
 */
export const query = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    
    // Determine if it's a SELECT query
    const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
    const isReturning = sql.toUpperCase().includes('RETURNING');
    
    if (isSelect || isReturning) {
      const rows = stmt.all(...params);
      return { rows, rowCount: rows.length };
    } else {
      const info = stmt.run(...params);
      return { 
        rows: [], 
        rowCount: info.changes,
        lastID: info.lastInsertRowid 
      };
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

/**
 * Execute a query and return a single row
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Object|null} Single row or null
 */
export const queryOne = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    return stmt.get(...params) || null;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

/**
 * Execute multiple statements in a transaction
 * @param {Function} callback - Function containing transaction logic
 * @returns {*} Result of the transaction
 */
export const transaction = (callback) => {
  const transactionFn = db.transaction(callback);
  return transactionFn();
};

/**
 * Close database connection
 */
export const close = () => {
  db.close();
  console.log('✅ Database connection closed');
};

// Graceful shutdown
process.on('SIGTERM', () => {
  close();
  process.exit(0);
});

process.on('SIGINT', () => {
  close();
  process.exit(0);
});

export default db;
