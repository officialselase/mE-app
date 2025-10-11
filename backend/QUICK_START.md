# Quick Start Guide - SQLite Edition 🚀

## Great News!

Your backend now uses **SQLite** instead of PostgreSQL!

✅ **No database server to install**
✅ **No configuration needed**
✅ **Works immediately**

---

## 3-Step Setup

### Step 1: Install Dependencies
```powershell
cd backend
npm install
```

### Step 2: Run Migrations
```powershell
npm run migrate
```

This creates the database file at `backend/data/portfolio.db`

Expected output:
```
✅ SQLite database initialized at: ./data/portfolio.db
🔄 Starting database migrations...
📄 Running migration: 001_create_users_table.sql
✅ Completed: 001_create_users_table.sql
✅ All migrations completed successfully!
🎉 Database setup complete!
```

### Step 3: Start the Server
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

### Quick Test
```powershell
# In a new terminal
curl http://localhost:5000/health
```

### Full Test Suite
```powershell
cd backend
.\test-auth.ps1
```

This will test:
- ✅ Health endpoint
- ✅ User registration
- ✅ User login
- ✅ Protected routes
- ✅ Token refresh
- ✅ Logout
- ✅ Input validation

---

## Troubleshooting

### Issue: "Port 5000 already in use"
**Cause:** Another process is using port 5000

**Solution 1:** Stop the other process
```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Solution 2:** Change the port
Edit `backend/.env`:
```env
PORT=5001
```

### Issue: "Cannot find module 'better-sqlite3'"
**Solution:** Install dependencies
```powershell
cd backend
npm install
```

### Issue: Want to start fresh?
**Solution:** Delete database and re-run migrations
```powershell
Remove-Item backend\data\portfolio.db
npm run migrate
```

---

## What's Different from PostgreSQL?

| Feature | PostgreSQL | SQLite |
|---------|-----------|--------|
| Installation | Requires separate server | Built-in, no installation |
| Configuration | Connection strings, passwords | Just a file path |
| Setup Time | 10-15 minutes | 30 seconds |
| Database File | Server manages | `backend/data/portfolio.db` |
| Perfect For | Large production apps | Development & small apps |

---

## Database Location

Your database is a single file:
```
backend/data/portfolio.db
```

You can:
- Copy it to back up
- Delete it to start fresh
- View it with SQLite tools
- Commit to git (dev) or ignore (prod)

---

## Next Steps

Once the server is running:

1. ✅ Test the authentication endpoints
2. ✅ Run the test suite: `.\test-auth.ps1`
3. ✅ Start the frontend: `cd .. && npm run dev`
4. ✅ Access your app: http://localhost:5173

---

## Summary

✅ **No PostgreSQL needed**
✅ **No database server to install**
✅ **No configuration required**
✅ **Just run migrations and start!**

```powershell
cd backend
npm install
npm run migrate
npm run dev
```

That's it! 🎉
