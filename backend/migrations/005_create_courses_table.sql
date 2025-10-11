-- Migration: Create courses table
-- Description: Creates the courses table for the learn platform
-- Database: SQLite

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructor_id TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on instructor_id for filtering courses by instructor
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);

-- Create index on created_at for sorting by date
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_courses_updated_at
  AFTER UPDATE ON courses
  FOR EACH ROW
BEGIN
  UPDATE courses SET updated_at = datetime('now') WHERE id = NEW.id;
END;