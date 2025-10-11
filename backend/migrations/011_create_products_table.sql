-- Migration: Create products table
-- Description: Creates the products table for e-commerce shop functionality
-- Database: SQLite

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL CHECK (price >= 0),
  currency TEXT DEFAULT 'USD',
  images TEXT, -- JSON array of image URLs
  category TEXT,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  featured INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Create index on featured for filtering featured products
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);

-- Create index on category for filtering by category
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Create index on created_at for sorting by date
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Create index on price for sorting by price
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_products_updated_at
  AFTER UPDATE ON products
  FOR EACH ROW
BEGIN
  UPDATE products SET updated_at = datetime('now') WHERE id = NEW.id;
END;