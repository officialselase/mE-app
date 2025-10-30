# Django Backend Setup Guide

This guide will help you set up the Django backend for the portfolio application.

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Git

## Quick Start

### 1. Navigate to Django Backend Directory

```bash
cd backend-django
```

### 2. Create Virtual Environment (Recommended)

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment Configuration

Copy the example environment file:

```bash
copy .env.example .env  # Windows
cp .env.example .env    # macOS/Linux
```

Edit `.env` file with your configuration:

```env
# Django Configuration
SECRET_KEY=your_django_secret_key_here_change_in_production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration (SQLite for development)
DATABASE_URL=sqlite:///db.sqlite3

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# JWT Configuration
JWT_SECRET_KEY=your_jwt_secret_key_here_change_in_production
```

### 5. Database Setup

```bash
# Run migrations to create database tables
python manage.py migrate

# Create a superuser account for Django admin
python manage.py createsuperuser

# Load sample data (optional)
python manage.py loaddata fixtures/sample_data.json
```

### 6. Start Development Server

```bash
python manage.py runserver
```

The Django backend will be available at:
- **API**: http://localhost:8000
- **Admin Interface**: http://localhost:8000/admin
- **Browsable API**: http://localhost:8000/api/

## Detailed Setup Instructions

### Virtual Environment Setup

Using a virtual environment is highly recommended to avoid conflicts with other Python projects:

```bash
# Create virtual environment
python -m venv portfolio_env

# Activate virtual environment
# Windows Command Prompt:
portfolio_env\Scripts\activate.bat
# Windows PowerShell:
portfolio_env\Scripts\Activate.ps1
# macOS/Linux:
source portfolio_env/bin/activate

# Verify activation (should show virtual environment path)
which python  # macOS/Linux
where python   # Windows
```

### Dependencies Installation

The `requirements.txt` file includes all necessary packages:

```txt
Django==4.2.7
djangorestframework==3.14.0
django-cors-headers==4.3.1
PyJWT==2.8.0
python-decouple==3.8
Pillow==10.1.0
```

Install with:

```bash
pip install -r requirements.txt
```

### Environment Variables Explained

#### Required Variables

- **SECRET_KEY**: Django's secret key for cryptographic signing
- **DEBUG**: Set to `True` for development, `False` for production
- **ALLOWED_HOSTS**: Comma-separated list of allowed host/domain names
- **CORS_ALLOWED_ORIGINS**: Frontend URLs allowed to make API requests

#### Optional Variables

- **DATABASE_URL**: Database connection string (defaults to SQLite)
- **JWT_SECRET_KEY**: Secret key for JWT token signing
- **EMAIL_***: Email configuration for future features
- **STRIPE_***: Payment processing configuration

### Database Configuration

#### Development (SQLite)
The default configuration uses SQLite, which requires no additional setup:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

#### Production (PostgreSQL)
For production, use PostgreSQL:

```bash
# Install PostgreSQL adapter
pip install psycopg2-binary

# Set DATABASE_URL in .env
DATABASE_URL=postgres://username:password@host:port/database_name
```

### Sample Data Loading

The `fixtures/sample_data.json` file contains:
- Sample projects
- Sample thoughts/blog posts
- Sample work experience
- Sample courses and lessons
- Test user accounts

Load with:

```bash
python manage.py loaddata fixtures/sample_data.json
```

## Django Admin Setup

### Creating Superuser

```bash
python manage.py createsuperuser
```

You'll be prompted for:
- Email address (used as username)
- Display name
- Password

### Admin Interface Features

Access at http://localhost:8000/admin

**Available Models:**
- **Users**: Manage user accounts and permissions
- **Projects**: Add/edit portfolio projects
- **Thoughts**: Manage blog posts/thoughts
- **Work Experience**: Update work history
- **Courses**: Create and manage courses
- **Lessons**: Add lessons to courses
- **Assignments**: Create assignments for courses
- **Submissions**: View student submissions
- **Products**: Manage shop products (future use)

## API Testing

### Using Django's Browsable API

Visit http://localhost:8000/api/ to access the interactive API browser:

1. **Authentication**: Use the login form in the top-right
2. **Endpoints**: Click on any endpoint to test it
3. **Data Format**: View request/response formats
4. **Permissions**: Test authentication requirements

### Using curl

```bash
# Register a new user
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "display_name": "Test User"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'

# Get projects (no authentication required)
curl http://localhost:8000/api/portfolio/projects/

# Get courses (authentication required)
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:8000/api/learn/courses/
```

## Development Workflow

### Making Model Changes

1. **Edit Models**: Modify models in `models.py` files
2. **Create Migrations**: `python manage.py makemigrations`
3. **Apply Migrations**: `python manage.py migrate`
4. **Update Admin**: Register new models in `admin.py`

### Adding New API Endpoints

1. **Create Serializers**: Define data serialization in `serializers.py`
2. **Create Views**: Implement API logic in `views.py`
3. **Add URLs**: Register endpoints in `urls.py`
4. **Test**: Use browsable API or curl to test

### Running Tests

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test authentication
python manage.py test portfolio
python manage.py test learn
python manage.py test shop

# Run with verbose output
python manage.py test --verbosity=2
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process using port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9
```

#### Migration Issues
```bash
# Reset migrations (development only)
python manage.py migrate --fake-initial

# Or delete database and start fresh
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

#### CORS Issues
Ensure `CORS_ALLOWED_ORIGINS` in settings includes your frontend URL:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

#### Static Files Issues (Production)
```bash
# Collect static files
python manage.py collectstatic --noinput

# Ensure STATIC_ROOT is configured in settings
```

### Debug Mode

Enable detailed error messages by setting `DEBUG=True` in `.env`:

```env
DEBUG=True
```

**Warning**: Never use `DEBUG=True` in production!

### Logging

Django logs are configured to show in the console during development. For production, configure proper logging in `settings.py`.

## Production Deployment

### Environment Variables for Production

```env
SECRET_KEY=your_very_secure_secret_key_here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
DATABASE_URL=postgres://user:pass@host:port/dbname
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Security Checklist

- [ ] Set `DEBUG=False`
- [ ] Use strong `SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Use HTTPS in production
- [ ] Set up proper database (PostgreSQL)
- [ ] Configure static file serving
- [ ] Set up error monitoring (Sentry)
- [ ] Enable security middleware
- [ ] Configure CORS properly

### Deployment Steps

1. **Prepare Environment**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Database**:
   ```bash
   python manage.py migrate
   ```

3. **Collect Static Files**:
   ```bash
   python manage.py collectstatic --noinput
   ```

4. **Create Superuser**:
   ```bash
   python manage.py createsuperuser
   ```

5. **Start Server**:
   ```bash
   gunicorn portfolio_backend.wsgi:application
   ```

## Additional Resources

- **Django Documentation**: https://docs.djangoproject.com/
- **Django REST Framework**: https://www.django-rest-framework.org/
- **Django CORS Headers**: https://github.com/adamchainz/django-cors-headers
- **PyJWT Documentation**: https://pyjwt.readthedocs.io/

## Support

If you encounter issues:

1. Check the Django server logs in the terminal
2. Verify environment variables are set correctly
3. Ensure the database is properly migrated
4. Check CORS configuration for frontend integration
5. Use Django's browsable API for testing endpoints