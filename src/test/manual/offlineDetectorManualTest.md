# OfflineDetector Manual Testing Guide

## Prerequisites
- Django backend running on http://localhost:8000
- React frontend running on http://localhost:5173
- Health endpoint accessible at http://localhost:8000/api/health/

## Test Cases

### 1. Normal Operation (Good Connection)
**Steps:**
1. Start both Django backend and React frontend
2. Open the React app in browser
3. Check that no offline banner is visible at the top

**Expected Result:**
- No banner should be visible
- Console should show successful health checks (if dev tools open)

### 2. Django Backend Unavailable (Poor Connection)
**Steps:**
1. Stop the Django backend server
2. Refresh the React app or wait for periodic check (30 seconds)
3. Observe the banner behavior

**Expected Result:**
- Red/yellow banner should appear at top
- Message: "Network connected but Django backend is unreachable"
- Retry button should be visible
- Additional info about server issues should be shown

### 3. Network Offline (Offline State)
**Steps:**
1. Disconnect from internet or use browser dev tools to simulate offline
2. Observe the banner behavior

**Expected Result:**
- Red banner should appear
- Message: "You're offline. Some features may not work properly."
- Additional info about network connection should be shown

### 4. Connection Recovery
**Steps:**
1. Start with Django backend stopped (poor connection state)
2. Start the Django backend
3. Click the "Retry" button or wait for automatic recovery

**Expected Result:**
- Banner should show "Connected to Django API" briefly
- Banner should disappear after 2-3 seconds
- Connection status should return to normal

### 5. Health Endpoint 404 (Configuration Issue)
**Steps:**
1. Modify Django URLs to remove health endpoint temporarily
2. Restart Django backend
3. Refresh React app

**Expected Result:**
- Banner should show poor connection state
- Console should log "Health endpoint not found" error
- Additional info should mention configuration problems

## Verification Points

### Visual Indicators
- ✅ Banner appears/disappears smoothly with transitions
- ✅ Correct icons are shown (Wifi, WifiOff, RefreshCw, AlertCircle)
- ✅ Colors match connection state (green=good, yellow=poor, red=offline)
- ✅ Retry button is only shown when appropriate

### Functional Behavior
- ✅ Automatic periodic checks every 30 seconds
- ✅ Custom events dispatched for other components
- ✅ Retry functionality works correctly
- ✅ Error messages are user-friendly and informative

### Technical Verification
- ✅ Uses configured djangoApi client instead of raw fetch
- ✅ Proper error handling for different error types
- ✅ No console errors or warnings
- ✅ Accessibility attributes (role="alert", aria-live="polite")

## Console Commands for Testing

```javascript
// Test health endpoint directly
fetch('http://localhost:8000/api/health/')
  .then(r => r.json())
  .then(console.log);

// Listen for custom events
window.addEventListener('django-connection-restored', (e) => {
  console.log('Connection restored:', e.detail);
});

window.addEventListener('django-connection-lost', (e) => {
  console.log('Connection lost:', e.detail);
});
```

## Common Issues and Solutions

### Issue: Banner doesn't appear when backend is down
**Solution:** Check that the health endpoint URL is correct in .env file

### Issue: Banner appears even when backend is running
**Solution:** Check CORS configuration in Django backend

### Issue: Retry button doesn't work
**Solution:** Verify that retryRequest function is properly imported and configured

### Issue: No custom events dispatched
**Solution:** Check that event listeners are properly set up in consuming components