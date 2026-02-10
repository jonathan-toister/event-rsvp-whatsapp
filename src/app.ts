import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import config from './config';
import routes from './routes';
import requestLogger from './middleware/requestLogger';
import errorHandler from './middleware/errorHandler';

/**
 * Express Application Setup
 */
function createApp(): Express {
  const app: Express = express();

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
  app.get('/', (req: Request, res: Response) => {
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
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
    });
  });

  // Error handler middleware (must be last)
  app.use(errorHandler);

  return app;
}

export default createApp;
