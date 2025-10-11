# Fix "Port Already in Use" Issue

## The Good News! 🎉

**SQLite is working perfectly!** There's NO SQLite error.

You saw:
```
✅ SQLite database initialized at: ./data/portfolio.db
✅ Database connection verified: 2025-10-11 02:22:31
```

## The Issue

The error is: **"Port 5000 already in use"**

This means you already have a server running on port 5000 (probably from a previous attempt).

---

## Solution 1: Stop the Existing Server (Recommended)

### Option A: Find and Stop in Task Manager
1. Press `Ctrl + Shift + Esc` to open Task Manager
2. Find "Node.js" processes
3. Right-click → End Task

### Option B: Kill from Command Line
```powershell
# Kill the process using port 5000
taskkill /PID 22352 /F

# Or kill all Node processes (be careful!)
taskkill /IM node.exe /F
```

### Option C: Close the Terminal
If you started the server in another terminal, just close that terminal window.

---

## Solution 2: Use a Different Port

Edit `backend/.env` and change the port:

```env
PORT=5001
```

Then start the server:
```powershell
npm run dev
```

Your server will now run on port 5001 instead.

---

## Solution 3: Restart Your Computer

If all else fails, a quick restart will clear all ports.

---

## Verify It's Fixed

After stopping the old server, start a new one:

```powershell
cd backend
npm run dev
```

You should see:
```
✅ SQLite database initialized at: ./data/portfolio.db
✅ Database connection verified: 2025-10-11 02:22:31
🚀 Server running on port 5000
📝 Environment: development
🌐 CORS enabled for: http://localhost:5173
```

---

## Test Everything

Once the server is running, test it:

```powershell
# In a new terminal
curl http://localhost:5000/health
```

Or run the full test suite:
```powershell
cd backend
.\test-auth.ps1
```

---

## Summary

✅ **SQLite is working perfectly**
✅ **Database is created and ready**
✅ **All code is correct**
❌ **Port 5000 is occupied by another process**

**Fix:** Stop the old server or use a different port.

That's it! 🚀
