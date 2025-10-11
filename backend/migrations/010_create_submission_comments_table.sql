-- Migration: Create submission_comments table
-- Description: Creates the submission_comments table for commenting on student submissions
-- Database: SQLite

-- Create submission_comments table
CREATE TABLE IF NOT EXISTS submission_comments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  submission_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL, -- Denormalized for easier display
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on submission_id for filtering comments by submission
CREATE INDEX IF NOT EXISTS idx_submission_comments_submission_id ON submission_comments(submission_id);

-- Create index on user_id for filtering comments by user
CREATE INDEX IF NOT EXISTS idx_submission_comments_user_id ON submission_comments(user_id);

-- Create index on created_at for sorting comments by date
CREATE INDEX IF NOT EXISTS idx_submission_comments_created_at ON submission_comments(created_at ASC);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_submission_comments_updated_at
  AFTER UPDATE ON submission_comments
  FOR EACH ROW
BEGIN
  UPDATE submission_comments SET updated_at = datetime('now') WHERE id = NEW.id;
END;