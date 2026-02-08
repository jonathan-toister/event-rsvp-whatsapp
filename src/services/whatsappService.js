const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * WhatsApp Service
 * Handles all WhatsApp Web interactions using whatsapp-web.js
 */
class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.messageHandlers = [];
  }

  /**
   * Initialize WhatsApp client
   */
  async initialize() {
    try {
      logger.info('Initializing WhatsApp client...');

      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: config.whatsapp.sessionName,
          dataPath: config.whatsapp.authPath,
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
          ],
        },
      });

      // QR Code event - for initial authentication
      this.client.on('qr', (qr) => {
        logger.info('QR Code received. Please scan with WhatsApp:');
        qrcode.generate(qr, { small: true });
        console.log('\n👆 Scan the QR code above with WhatsApp to authenticate\n');
      });

      // Ready event - client is authenticated and ready
      this.client.on('ready', () => {
        logger.info('WhatsApp client is ready!');
        this.isReady = true;
      });

      // Authenticated event
      this.client.on('authenticated', () => {
        logger.info('WhatsApp client authenticated successfully');
      });

      // Authentication failure event
      this.client.on('auth_failure', (msg) => {
        logger.error('WhatsApp authentication failed:', msg);
      });

      // Disconnected event
      this.client.on('disconnected', (reason) => {
        logger.warn('WhatsApp client disconnected:', reason);
        this.isReady = false;
      });

      // Message received event
      this.client.on('message', async (message) => {
        await this.handleIncomingMessage(message);
      });

      // Initialize the client
      await this.client.initialize();

      logger.info('WhatsApp client initialization started');
    } catch (error) {
      logger.error('Error initializing WhatsApp client:', error);
      throw error;
    }
  }

  /**
   * Send a message to a phone number
   * @param {string} phoneNumber - Phone number in international format (e.g., 1234567890)
   * @param {string} message - Message text to send
   */
  async sendMessage(phoneNumber, message) {
    try {
      if (!this.isReady) {
        throw new Error('WhatsApp client is not ready');
      }

      // Format phone number (remove any special characters and add @c.us)
      const chatId = this.formatPhoneNumber(phoneNumber);
      
      logger.info(`Sending message to ${chatId}`);
      const response = await this.client.sendMessage(chatId, message);
      
      logger.info(`Message sent successfully to ${chatId}`);
      return response;
    } catch (error) {
      logger.error(`Error sending message to ${phoneNumber}:`, error);
      throw error;
    }
  }

  /**
   * Send event invitation to multiple recipients
   * @param {Array} phoneNumbers - Array of phone numbers
   * @param {string} message - Invitation message
   */
  async sendBulkInvitations(phoneNumbers, message) {
    const results = [];

    for (const phoneNumber of phoneNumbers) {
      try {
        const result = await this.sendMessage(phoneNumber, message);
        results.push({
          phoneNumber,
          success: true,
          messageId: result.id.id,
        });
        
        // Add a small delay between messages to avoid rate limiting
        await this.delay(2000);
      } catch (error) {
        results.push({
          phoneNumber,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Register a message handler
   * @param {Function} handler - Function to handle incoming messages
   */
  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  /**
   * Handle incoming WhatsApp messages
   * @param {Object} message - WhatsApp message object
   */
  async handleIncomingMessage(message) {
    try {
      logger.info(`Received message from ${message.from}: ${message.body}`);

      // Get contact information
      const contact = await message.getContact();
      
      const messageData = {
        id: message.id.id,
        from: message.from,
        phoneNumber: this.extractPhoneNumber(message.from),
        contactName: contact.pushname || contact.name || 'Unknown',
        body: message.body,
        timestamp: message.timestamp,
        isGroup: message.from.includes('@g.us'),
      };

      // Call all registered message handlers
      for (const handler of this.messageHandlers) {
        await handler(messageData);
      }
    } catch (error) {
      logger.error('Error handling incoming message:', error);
    }
  }

  /**
   * Format phone number for WhatsApp
   * @param {string} phoneNumber - Phone number
   * @returns {string} Formatted phone number with @c.us
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    return `${cleaned}@c.us`;
  }

  /**
   * Extract phone number from WhatsApp ID
   * @param {string} whatsappId - WhatsApp ID (e.g., 1234567890@c.us)
   * @returns {string} Phone number
   */
  extractPhoneNumber(whatsappId) {
    return whatsappId.replace('@c.us', '').replace('@g.us', '');
  }

  /**
   * Delay utility
   * @param {number} ms - Milliseconds to delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if client is ready
   */
  isClientReady() {
    return this.isReady;
  }

  /**
   * Destroy the WhatsApp client
   */
  async destroy() {
    if (this.client) {
      await this.client.destroy();
      this.isReady = false;
      logger.info('WhatsApp client destroyed');
    }
  }
}

// Export singleton instance
module.exports = new WhatsAppService();
