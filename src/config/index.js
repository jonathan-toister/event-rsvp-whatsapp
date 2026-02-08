const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Application configuration
  appName: process.env.APP_NAME || 'Event RSVP WhatsApp',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  
  // WhatsApp configuration
  whatsapp: {
    sessionName: process.env.WHATSAPP_SESSION_NAME || 'event-rsvp-session',
    authPath: path.join(__dirname, '../../.wwebjs_auth'),
  },
  
  // Webhook configuration
  webhook: {
    verifyToken: process.env.WEBHOOK_VERIFY_TOKEN || 'default_verify_token',
    secret: process.env.WEBHOOK_SECRET || 'default_webhook_secret',
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

module.exports = config;
