# Portfolio Enhancement Project

A world-class portfolio website built with React, featuring authentication, content management, e-commerce capabilities, and a learning platform. This project demonstrates professional-grade development practices with performance optimization, accessibility compliance, and modern UI/UX design.

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
- **Runtime**: Node.js with Express.js
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT with refresh tokens
- **Password Hashing**: bcrypt
- **File Uploads**: Multer
- **Payment Processing**: Stripe (ready for activation)

## 📋 Prerequisites

- Node.js 18+ and npm
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

# Install backend dependencies
cd backend
npm install
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

# Required: Backend API URL
VITE_API_URL=http://localhost:5000

# Optional: Analytics and monitoring
# VITE_GA_ID=G-XXXXXXXXXX
# VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

#### Backend Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_PATH=./data/portfolio.db

# JWT Configuration (CHANGE IN PRODUCTION!)
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_change_in_production

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Optional: Email service (for future features)
# EMAIL_SERVICE=sendgrid
# EMAIL_API_KEY=your_email_api_key_here

# Optional: Stripe (for e-commerce when activated)
# STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
# STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 4. Database Setup

```bash
cd backend
npm run setup
cd ..
```

This will:
- Create the SQLite database
- Run all migrations
- Seed the database with sample content

## 🚀 Development

### Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

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

#### Backend Scripts
```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run setup        # Initialize database and run migrations
npm run migrate      # Run database migrations
npm run seed         # Seed database with sample data
npm test             # Run tests
```

## 🌍 Environment-Specific Configuration

### Development Environment
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Database: SQLite (./backend/data/portfolio.db)
- Hot module replacement enabled
- Detailed error messages
- Development tools enabled

### Staging Environment
```env
NODE_ENV=staging
VITE_API_URL=https://your-staging-api.com
# Use staging database and API keys
```

### Production Environment
```env
NODE_ENV=production
VITE_API_URL=https://your-production-api.com
# Use production database and API keys
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

After running the seed script, you can use these test accounts:

```
Student Account:
Email: student@example.com
Password: password123

Instructor Account:
Email: instructor@example.com
Password: password123
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Content Endpoints
- `GET /api/projects` - Get all projects
- `GET /api/thoughts` - Get all thoughts/blog posts
- `GET /api/work` - Get work experience

### Learn Platform Endpoints
- `GET /api/courses` - Get available courses
- `POST /api/courses/:id/enroll` - Enroll in course
- `GET /api/assignments/:id` - Get assignment details
- `POST /api/assignments/:id/submit` - Submit assignment

For complete API documentation, see `backend/docs/`.

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

# Run backend tests
cd backend
npm test

# Run accessibility tests
npm run test:a11y

# Run performance audits
npm run audit:performance
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
VITE_API_URL=https://your-backend-api.com
```

3. Deploy the `dist` folder

### Backend Deployment (Railway/Render/Heroku)

1. Set environment variables in your hosting platform
2. Ensure database is configured (PostgreSQL for production)
3. Run migrations: `npm run migrate`
4. Deploy the backend folder

## 🔍 Troubleshooting

### Common Issues

**Port conflicts:**
- Backend default port: 5000
- Frontend default port: 5173
- Change ports in `.env` files if needed

**Database issues:**
```bash
cd backend
rm -rf data/portfolio.db
npm run setup
```

**Authentication issues:**
- Check JWT secrets are set in backend `.env`
- Verify CORS configuration matches frontend URL
- Clear browser localStorage and cookies

**API connection issues:**
- Verify `VITE_API_URL` matches backend server
- Check backend server is running
- Verify CORS settings

### Getting Help

1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure both frontend and backend servers are running
4. Check the API documentation in `backend/docs/`

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
