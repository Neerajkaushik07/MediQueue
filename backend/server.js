import express from 'express';
import cors from 'cors';
import compression from 'compression';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import doctorRouter from './routes/doctorRoute.js';
import adminRouter from './routes/adminRoute.js';
import userRouter from './routes/userRoute.js';
import healthRouter from './routes/healthRoute.js';
import familyHealthRouter from './routes/familyHealthRoute.js';
import contentRouter from './routes/contentRoute.js';
import advancedHealthRouter from './routes/advancedHealthRoute.js';
import { setupSwagger } from './config/swagger.js';
import { securityConfig, corsOptions } from './config/security.js';
import { generalLimiter } from './middlewares/rateLimiter.js';
import { successHandler, errorHandler as requestErrorHandler } from './middlewares/requestLogger.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import logger from './config/logger.js';

// app config
const app = express();
const port = process.env.PORT || 4000;

// Connect to database
connectDB();
connectCloudinary();

// Security middlewares
app.use(securityConfig);
app.use(cors(corsOptions));

// Request logging
app.use(successHandler);
app.use(requestErrorHandler);

// Body parsing middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Rate limiting
app.use('/api', generalLimiter);

// API Documentation
setupSwagger(app);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MediQueue API is running',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// API endpoints
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);
app.use('/api/health', healthRouter);
app.use('/api/family-health', familyHealthRouter);
app.use('/api/content', contentRouter);
app.use('/api/advanced-health', advancedHealthRouter);

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(port, () => {
  logger.info(`Server started on PORT: ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`API Documentation: http://localhost:${port}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

export default app;
