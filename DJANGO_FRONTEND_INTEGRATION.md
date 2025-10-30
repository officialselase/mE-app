# Django-Frontend Integration Guide

This document outlines how the React frontend is integrated with the Django backend and provides instructions for setup and verification.

## 🏗️ Architecture Overview

### Frontend (React + Vite)
- **Port**: 5173 (development)
- **API Client**: `src/utils/djangoApi.js`
- **Base URL**: `http://localhost:8000` (configurable via `.env`)

### Backend (Django + DRF)
- **Port**: 8000
- **API Base**: `/api/`
- **Admin Panel**: `/admin/`

## 🔗 API Integration Status

### ✅ Fully Integrated Modules

#### 1. **Portfolio Module** (`/api/portfolio/`)
- **Thoughts Page**: Fetches blog posts/thoughts with pagination
- **Work Page**: Displays work experience with proper error handling
- **Projects**: Ready for project data (hooks implemented)

#### 2. **Learn Module** (`/api/learn/`)
- **Courses**: Authenticated course listing and enrollment
- **Lessons & Assignments**: Full CRUD operations
- **Submissions**: Student submission management
- **Registration Form**: Integrated with inquiry endpoint

#### 3. **Shop Module** (`/api/shop/`)
- **Products**: Dynamic product listing from Django
- **Cart**: Authenticated cart management with localStorage fallback
- **Orders**: Order creation and management

#### 4. **Authentication** (`/api/auth/`)
- **Login/Register**: JWT-based authentication
- **Token Refresh**: Automatic token renewal
- **Protected Routes**: Course access control

### 🔧 Key Integration Features

#### Smart Caching System
```javascript
// Automatic caching with stale-while-revalidate
const { thoughts, loading, error } = useThoughts({ page: 1, limit: 10 });
```

#### Graceful Degradation
```javascript
// Fallback to cached/static data when API fails
const products = useShop(); // Falls back to demo data if API unavailable
```

#### Error Handling
- Django-specific error parsing
- User-friendly error messages
- Automatic retry for network errors
- Offline detection and handling

#### Authentication Flow
- JWT tokens stored securely
- Automatic token refresh
- Logout on token expiration
- Protected route handling

## 🚀 Quick Start

### 1. Setup Django Backend
```bash
# Run the setup script
./setup-django.bat

# Or manually:
cd backend-django
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
```

### 2. Setup Frontend
```bash
# Install dependencies
npm install

# Configure environment
# Copy .env.example to .env and update values
```

### 3. Start Both Servers
```bash
# Option 1: Use the convenience script
./start-servers.bat

# Option 2: Use npm script
npm run start:both

# Option 3: Start manually
# Terminal 1:
cd backend-django && python manage.py runserver

# Terminal 2:
npm run dev
```

### 4. Verify Integration
```bash
npm run verify:integration
```

## 📋 Environment Configuration

### Required Environment Variables
```env
# .env file
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_DJANGO_API_URL=http://localhost:8000
```

### Django Settings
```python
# backend-django/portfolio_backend/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
]
```

## 🔍 API Endpoints Reference

### Portfolio Endpoints
```
GET  /api/portfolio/projects/     # List projects
GET  /api/portfolio/projects/{id} # Get project details
GET  /api/portfolio/thoughts/     # List thoughts (paginated)
GET  /api/portfolio/thoughts/{id} # Get thought details
GET  /api/portfolio/work/         # List work experience
```

### Shop Endpoints
```
GET    /api/shop/products/        # List products
GET    /api/shop/products/{id}    # Get product details
GET    /api/shop/cart/            # Get user cart
POST   /api/shop/cart/            # Add to cart
PATCH  /api/shop/cart/            # Update cart item
DELETE /api/shop/cart/            # Remove from cart
POST   /api/shop/orders/          # Create order
```

### Learn Endpoints
```
GET  /api/learn/courses/                    # List courses
POST /api/learn/courses/{id}/enroll/        # Enroll in course
GET  /api/learn/lessons/                    # List lessons
GET  /api/learn/assignments/                # List assignments
POST /api/learn/submissions/                # Submit assignment
POST /api/learn/inquiry/                    # Submit learning inquiry
```

### Authentication Endpoints
```
POST /api/auth/register/          # User registration
POST /api/auth/login/             # User login
POST /api/auth/logout/            # User logout
GET  /api/auth/me/                # Get current user
POST /api/auth/refresh/           # Refresh JWT token
```

## 🛠️ Frontend Integration Patterns

### 1. API Hooks Pattern
```javascript
// Custom hooks for each module
const { thoughts, loading, error, refetch } = useThoughts();
const { courses, enrollInCourse } = useCourses();
const { products, addToCart } = useShop();
```

### 2. Error Boundary Integration
```javascript
// Automatic error handling with user-friendly messages
<APIErrorBoundary>
  <ThoughtsPage />
</APIErrorBoundary>
```

### 3. Authentication Context
```javascript
// Global authentication state
const { isAuthenticated, user, login, logout } = useAuth();
```

### 4. Offline Support
```javascript
// Automatic offline detection and graceful degradation
const { isOnline } = useConnectionStatus();
```

## 🧪 Testing Integration

### Manual Testing Checklist
- [ ] Frontend loads at http://localhost:5173
- [ ] Backend responds at http://localhost:8000/api/health/
- [ ] Thoughts page loads data from Django
- [ ] Work page displays experience from API
- [ ] Shop shows products from Django
- [ ] Cart operations work (add/remove/update)
- [ ] Learn registration form submits to Django
- [ ] Course enrollment works for authenticated users
- [ ] Error states display properly
- [ ] Offline mode gracefully degrades

### Automated Verification
```bash
# Run the integration verification script
npm run verify:integration
```

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Errors
```
Access to XMLHttpRequest at 'http://localhost:8000' from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Solution**: Ensure `django-cors-headers` is installed and configured in Django settings.

#### 2. Authentication Errors
```
401 Unauthorized
```
**Solution**: Check JWT token storage and refresh logic in `src/utils/tokenManager.js`.

#### 3. API Connection Errors
```
Network Error / ECONNREFUSED
```
**Solution**: Verify Django server is running on port 8000.

#### 4. Environment Variables Not Loading
```
Cannot read properties of undefined
```
**Solution**: Ensure `.env` file exists and variables start with `VITE_`.

### Debug Mode
Enable debug logging by adding to your `.env`:
```env
VITE_DEBUG_API=true
```

## 📈 Performance Considerations

### Caching Strategy
- API responses cached with TTL
- Stale-while-revalidate pattern
- Request deduplication
- Optimistic updates for mutations

### Bundle Optimization
- Code splitting by route
- Lazy loading of heavy components
- Tree shaking of unused code
- Image optimization

### Network Optimization
- Request batching where possible
- Compression enabled
- CDN for static assets
- Service worker for offline support

## 🔒 Security Features

### Authentication Security
- JWT tokens with expiration
- Secure token storage
- Automatic token refresh
- CSRF protection

### API Security
- CORS properly configured
- Rate limiting (Django side)
- Input validation and sanitization
- SQL injection protection (Django ORM)

## 📚 Additional Resources

- [Django REST Framework Documentation](https://www.django-rest-framework.org/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Vite Configuration Guide](https://vitejs.dev/config/)
- [JWT Authentication Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

**Last Updated**: December 2024  
**Integration Status**: ✅ Fully Operational