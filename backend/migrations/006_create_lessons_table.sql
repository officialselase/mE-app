-- Migration: Create lessons table
-- Description: Creates the lessons table for course content
-- Database: SQLite

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  course_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  video_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Create index on course_id for filtering lessons by course
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);

-- Create index on order_index for sorting lessons within a course
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, order_index);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_lessons_updated_at
  AFTER UPDATE ON lessons
  FOR EACH ROW
BEGIN
  UPDATE lessons SET updated_at = datetime('now') WHERE id = NEW.id;
END;