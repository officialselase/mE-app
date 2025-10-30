# Portfolio Enhancement Project

A world-class portfolio website built with React and Django, featuring authentication, content management, e-commerce capabilities, and a learning platform. This project demonstrates professional-grade development practices with performance optimization, accessibility compliance, and modern UI/UX design powered by Django REST framework.

## 🚀 Features

- **Portfolio Showcase**: Projects, work experience, and thoughts/blog
- **Authentication System**: Secure login/register with animated UI (bear character)
- **Learning Platform**: Course enrollment, lesson tracking, assignment submissions (Odin Project style)
- **Content Management**: Dynamic content fetching from backend API
- **E-commerce Ready**: Shop infrastructure (coming soon page active)
- **AI Chat Widget**: Powered by Google Gemini API
- **Interactive Games**: Bow game, caveman game, runner game
- **Performance Optimized**: 90+ Lighthouse scores, code splitting, image optimization
- **Accessibility Compliant**: WCAG 2.1 AA standards
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.2
- **Routing**: React Router DOM 7.8.2
- **Styling**: Tailwind CSS 3.4.17
- **3D Graphics**: Three.js with React Three Fiber
- **AI Integration**: Google Gemini API
- **Icons**: Lucide React

### Backend
- **Framework**: Django 4.2.7 with Django REST Framework 3.14.0
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT with custom User model
- **Admin Interface**: Django Admin for content management
- **API Documentation**: Django REST framework browsable API
- **CORS**: Configured for frontend integration

## 📋 Prerequisites

- Node.js 18+ and npm (for frontend)
- Python 3.8+ and pip (for Django backend)
- Git
- Google Gemini API key (for chat widget)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd portfolio-enhancement
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Django backend dependencies
cd backend-django
pip install -r requirements.txt
cd ..
```

### 3. Environment Configuration

#### Frontend Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Required: Gemini AI API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Required: Django Backend API URL
VITE_DJANGO_API_URL=http://localhost:8000

# Optional: Analytics and monitoring
# VITE_GA_ID=G-XXXXXXXXXX
# VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

#### Django Backend Environment Variables

```bash
cd backend-django
cp .env.example .env
```

Edit `backend-django/.env` with your configuration:

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

# Optional: Email service (for future features)
# EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USE_TLS=True
# EMAIL_HOST_USER=your_email@gmail.com
# EMAIL_HOST_PASSWORD=your_app_password

# Optional: Stripe (for e-commerce when activated)
# STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
# STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
```

### 4. Django Database Setup

```bash
cd backend-django
python manage.py migrate
python manage.py createsuperuser
python manage.py loaddata fixtures/sample_data.json
cd ..
```

This will:
- Create the SQLite database
- Run Django migrations
- Create a superuser account for Django admin
- Load sample portfolio content

## 🚀 Development

### Start Development Servers

**Terminal 1 - Django Backend:**
```bash
cd backend-django
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Django Backend API: http://localhost:8000
- Django Admin: http://localhost:8000/admin

### Available Scripts

#### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run analyze      # Analyze bundle size (text report)
npm run analyze:visual # Generate visual bundle analysis (stats.html)
npm run analyze:open # Generate and open visual bundle analysis
```

#### Django Backend Scripts
```bash
python manage.py runserver        # Start development server
python manage.py migrate          # Run database migrations
python manage.py createsuperuser  # Create admin user
python manage.py collectstatic    # Collect static files (production)
python manage.py test             # Run Django tests
python manage.py shell            # Django shell
```

## 🌍 Environment-Specific Configuration

### Development Environment
- Frontend: http://localhost:5173
- Django Backend: http://localhost:8000
- Django Admin: http://localhost:8000/admin
- Database: SQLite (./backend-django/db.sqlite3)
- Hot module replacement enabled
- Django debug mode enabled
- Development tools enabled

### Staging Environment
```env
DEBUG=False
VITE_DJANGO_API_URL=https://your-staging-django-api.com
ALLOWED_HOSTS=your-staging-domain.com
# Use staging database and API keys
```

### Production Environment
```env
DEBUG=False
VITE_DJANGO_API_URL=https://your-production-django-api.com
ALLOWED_HOSTS=your-production-domain.com
# Use production database (PostgreSQL recommended)
# Enable error tracking and analytics
```

## 🔐 Authentication System

The application includes a custom authentication system with:

- **Registration**: Email, password, display name
- **Login**: Email and password with animated bear UI
- **Protected Routes**: `/learn` and `/projects-repo` require authentication
- **JWT Tokens**: 15-minute access tokens with 7-day refresh tokens
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: Automatic token refresh

### Test Accounts

After loading sample data, you can use these test accounts:

```
Student Account:
Email: student@example.com
Password: password123

Instructor Account:
Email: instructor@example.com
Password: password123

Admin Account:
Use the superuser account created during setup
Access Django Admin at: http://localhost:8000/admin
```

## 📚 Django API Documentation

