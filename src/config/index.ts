import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  apiVersion: string;
  webhookVerifyToken: string;
}

interface LoggingConfig {
  level: string;
}

interface Config {
  port: number;
  nodeEnv: string;
  appName: string;
  apiPrefix: string;
  whatsapp: WhatsAppConfig;
  logging: LoggingConfig;
}

const config: Config = {
  // Server configuration
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Application configuration
  appName: process.env.APP_NAME || 'Event RSVP WhatsApp',
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  // WhatsApp Business API configuration
  whatsapp: {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v21.0',
    webhookVerifyToken: process.env.WEBHOOK_VERIFY_TOKEN || 'default_verify_token',
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export default config;
