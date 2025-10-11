-- Migration: Create carts table
-- Description: Creates the carts table for shopping cart functionality
-- Database: SQLite

-- Create carts table
CREATE TABLE IF NOT EXISTS carts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  items TEXT NOT NULL DEFAULT '[]', -- JSON array of cart items
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on user_id for quick cart lookup
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_carts_updated_at
  AFTER UPDATE ON carts
  FOR EACH ROW
BEGIN
  UPDATE carts SET updated_at = datetime('now') WHERE id = NEW.id;
END;