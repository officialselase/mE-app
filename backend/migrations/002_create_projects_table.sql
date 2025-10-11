-- Migration: Create projects table
-- Description: Creates the projects table for portfolio project management
-- Database: SQLite

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  images TEXT, -- JSON array of image URLs
  technologies TEXT, -- JSON array of technology names
  github_url TEXT,
  live_url TEXT,
  featured INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Create index on featured for filtering featured projects
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);

-- Create index on created_at for sorting by date
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_projects_updated_at
  AFTER UPDATE ON projects
  FOR EACH ROW
BEGIN
  UPDATE projects SET updated_at = datetime('now') WHERE id = NEW.id;
END;
