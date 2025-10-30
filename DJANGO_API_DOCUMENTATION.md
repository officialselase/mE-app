# Django Backend API Documentation

This document provides comprehensive documentation for the Django REST API that powers the portfolio frontend.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://your-django-backend.com`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-access-token>
```

### Token Lifecycle
- **Access Token**: 15 minutes expiration
- **Refresh Token**: 7 days expiration
- **Auto-refresh**: Frontend automatically refreshes tokens

## API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "display_name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "display_name": "John Doe",
    "is_instructor": false,
    "date_joined": "2024-01-15T10:30:00Z"
  }
}
```

#### Login User
```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "display_name": "John Doe",
    "is_instructor": false,
    "date_joined": "2024-01-15T10:30:00Z"
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh/
Content-Type: application/json

{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Get Current User
```http
GET /api/auth/me/
Authorization: Bearer <access-token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "display_name": "John Doe",
  "is_instructor": false,
  "date_joined": "2024-01-15T10:30:00Z"
}
```

#### Logout
```http
POST /api/auth/logout/
Authorization: Bearer <access-token>
```

**Response (200 OK):**
```json
{
  "message": "Successfully logged out"
}
```

### Portfolio Content Endpoints

#### List Projects
```http
GET /api/portfolio/projects/
```

**Query Parameters:**
- `featured` (boolean): Filter featured projects
- `limit` (integer): Limit number of results
- `page` (integer): Page number for pagination

**Response (200 OK):**
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/portfolio/projects/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "E-commerce Platform",
      "description": "Full-stack e-commerce solution with React and Django",
      "technologies": ["React", "Django", "PostgreSQL", "Stripe"],
      "github_url": "https://github.com/user/ecommerce-platform",
      "live_url": "https://ecommerce-demo.com",
      "image_url": "https://example.com/project-image.jpg",
      "featured": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Get Single Project
```http
GET /api/portfolio/projects/{id}/
```

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "E-commerce Platform",
  "description": "Full-stack e-commerce solution with React and Django",
  "long_description": "Detailed description of the project...",
  "technologies": ["React", "Django", "PostgreSQL", "Stripe"],
  "github_url": "https://github.com/user/ecommerce-platform",
  "live_url": "https://ecommerce-demo.com",
  "image_url": "https://example.com/project-image.jpg",
  "images": [
    "https://example.com/screenshot1.jpg",
    "https://example.com/screenshot2.jpg"
  ],
  "featured": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### List Thoughts
```http
GET /api/portfolio/thoughts/
```

**Query Parameters:**
- `featured` (boolean): Filter featured thoughts
- `limit` (integer): Limit number of results
- `page` (integer): Page number for pagination

**Response (200 OK):**
```json
{
  "count": 15,
  "next": "http://localhost:8000/api/portfolio/thoughts/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Building Scalable React Applications",
      "excerpt": "Key principles for building maintainable React apps...",
      "content": "Full content of the blog post...",
      "tags": ["React", "JavaScript", "Best Practices"],
      "featured": true,
      "published_at": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Get Single Thought
```http
GET /api/portfolio/thoughts/{id}/
```

#### List Work Experience
```http
GET /api/portfolio/work/
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "company": "Tech Startup Inc.",
    "position": "Senior Full Stack Developer",
    "description": "Led development of core platform features...",
    "technologies": ["React", "Django", "AWS", "Docker"],
    "start_date": "2023-01-15",
    "end_date": null,
    "is_current": true,
    "company_url": "https://techstartup.com",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### Learn Platform Endpoints

#### List Courses
```http
GET /api/learn/courses/
Authorization: Bearer <access-token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "React Fundamentals",
    "description": "Learn the basics of React development",
    "instructor": {
      "id": 2,
      "display_name": "Jane Instructor",
      "email": "instructor@example.com"
    },
    "is_enrolled": true,
    "lesson_count": 12,
    "assignment_count": 5,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

#### Get Course Details
```http
GET /api/learn/courses/{id}/
Authorization: Bearer <access-token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "React Fundamentals",
  "description": "Learn the basics of React development",
  "instructor": {
    "id": 2,
    "display_name": "Jane Instructor",
    "email": "instructor@example.com"
  },
  "is_enrolled": true,
  "lessons": [
    {
      "id": 1,
      "title": "Introduction to React",
      "content": "Lesson content...",
      "order": 1,
      "is_completed": true
    }
  ],
  "assignments": [
    {
      "id": 1,
      "title": "Build a Todo App",
      "description": "Create a simple todo application...",
      "due_date": "2024-02-01T23:59:59Z",
      "has_submitted": true
    }
  ],
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Enroll in Course
```http
POST /api/learn/courses/{id}/enroll/
Authorization: Bearer <access-token>
```

**Response (201 Created):**
```json
{
  "message": "Successfully enrolled in course",
  "enrollment": {
    "id": 1,
    "course": 1,
    "student": 1,
    "enrolled_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Get Lesson Details
```http
GET /api/learn/lessons/{id}/
Authorization: Bearer <access-token>
```

#### Mark Lesson Complete
```http
POST /api/learn/lessons/{id}/complete/
Authorization: Bearer <access-token>
```

#### Get Assignment Details
```http
GET /api/learn/assignments/{id}/
Authorization: Bearer <access-token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Build a Todo App",
  "description": "Create a simple todo application using React...",
  "requirements": "- Use functional components\n- Implement CRUD operations\n- Add local storage",
  "due_date": "2024-02-01T23:59:59Z",
  "course": {
    "id": 1,
    "title": "React Fundamentals"
  },
  "user_submission": {
    "id": 1,
    "github_repo_url": "https://github.com/user/todo-app",
    "live_preview_url": "https://todo-app.netlify.app",
    "notes": "Implemented all requirements plus dark mode",
    "is_public": true,
    "submitted_at": "2024-01-20T15:30:00Z"
  },
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Submit Assignment
```http
POST /api/learn/assignments/{id}/submit/
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "github_repo_url": "https://github.com/user/todo-app",
  "live_preview_url": "https://todo-app.netlify.app",
  "notes": "Implemented all requirements plus dark mode",
  "is_public": true
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "assignment": 1,
  "student": 1,
  "github_repo_url": "https://github.com/user/todo-app",
  "live_preview_url": "https://todo-app.netlify.app",
  "notes": "Implemented all requirements plus dark mode",
  "is_public": true,
  "submitted_at": "2024-01-20T15:30:00Z"
}
```

#### Get Assignment Submissions
```http
GET /api/learn/assignments/{id}/submissions/
Authorization: Bearer <access-token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "student": {
      "id": 1,
      "display_name": "John Doe"
    },
    "github_repo_url": "https://github.com/user/todo-app",
    "live_preview_url": "https://todo-app.netlify.app",
    "notes": "Implemented all requirements plus dark mode",
    "submitted_at": "2024-01-20T15:30:00Z",
    "comment_count": 3
  }
]
```

#### Add Comment to Submission
```http
POST /api/learn/submissions/{id}/comments/
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "content": "Great work! I love the dark mode implementation."
}
```

### Shop Endpoints (Future Use)

These endpoints exist in the Django backend but are not yet integrated in the frontend:

#### List Products
```http
GET /api/shop/products/
```

#### Get User Cart
```http
GET /api/shop/cart/
Authorization: Bearer <access-token>
```

#### Add to Cart
```http
POST /api/shop/cart/add/
Authorization: Bearer <access-token>
```

#### Create Order
```http
POST /api/shop/orders/
Authorization: Bearer <access-token>
```

## Error Handling

### Error Response Format

All API errors follow Django REST framework format:

```json
{
  "field_name": ["This field is required."],
  "non_field_errors": ["Invalid credentials."]
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Validation errors or malformed request
- **401 Unauthorized**: Authentication required or token invalid
- **403 Forbidden**: Permission denied
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Authentication Errors

```json
{
  "detail": "Authentication credentials were not provided."
}
```

```json
{
  "detail": "Given token not valid for any token type"
}
```

### Validation Errors

```json
{
  "email": ["This field is required."],
  "password": ["This password is too short. It must contain at least 8 characters."]
}
```

## Pagination

List endpoints use Django REST framework pagination:

```json
{
  "count": 25,
  "next": "http://localhost:8000/api/portfolio/projects/?page=2",
  "previous": null,
  "results": [...]
}
```

## CORS Configuration

The Django backend is configured to accept requests from:
- `http://localhost:5173` (development frontend)
- `http://127.0.0.1:5173` (alternative development URL)
- Production frontend domain (configured via environment variables)

## Rate Limiting

Currently no rate limiting is implemented, but it can be added using Django REST framework throttling.

## Admin Interface

Access the Django admin interface at:
- **URL**: `http://localhost:8000/admin`
- **Features**: 
  - Manage users, projects, thoughts, work experience
  - Create and manage courses, lessons, assignments
  - View submissions and comments
  - Configure shop products (when ready)

## Development Tools

### Browsable API
Visit `http://localhost:8000/api/` for an interactive API browser where you can:
- Test endpoints directly
- View request/response formats
- Authenticate and test protected endpoints

### Django Shell
Access Django shell for debugging:
```bash
cd backend-django
python manage.py shell
```

### Database Management
```bash
# View database schema
python manage.py dbshell

# Create migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

## Security Considerations

1. **JWT Tokens**: Short-lived access tokens with refresh mechanism
2. **CORS**: Properly configured for frontend domains only
3. **HTTPS**: Use HTTPS in production
4. **Environment Variables**: Sensitive data stored in environment variables
5. **Django Security**: Built-in CSRF protection, SQL injection prevention
6. **Input Validation**: All inputs validated through Django serializers

## Performance Optimization

1. **Database Queries**: Optimized with select_related and prefetch_related
2. **Pagination**: Large datasets are paginated
3. **Caching**: Can be implemented with Django cache framework
4. **Static Files**: Served efficiently in production
5. **Database Indexing**: Proper indexes on frequently queried fields