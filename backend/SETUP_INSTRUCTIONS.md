# Backend Setup Instructions

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Set Up PostgreSQL Database

Make sure PostgreSQL is installed and running, then create the database:

```bash
# Create database
createdb portfolio_db

# Or using psql
psql -U postgres
CREATE DATABASE portfolio_db;
\q
```

### 3. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and update these required fields:
# - DB_PASSWORD (your PostgreSQL password)
# - JWT_SECRET (generate a random string)
# - JWT_REFRESH_SECRET (generate another random string)
```

### 4. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### 5. Test the Server

Open your browser or use curl:
```bash
curl http://localhost:5000/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

## What's Been Set Up

✅ Express.js server with proper error handling
✅ PostgreSQL database connection with connection pooling  
✅ CORS configuration for frontend communication
✅ Security middleware (Helmet, Rate Limiting)
✅ Environment variable management
✅ Project structure (routes, controllers, models, utils folders)
✅ Health check endpoint
✅ Graceful shutdown handling

## Next Steps

The backend foundation is ready! Next tasks will add:
- Authentication system (JWT, bcrypt)
- Database schemas and migrations
- API endpoints for content, learn platform, shop
- File upload handling
- Email integration

## Troubleshooting

### Database Connection Issues
- Make sure PostgreSQL is running: `pg_isready`
- Check your DB_PASSWORD in .env
- Verify database exists: `psql -l`

### Port Already in Use
- Change PORT in .env to a different number (e.g., 5001)
- Or kill the process using port 5000

### Module Not Found Errors
- Run `npm install` again
- Delete node_modules and package-lock.json, then `npm install`

## Project Structure

```
backend/
├── config/
│   └── database.js          # PostgreSQL connection pool
├── middleware/
│   └── errorHandler.js      # Centralized error handling
├── routes/                  # API routes (ready for implementation)
├── controllers/             # Business logic (ready for implementation)
├── models/                  # Database models (ready for implementation)
├── utils/                   # Helper functions (ready for implementation)
├── scripts/
│   └── setup.sh            # Automated setup script
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies and scripts
├── README.md               # Main documentation
├── SETUP_INSTRUCTIONS.md   # This file
└── server.js               # Main server entry point
```
