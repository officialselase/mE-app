import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import db from './config/database.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import routes
import authRoutes from './routes/authRoutes.js';
import projectsRoutes from './routes/projectsRoutes.js';
import thoughtsRoutes from './routes/thoughtsRoutes.js';
import workRoutes from './routes/workRoutes.js';
import coursesRoutes from './routes/coursesRoutes.js';
import assignmentsRoutes from './routes/assignmentsRoutes.js';
import productsRoutes from './routes/productsRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import ordersRoutes from './routes/ordersRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/thoughts', thoughtsRoutes);
app.use('/api/work', workRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
const startServer = () => {
  try {
    // Test database connection
    const result = db.prepare("SELECT datetime('now') as now").get();
    console.log('✅ Database connection verified:', result.now);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  db.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  db.close();
  process.exit(0);
});

export default app;
