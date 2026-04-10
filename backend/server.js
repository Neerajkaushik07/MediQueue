import express from 'express';
import cors from 'cors';
import compression from 'compression';
import 'dotenv/config';
import http from 'http';
import { socketInit } from './config/socket.js';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import appointmentModel from './modules/user/appointment.model.js';
import doctorModel from './modules/doctor/doctor.model.js';
import doctorRouter from './modules/doctor/doctor.routes.js';
import adminRouter from './modules/admin/admin.routes.js';
import userRouter from './modules/user/user.routes.js';
import healthRouter from './modules/health/health.routes.js';
import familyHealthRouter from './modules/family/familyHealth.routes.js';
import contentRouter from './modules/content/content.routes.js';
import advancedHealthRouter from './modules/advancedHealth/advancedHealth.routes.js';
import communityRouter from './modules/community/community.routes.js';
import chatRouter from './modules/chat/chat.routes.js';
import { setupSwagger } from './config/swagger.js';
import { securityConfig, corsOptions } from './config/security.js';
import { generalLimiter } from './middlewares/rateLimiter.js';
import { successHandler, errorHandler as requestErrorHandler } from './middlewares/requestLogger.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import logger from './config/logger.js';

// app config
const app = express();
const port = process.env.PORT || 4000;
const server = http.createServer(app);
socketInit(server);

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
app.use('/api/community', communityRouter);
app.use('/api/chat', chatRouter);

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Background Sweeper for Temporary Slot Locks
// Runs every 1 minute to delete unpaid appointments older than 10 minutes
setInterval(async () => {
  try {
    const tenMinsAgo = Date.now() - 10 * 60 * 1000;
    const expiredLocks = await appointmentModel.find({ payment: false, date: { $lt: tenMinsAgo } });
    
    if (expiredLocks.length > 0) {
      for (const appointment of expiredLocks) {
        const { _id, docId, slotDate, slotTime } = appointment;
        const docData = await doctorModel.findById(docId);
        if (docData && docData.slots_booked && docData.slots_booked[slotDate]) {
          let slots_booked = docData.slots_booked;
          slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
          await doctorModel.findByIdAndUpdate(docId, { slots_booked });
        }
        await appointmentModel.findByIdAndDelete(_id);
        logger.info(`Released expired hold for appointment ${_id}`);
      }
    }
  } catch (error) {
    logger.error('Error in lock sweeper:', error);
  }
}, 60 * 1000);

// Start server
server.listen(port, () => {
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

