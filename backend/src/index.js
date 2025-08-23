const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const logger = require('./config/logger');
const database = require('./config/database');
const blockchain = require('./config/blockchain');
const { errorHandler } = require('./middleware/errorHandler');

// Routes
const bikeRoutes = require('./routes/bikes');
const rideRoutes = require('./routes/rides');
const maintenanceRoutes = require('./routes/maintenance');
const oracleRoutes = require('./routes/oracle');

// Services
const BlockchainService = require('./services/blockchainService');
const IoTService = require('./services/iotService');
const EventListenerService = require('./services/eventListener');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/bikes', bikeRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/oracle', oracleRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Initialize services and start server
async function startServer() {
  try {
    // Connect to database
    await database.connect();
    logger.info('Database connected successfully');

    // Initialize blockchain connection
    await blockchain.initialize();
    logger.info('Blockchain connection established');

    // Initialize services
    const blockchainService = new BlockchainService();
    const iotService = new IoTService(io);
    const eventListener = new EventListenerService(blockchainService, iotService);

    // Make services available globally
    app.locals.blockchainService = blockchainService;
    app.locals.iotService = iotService;
    app.locals.eventListener = eventListener;

    // Start blockchain event listener
    await eventListener.start();
    logger.info('Event listener started');

    // Socket.IO connection handling
    io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);
      
      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });

      // Handle real-time bike tracking
      socket.on('track-bike', (bikeId) => {
        socket.join(`bike-${bikeId}`);
        logger.info(`Client ${socket.id} tracking bike ${bikeId}`);
      });

      socket.on('stop-tracking', (bikeId) => {
        socket.leave(`bike-${bikeId}`);
        logger.info(`Client ${socket.id} stopped tracking bike ${bikeId}`);
      });
    });

    // Start server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

startServer();