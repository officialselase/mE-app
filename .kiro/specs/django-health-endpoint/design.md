# Design Document

## Overview

This design implements a comprehensive health check system for the Django backend and ensures all frontend-backend API integrations are properly connected and handle errors gracefully. The solution addresses the current 404 error from the OfflineDetector component and provides a robust foundation for monitoring Django API connectivity.

## Architecture

### Health Check System
- **Health Endpoint**: A lightweight `/api/health/` endpoint that provides system status information
- **Frontend Integration**: Enhanced OfflineDetector component that properly handles health check responses
- **Error Handling**: Comprehensive error handling for all API endpoints with graceful degradation

### API Integration Verification
- **Endpoint Mapping**: Verification that all frontend API calls map to existing Django endpoints
- **Error Boundaries**: Proper error handling for each API module (auth, portfolio, shop, learn)
- **Connection Testing**: Automated testing of all critical API endpoints

## Components and Interfaces

### Backend Components

#### 1. Health Check View (`portfolio_backend/views.py`)
```python
class HealthCheckView(APIView):
    """
    Lightweight health check endpoint for monitoring Django API availability
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({
            'status': 'healthy',
            'timestamp': timezone.now().isoformat(),
            'version': settings.VERSION,
            'database': self._check_database(),
        })
```

#### 2. URL Configuration Update
- Add health endpoint to main `portfolio_backend/urls.py`
- Ensure all existing endpoints are properly configured

#### 3. Database Connectivity Check
```python
def _check_database(self):
    """Simple database connectivity check"""
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return 'connected'
    except Exception:
        return 'disconnected'
```

### Frontend Components

#### 1. Enhanced OfflineDetector
- **Health Check Integration**: Use the new `/api/health/` endpoint
- **Error Handling**: Proper handling of 404, 500, and network errors
- **User Feedback**: Clear messaging about connection status

#### 2. API Integration Verification
- **Endpoint Testing**: Verify all API endpoints are reachable
- **Error Boundaries**: Add error boundaries around API-dependent components
- **Fallback Mechanisms**: Graceful degradation when APIs are unavailable

#### 3. Connection Status Manager
```javascript
class ConnectionStatusManager {
  async testAllEndpoints() {
    const endpoints = [
      '/api/health/',
      '/api/auth/me/',
      '/api/portfolio/projects/',
      '/api/shop/products/',
      '/api/learn/courses/'
    ];
    
    return Promise.allSettled(
      endpoints.map(endpoint => this.testEndpoint(endpoint))
    );
  }
}
```

## Data Models

### Health Check Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "database": "connected",
  "services": {
    "auth": "available",
    "portfolio": "available", 
    "shop": "available",
    "learn": "available"
  }
}
```

### API Endpoint Mapping
```javascript
const API_ENDPOINTS = {
  auth: [
    '/api/auth/register/',
    '/api/auth/login/',
    '/api/auth/logout/',
    '/api/auth/me/',
    '/api/auth/refresh/'
  ],
  portfolio: [
    '/api/portfolio/projects/',
    '/api/portfolio/thoughts/',
    '/api/portfolio/work/'
  ],
  shop: [
    '/api/shop/products/',
    '/api/shop/orders/',
    '/api/shop/cart/'
  ],
  learn: [
    '/api/learn/courses/',
    '/api/learn/lessons/',
    '/api/learn/assignments/',
    '/api/learn/submissions/'
  ]
};
```

## Error Handling

### Backend Error Responses
- **Standardized Format**: Consistent error response structure across all endpoints
- **Status Codes**: Proper HTTP status codes for different error types
- **Error Details**: Helpful error messages for debugging

### Frontend Error Handling
- **Network Errors**: Handle connection timeouts and network failures
- **API Errors**: Process Django error responses appropriately
- **User Messaging**: Show user-friendly error messages
- **Retry Logic**: Implement retry mechanisms for transient failures

### Error Response Format
```json
{
  "error": {
    "type": "validation|authentication|permission|not_found|server|network",
    "message": "Human-readable error message",
    "details": {},
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Testing Strategy

### Backend Testing
- **Health Endpoint Tests**: Unit tests for health check functionality
- **Integration Tests**: Test all API endpoints are accessible
- **Database Tests**: Verify database connectivity checks work correctly

### Frontend Testing
- **OfflineDetector Tests**: Test connectivity detection and user messaging
- **API Integration Tests**: Verify all frontend API calls work correctly
- **Error Handling Tests**: Test error scenarios and fallback behavior

### End-to-End Testing
- **Connection Flow**: Test complete connectivity detection flow
- **Error Recovery**: Test recovery from connection failures
- **User Experience**: Verify user sees appropriate messaging

## Implementation Phases

### Phase 1: Health Endpoint Implementation
1. Create Django health check view
2. Add health endpoint to URL configuration
3. Test health endpoint functionality

### Phase 2: Frontend Integration
1. Update OfflineDetector to use health endpoint
2. Enhance error handling in djangoApi.js
3. Add connection status management

### Phase 3: Comprehensive Testing
1. Verify all API endpoints are properly connected
2. Test error handling scenarios
3. Validate user experience improvements

### Phase 4: Monitoring and Optimization
1. Add logging for health check usage
2. Optimize health check performance
3. Monitor connection reliability

## Security Considerations

- **No Authentication Required**: Health endpoint should be publicly accessible for monitoring
- **Minimal Information Exposure**: Health endpoint should not expose sensitive system information
- **Rate Limiting**: Consider rate limiting to prevent abuse
- **CORS Configuration**: Ensure proper CORS settings for frontend access

## Performance Considerations

- **Lightweight Operations**: Health check should complete quickly (< 500ms)
- **Minimal Database Impact**: Use simple database connectivity check
- **Caching**: Consider caching health status for high-traffic scenarios
- **Resource Usage**: Monitor resource usage of health checks