# SQLite Setup Guide - SUPER SIMPLE! 🚀

## Good News!

✅ **No PostgreSQL needed!**
✅ **No database server to install!**
✅ **No configuration needed!**
✅ **Everything just works!**

Your backend now uses **SQLite** - a file-based database that requires ZERO setup!

---

## What Changed?

- ✅ Switched from PostgreSQL to SQLite
- ✅ Database is now a simple file: `backend/data/portfolio.db`
- ✅ No separate database server needed
- ✅ No passwords or connection strings
- ✅ Works out of the box!

---

## Quick Start (3 Commands)

### 1. Install Dependencies (if you haven't)
```powershell
cd backend
npm install
```

### 2. Run Migrations (creates the database)
```powershell
npm run migrate
```

Expected output:
```
✅ SQLite database initialized at: ./data/portfolio.db
🔄 Starting database migrations...
📄 Running migration: 001_create_users_table.sql
✅ Completed: 001_create_users_table.sql
✅ All migrations completed successfully!
🎉 Database setup complete!
```

### 3. Start the Server
```powershell
npm run dev
```

Expected output:
```
✅ SQLite database initialized at: ./data/portfolio.db
✅ Database connection verified: 2025-10-11 02:14:24
🚀 Server running on port 5000
📝 Environment: development
🌐 CORS enabled for: http://localhost:5173
```

---

## Test Everything

### Test 1: Health Check
```powershell
curl http://localhost:5000/health
```

Expected:
```json
{"status":"ok","timestamp":"...","environment":"development"}
```

### Test 2: Register a User
```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"SecurePass123\",\"displayName\":\"Test User\"}'
```

### Test 3: Run Full Test Suite
```powershell
.\test-auth.ps1
```

---

## Database File Location

Your database is stored at:
```
backend/data/portfolio.db
```

You can:
- ✅ Back it up by copying this file
- ✅ Delete it to start fresh
- ✅ View it with SQLite tools (DB Browser for SQLite, etc.)
- ✅ Commit it to git (for development) or add to .gitignore (for production)

---

## Troubleshooting

### Issue: "Port 5000 already in use"
**Solution:** Stop the existing server or change the port in `.env`:
```env
PORT=5001
```

### Issue: "Cannot find module 'better-sqlite3'"
**Solution:** Install dependencies:
```powershell
npm install
```

### Issue: "Database file not found"
**Solution:** Run migrations:
```powershell
npm run migrate
```

### Issue: Want to start fresh?
**Solution:** Delete the database and re-run migrations:
```powershell
Remove-Item backend\data\portfolio.db
npm run migrate
```

---

## Advantages of SQLite

1. **Zero Configuration** - No database server to install or configure
2. **Portable** - Database is a single file you can copy anywhere
3. **Fast** - Perfect for development and small to medium applications
4. **Reliable** - Used by millions of applications worldwide
5. **Simple** - No connection strings, passwords, or network issues

---

## When to Switch to PostgreSQL?

SQLite is perfect for:
- ✅ Development
- ✅ Testing
- ✅ Small to medium applications
- ✅ Single-server deployments

Consider PostgreSQL for:
- ⏳ Very high concurrent writes (1000+ simultaneous users)
- ⏳ Multi-server deployments
- ⏳ Complex queries with advanced features
- ⏳ Very large databases (100GB+)

For most portfolio websites and small applications, **SQLite is perfect!**

---

## Database Tools (Optional)

Want to view your database visually?

**DB Browser for SQLite** (Free, Open Source)
- Download: https://sqlitebrowser.org/
- Open: `backend/data/portfolio.db`
- View tables, run queries, edit data

**VS Code Extension**
- Install: "SQLite" by alexcvzz
- Right-click `portfolio.db` → "Open Database"

---

## Summary

✅ **Migrations completed successfully**
✅ **Database created at:** `backend/data/portfolio.db`
✅ **Server is ready to run**
✅ **No additional setup needed**

Just run:
```powershell
cd backend
npm run dev
```

And you're good to go! 🎉
