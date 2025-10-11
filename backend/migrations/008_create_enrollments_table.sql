-- Migration: Create enrollments table
-- Description: Creates the enrollments table for student course enrollment and progress tracking
-- Database: SQLite

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  completed_lessons TEXT DEFAULT '[]', -- JSON array of completed lesson IDs
  enrolled_at TEXT DEFAULT (datetime('now')),
  last_accessed_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE(user_id, course_id) -- Prevent duplicate enrollments
);

-- Create index on user_id for filtering enrollments by user
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);

-- Create index on course_id for filtering enrollments by course
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);

-- Create index on enrolled_at for sorting by enrollment date
CREATE INDEX IF NOT EXISTS idx_enrollments_enrolled_at ON enrollments(enrolled_at DESC);

-- Create trigger to update last_accessed_at when completed_lessons is updated
CREATE TRIGGER IF NOT EXISTS update_enrollments_last_accessed
  AFTER UPDATE OF completed_lessons ON enrollments
  FOR EACH ROW
BEGIN
  UPDATE enrollments SET last_accessed_at = datetime('now') WHERE id = NEW.id;
END;