-- Migration: Create thoughts table
-- Description: Creates the thoughts table for blog posts/thoughts management
-- Database: SQLite

-- Create thoughts table
CREATE TABLE IF NOT EXISTS thoughts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  snippet TEXT NOT NULL,
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  featured INTEGER DEFAULT 0,
  tags TEXT, -- JSON array of tags
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Create index on featured for filtering featured thoughts
CREATE INDEX IF NOT EXISTS idx_thoughts_featured ON thoughts(featured);

-- Create index on date for sorting by date
CREATE INDEX IF NOT EXISTS idx_thoughts_date ON thoughts(date DESC);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_thoughts_created_at ON thoughts(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_thoughts_updated_at
  AFTER UPDATE ON thoughts
  FOR EACH ROW
BEGIN
  UPDATE thoughts SET updated_at = datetime('now') WHERE id = NEW.id;
END;
