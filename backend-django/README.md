# Portfolio Backend - Django REST API

A comprehensive Django REST API backend for the portfolio website, providing endpoints for projects, thoughts, work experience, shop, and learning platform.

## 🚀 Features

### Portfolio Management
- **Projects**: Showcase your development projects with images, technologies, and links
- **Thoughts**: Blog posts and articles with rich content and tagging
- **Work Experience**: Professional experience with company logos and tech stacks

### E-commerce Shop
- **Products**: Digital products and services with image support
- **Cart Management**: Session-based cart for anonymous users, persistent cart for authenticated users
- **Order Processing**: Complete order management system

### Learning Platform
- **Courses**: Educational content with lessons and assignments
- **Enrollments**: Track student progress and completion
- **Submissions**: Student project submissions with GitHub integration
- **Inquiries**: Contact form for learning program inquiries

### Authentication & Users
- **JWT Authentication**: Secure token-based authentication
- **User Management**: Custom user model with roles and profiles
- **Permission System**: Flexible permissions for different user types

## 📁 Project Structure

```
backend-django/
├── portfolio_backend/          # Main Django project
│   ├── settings.py            # Django settings
│   ├── urls.py               # Main URL configuration
│   └── views.py              # Health check endpoint
├── portfolio/                 # Portfolio app
│   ├── models.py             # Project, Thought, WorkExperience models
│   ├── views.py              # Portfolio API views
│   ├── serializers.py        # DRF serializers
│   └── admin.py              # Django admin configuration
├── shop/                     # E-commerce app
│   ├── models.py             # Product, Cart, Order models
│   ├── views.py              # Shop API views
│   └── serializers.py        # Shop serializers
├── learn/                    # Learning platform app
│   ├── models.py             # Course, Lesson, Assignment models
│   ├── views.py              # Learning API views
│   └── serializers.py        # Learning serializers
├── authentication/           # Custom authentication app
│   ├── models.py             # Custom User model
│   ├── views.py              # Auth endpoints
│   └── authentication.py     # JWT authentication class
└── media/                    # Uploaded files (images, etc.)
```

## 🛠 Setup & Installation

### Prerequisites
- Python 3.8+
- pip
- Virtual environment (recommended)

### Installation Steps

1. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend-django directory:
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   JWT_SECRET_KEY=your-jwt-secret-key
   JWT_ACCESS_TOKEN_LIFETIME=900  # 15 minutes
   JWT_REFRESH_TOKEN_LIFETIME=604800  # 7 days
   ```

4. **Database Setup**
   ```bash
   python manage.py migrate
   ```

5. **Create Sample Data**
   ```bash
   python manage.py populate_data
   ```

6. **Create Superuser** (optional)
   ```bash
   python manage.py createsuperuser
   ```

7. **Run Development Server**
   ```bash
   python manage.py runserver
   ```

## 📡 API Endpoints

### Health Check
- `GET /api/health/` - API health status

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/refresh/` - Refresh JWT token
- `GET /api/auth/me/` - Get current user profile

### Portfolio
- `GET /api/portfolio/projects/` - List all projects
- `GET /api/portfolio/projects/{id}/` - Get specific project
- `GET /api/portfolio/thoughts/` - List all thoughts/blog posts
- `GET /api/portfolio/thoughts/{id}/` - Get specific thought
- `GET /api/portfolio/work/` - List work experience

### Shop
- `GET /api/shop/products/` - List all products
- `GET /api/shop/products/{id}/` - Get specific product
- `GET /api/shop/cart/` - Get user's cart (authenticated)
- `POST /api/shop/cart/` - Add item to cart (authenticated)
- `PATCH /api/shop/cart/` - Update cart item (authenticated)
- `DELETE /api/shop/cart/` - Remove item from cart (authenticated)

### Learning Platform
- `GET /api/learn/courses/` - List all courses (authenticated)
- `POST /api/learn/courses/{id}/enroll/` - Enroll in course (authenticated)
- `GET /api/learn/lessons/` - List lessons
- `GET /api/learn/assignments/` - List assignments
- `POST /api/learn/submissions/` - Submit assignment (authenticated)
- `POST /api/learn/inquiry/` - Submit learning inquiry (public)

## 🔧 Management Commands

### Check Integration Status
```bash
python manage.py check_integration
```

### Populate Sample Data
```bash
python manage.py populate_data
```

### Test API Endpoints
```bash
python test_api.py
```

## 🖼 Image Upload Support

The backend supports image uploads for:
- **Projects**: Featured images via `featured_image` field
- **Thoughts**: Featured images via `featured_image` field  
- **Work Experience**: Company logos via `company_logo` field
- **Products**: Product images via `featured_image` field

Images are automatically served with absolute URLs in API responses.

## 🔐 Authentication System

### JWT Token Flow
1. User registers/logs in → Receives access & refresh tokens
2. Frontend stores tokens in localStorage
3. Access token used for authenticated requests (15 min expiry)
4. Refresh token used to get new access tokens (7 day expiry)
5. Automatic token refresh in frontend API interceptors

### Permissions
- **Public Access**: Projects, Thoughts, Work Experience, Products
- **Authenticated Access**: Cart, Orders, Course Enrollment, Submissions
- **Admin Access**: Full CRUD operations via Django Admin

## 🎯 Frontend Integration

The backend is designed to work seamlessly with the React frontend:

1. **API Base URL**: `http://localhost:8000/api/`
2. **CORS**: Configured for `localhost:5173` (Vite dev server)
3. **Authentication**: JWT tokens with automatic refresh
4. **Error Handling**: Standardized error responses
5. **Pagination**: DRF pagination for large datasets

## 📊 Admin Panel

Access the Django admin at `http://localhost:8000/admin/` to:
- Manage all content (projects, thoughts, work experience)
- Upload images and media files
- Monitor user registrations and inquiries
- Process orders and manage products
- Oversee learning platform content

Default admin credentials (after running `populate_data`):
- Username: `admin`
- Password: `admin123`

## 🚀 Production Deployment

For production deployment:

1. Set `DEBUG=False` in settings
2. Configure proper database (PostgreSQL recommended)
3. Set up media file serving (AWS S3, Cloudinary, etc.)
4. Configure email backend for notifications
5. Set secure JWT secret keys
6. Enable HTTPS and update CORS settings
7. Set up proper logging and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `python manage.py test`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.