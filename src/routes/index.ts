import express, { Router, Request, Response } from 'express';
import eventRoutes from './eventRoutes';
import webhookRoutes from './webhookRoutes';

const router: Router = express.Router();

/**
 * Main API Router
 * Combines all route modules
 */

// Health check for the API
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Event routes
router.use('/events', eventRoutes);

// Webhook routes
router.use('/webhook', webhookRoutes);

export default router;
