-- Migration: Create submissions table
-- Description: Creates the submissions table for assignment submissions (Odin Project style)
-- Database: SQLite

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  assignment_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL, -- Denormalized for easier display
  github_repo_url TEXT,
  live_preview_url TEXT,
  notes TEXT,
  is_public INTEGER DEFAULT 1, -- Allow students to see each other's work
  submitted_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(assignment_id, student_id) -- One submission per student per assignment
);

-- Create index on assignment_id for filtering submissions by assignment
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submissions(assignment_id);

-- Create index on student_id for filtering submissions by student
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions(student_id);

-- Create index on is_public for filtering public submissions
CREATE INDEX IF NOT EXISTS idx_submissions_public ON submissions(is_public);

-- Create index on submitted_at for sorting by submission date
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at DESC);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_submissions_updated_at
  AFTER UPDATE ON submissions
  FOR EACH ROW
BEGIN
  UPDATE submissions SET updated_at = datetime('now') WHERE id = NEW.id;
END;