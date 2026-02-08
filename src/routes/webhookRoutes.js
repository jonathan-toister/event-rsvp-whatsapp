const express = require('express');
const webhookController = require('../controllers/webhookController');

const router = express.Router();

/**
 * Webhook Routes
 * Base path: /api/v1/webhook
 */

// Health check
router.get('/health', (req, res) => webhookController.health(req, res));

// Get statistics
router.get('/stats', (req, res) => webhookController.getStats(req, res));

module.exports = router;
