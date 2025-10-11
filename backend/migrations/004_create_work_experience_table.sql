-- Migration: Create work_experience table
-- Description: Creates the work_experience table for work history management
-- Database: SQLite

-- Create work_experience table
CREATE TABLE IF NOT EXISTS work_experience (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  current INTEGER DEFAULT 0,
  technologies TEXT, -- JSON array of technology names
  display_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Create index on display_order for sorting
CREATE INDEX IF NOT EXISTS idx_work_experience_order ON work_experience(display_order);

-- Create index on start_date for sorting by date
CREATE INDEX IF NOT EXISTS idx_work_experience_start_date ON work_experience(start_date DESC);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_work_experience_updated_at
  AFTER UPDATE ON work_experience
  FOR EACH ROW
BEGIN
  UPDATE work_experience SET updated_at = datetime('now') WHERE id = NEW.id;
END;
