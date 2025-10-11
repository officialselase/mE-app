-- Migration: Create assignments table
-- Description: Creates the assignments table for lesson assignments
-- Database: SQLite

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  lesson_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT,
  type TEXT NOT NULL DEFAULT 'project' CHECK (type IN ('project', 'exercise', 'reading')),
  due_date TEXT,
  required INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- Create index on lesson_id for filtering assignments by lesson
CREATE INDEX IF NOT EXISTS idx_assignments_lesson_id ON assignments(lesson_id);

-- Create index on due_date for sorting by due date
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);

-- Create index on type for filtering by assignment type
CREATE INDEX IF NOT EXISTS idx_assignments_type ON assignments(type);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_assignments_updated_at
  AFTER UPDATE ON assignments
  FOR EACH ROW
BEGIN
  UPDATE assignments SET updated_at = datetime('now') WHERE id = NEW.id;
END;