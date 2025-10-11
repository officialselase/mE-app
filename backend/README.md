# Portfolio Backend API

Backend API for the portfolio website built with Node.js, Express, and PostgreSQL.

## Setup

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create a PostgreSQL database:
```bash
createdb portfolio_db
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations (coming soon):
```bash
npm run migrate
```

### Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000` by default.

## API Endpoints

### Health Check
- `GET /health` - Check server status

### Authentication (Coming Soon)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token

### Content Management (Coming Soon)
- Projects, Thoughts, Work Experience endpoints

### Learn Platform (Coming Soon)
- Courses, Lessons, Assignments, Submissions endpoints

## Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   └── errorHandler.js      # Error handling middleware
├── routes/                  # API routes (to be added)
├── controllers/             # Route controllers (to be added)
├── models/                  # Database models (to be added)
├── utils/                   # Utility functions (to be added)
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore file
├── package.json            # Dependencies and scripts
├── README.md               # This file
└── server.js               # Main server file
```

## Environment Variables

See `.env.example` for all required environment variables.

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes per IP)
- JWT authentication (to be implemented)
- Input validation (to be implemented)
- SQL injection prevention via parameterized queries

## Error Handling

The API uses a centralized error handling system with consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

## Database

PostgreSQL is used for data persistence with connection pooling for optimal performance.

## License

ISC
