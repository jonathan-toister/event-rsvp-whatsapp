const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const routes = require('./routes');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

/**
 * Express Application Setup
 */
function createApp() {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS middleware
  app.use(cors());

  // Body parser middleware
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Request logging middleware
  app.use(requestLogger);

  // Root endpoint
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: `Welcome to ${config.appName}`,
      version: '1.0.0',
      endpoints: {
        health: `${config.apiPrefix}/health`,
        events: `${config.apiPrefix}/events`,
        webhook: `${config.apiPrefix}/webhook`,
      },
    });
  });

  // API routes
  app.use(config.apiPrefix, routes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
    });
  });

  // Error handler middleware (must be last)
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
