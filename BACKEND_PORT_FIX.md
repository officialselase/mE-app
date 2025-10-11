# Backend Port Configuration Fix

## Issue
The backend server was configured to run on port 5000, but that port was already in use by another process, causing an `EADDRINUSE` error. Multiple subsequent ports (3001, 3002, 8080, 4000) were also in use.

## Solution
Changed the backend server port to 3010, which was found to be available.

## Changes Made

### Backend Configuration
- `backend/.env`: Changed `PORT=5000` to `PORT=3010`
- `backend/server.js`: Changed fallback port from 5000 to 3010

### Frontend Configuration  
- `.env`: Changed `VITE_API_URL=http://localhost:3000` to `VITE_API_URL=http://localhost:3010`
- `.env.example`: Updated to reflect port 3010
- `src/utils/api.js`: Updated fallback URLs from port 3000 to 3010

## Result
- Backend server now runs on port 3010
- Frontend connects to `http://localhost:3010`
- No more port conflicts

## Next Steps
The backend server should automatically restart and be accessible. Your frontend should now be able to connect to the API successfully.