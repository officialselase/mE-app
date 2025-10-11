-- Migration: Create orders table
-- Description: Creates the orders table for order management
-- Database: SQLite

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  items TEXT NOT NULL, -- JSON array of order items
  subtotal REAL NOT NULL CHECK (subtotal >= 0),
  tax REAL DEFAULT 0 CHECK (tax >= 0),
  shipping REAL DEFAULT 0 CHECK (shipping >= 0),
  total REAL NOT NULL CHECK (total >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address TEXT, -- JSON object with address details
  payment_intent_id TEXT, -- Stripe payment intent ID
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on user_id for user order lookup
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Create index on status for filtering orders by status
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Create index on created_at for sorting by date
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Create index on payment_intent_id for Stripe webhook lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON orders(payment_intent_id);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_orders_updated_at
  AFTER UPDATE ON orders
  FOR EACH ROW
BEGIN
  UPDATE orders SET updated_at = datetime('now') WHERE id = NEW.id;
END;