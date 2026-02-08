const createApp = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const whatsappService = require('./services/whatsappService');

/**
 * Server Entry Point
 * Initializes and starts the application
 */
async function startServer() {
  try {
    logger.info(`Starting ${config.appName}...`);
    logger.info(`Environment: ${config.nodeEnv}`);

    // Create Express app
    const app = createApp();

    // Start Express server
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`API available at: http://localhost:${config.port}${config.apiPrefix}`);
    });

    // Initialize WhatsApp service
    logger.info('Initializing WhatsApp service...');
    await whatsappService.initialize();
    logger.info('WhatsApp service initialized successfully');

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      
      // Stop accepting new connections
      server.close(async () => {
        logger.info('HTTP server closed');
        
        // Destroy WhatsApp client
        await whatsappService.destroy();
        logger.info('WhatsApp client closed');
        
        logger.info('Shutdown complete');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
