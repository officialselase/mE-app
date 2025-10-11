import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

/**
 * Run all SQL migration files in order
 */
async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...\n');

    // Get all migration files
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('⚠️  No migration files found');
      return;
    }

    // Run each migration
    for (const file of files) {
      console.log(`📄 Running migration: ${file}`);
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      // Execute the SQL (SQLite can handle multiple statements)
      db.exec(sql);
      console.log(`✅ Completed: ${file}\n`);
    }

    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run migrations
runMigrations()
  .then(() => {
    console.log('\n🎉 Database setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Database setup failed:', error);
    process.exit(1);
  });
