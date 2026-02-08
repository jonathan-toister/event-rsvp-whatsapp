const express = require('express');
const eventRoutes = require('./eventRoutes');
const webhookRoutes = require('./webhookRoutes');

const router = express.Router();

/**
 * Main API Router
 * Combines all route modules
 */

// Health check for the API
router.get('/health', (req, res) => {
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

module.exports = router;
