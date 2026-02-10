import express, { Router } from 'express';
import webhookController from '../controllers/webhookController';

const router: Router = express.Router();

/**
 * Webhook Routes
 * Base path: /api/v1/webhook
 */

// Webhook verification (GET) - for Meta to verify the webhook URL
router.get('/', (req, res) => webhookController.verifyWebhook(req, res));

// Webhook receiver (POST) - for receiving messages from Meta
router.post('/', (req, res) => webhookController.receiveWebhook(req, res));

// Health check
router.get('/health', (req, res) => webhookController.health(req, res));

// Get statistics
router.get('/stats', (req, res) => webhookController.getStats(req, res));

export default router;