### Authentication Endpoints
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/refresh/` - Refresh access token
- `GET /api/auth/me/` - Get current user

### Portfolio Content Endpoints
- `GET /api/portfolio/projects/` - Get all projects (with pagination)
- `GET /api/portfolio/projects/{id}/` - Get single project
- `GET /api/portfolio/thoughts/` - Get all thoughts/blog posts (with pagination)
- `GET /api/portfolio/thoughts/{id}/` - Get single thought
- `GET /api/portfolio/work/` - Get work experience

### Learn Platform Endpoints
- `GET /api/learn/courses/` - Get available courses
- `GET /api/learn/courses/{id}/` - Get course details
- `POST /api/learn/courses/{id}/enroll/` - Enroll in course
- `GET /api/learn/lessons/{id}/` - Get lesson details
- `POST /api/learn/lessons/{id}/complete/` - Mark lesson complete
- `GET /api/learn/assignments/{id}/` - Get assignment details
- `POST /api/learn/assignments/{id}/submit/` - Submit assignment
- `GET /api/learn/assignments/{id}/submissions/` - Get public submissions
- `POST /api/learn/submissions/{id}/comments/` - Add comment to submission

### Shop Endpoints (Future Use)
- `GET /api/shop/products/` - List products
- `GET /api/shop/cart/` - Get user cart
- `POST /api/shop/cart/add/` - Add to cart
- `POST /api/shop/orders/` - Create order

### API Features
- **Browsable API**: Visit http://localhost:8000/api/ for interactive documentation
- **Django Admin**: Manage content at http://localhost:8000/admin
- **Pagination**: All list endpoints support Django REST framework pagination
- **Filtering**: Support for query parameters (featured, limit, page, etc.)
- **CORS**: Configured for frontend integration

### Additional Documentation
- **[Django API Documentation](DJANGO_API_DOCUMENTATION.md)**: Complete API reference with examples
- **[Django Setup Guide](DJANGO_SETUP_GUIDE.md)**: Detailed backend setup instructions

## 🎨 UI/UX Features

### Animated Bear Login
- Bear covers eyes during password entry
- Bear looks at email field when focused
- Happy/sad expressions for success/failure states
- Respects `prefers-reduced-motion` settings

### Performance Optimizations
- Code splitting by routes
- Image lazy loading with WebP format
- Font optimization with `font-display: swap`
- Bundle analysis and monitoring
- 90+ Lighthouse performance scores

### Accessibility Features
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast ratios
- Focus indicators
- Semantic HTML structure

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run Django backend tests
cd backend-django
python manage.py test

# Run accessibility tests
npm run test:a11y

# Run performance audits
npm run audit:performance

# Run Django API tests specifically
cd backend-django
python manage.py test authentication.tests
python manage.py test portfolio.tests
python manage.py test learn.tests
python manage.py test shop.tests
```

## 📦 Deployment

### Frontend Deployment (Vercel/Netlify)

1. Build the application:
```bash
npm run build
```

2. Set environment variables in your hosting platform:
```
VITE_GEMINI_API_KEY=your_production_api_key
VITE_DJANGO_API_URL=https://your-django-backend.com
```

3. Deploy the `dist` folder

### Django Backend Deployment (Railway/Render/Heroku/DigitalOcean)

1. Set environment variables in your hosting platform:
```
SECRET_KEY=your_production_secret_key
DEBUG=False
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=postgres://user:pass@host:port/dbname
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

2. Install dependencies and run migrations:
```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

3. Deploy the `backend-django` folder

### Production Database Setup

For production, use PostgreSQL:

```bash
# Install PostgreSQL adapter
pip install psycopg2-binary

# Update DATABASE_URL in environment variables
DATABASE_URL=postgres://username:password@host:port/database_name
```

## 🔍 Troubleshooting

### Common Issues

**Port conflicts:**
- Django backend default port: 8000
- Frontend default port: 5173
- Change ports if needed: `python manage.py runserver 8001`

**Database issues:**
```bash
cd backend-django
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
python manage.py loaddata fixtures/sample_data.json
```

**Authentication issues:**
- Check JWT secrets are set in Django settings
- Verify CORS configuration matches frontend URL
- Clear browser localStorage and cookies
- Check Django admin user permissions

**API connection issues:**
- Verify `VITE_DJANGO_API_URL` matches Django server (http://localhost:8000)
- Check Django server is running: `python manage.py runserver`
- Verify CORS settings in Django settings
- Check Django `ALLOWED_HOSTS` setting

**Django-specific issues:**
- **CORS errors**: Update `CORS_ALLOWED_ORIGINS` in Django settings
- **404 on API calls**: Check Django URL patterns and trailing slashes
- **Admin access**: Ensure superuser is created and has proper permissions
- **Static files**: Run `python manage.py collectstatic` for production

### Getting Help

1. Check the browser console for error messages
2. Verify all environment variables are set
3. Ensure both frontend and Django servers are running
4. Check the Django admin interface at http://localhost:8000/admin
5. Use Django's browsable API at http://localhost:8000/api/
6. Check Django server logs for backend errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React and Vite teams for excellent developer experience
- Tailwind CSS for utility-first styling
- Three.js community for 3D graphics capabilities
- Google for Gemini AI API
- The Odin Project for learning platform inspiration
