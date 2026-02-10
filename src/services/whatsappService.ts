import axios, { AxiosInstance } from 'axios';
import config from '../config';
import logger from '../utils/logger';

export interface MessageData {
  id: string;
  from: string;
  phoneNumber: string;
  contactName: string;
  body: string;
  timestamp: number;
  isGroup: boolean;
}

export interface SendResult {
  phoneNumber: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

type MessageHandler = (messageData: MessageData) => Promise<void>;

/**
 * WhatsApp Business API Service
 * Handles all WhatsApp interactions using Meta's Cloud API
 */
class WhatsAppService {
  private apiClient: AxiosInstance;
  private messageHandlers: MessageHandler[];
  private baseUrl: string;

  constructor() {
    this.messageHandlers = [];
    this.baseUrl = `https://graph.facebook.com/${config.whatsapp.apiVersion}`;

    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.whatsapp.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Initialize WhatsApp service
   * For Business API, this validates the configuration
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing WhatsApp Business API client...');

      // Validate configuration
      if (!config.whatsapp.accessToken) {
        throw new Error('WhatsApp access token not configured');
      }

      if (!config.whatsapp.phoneNumberId) {
        throw new Error('WhatsApp phone number ID not configured');
      }

      // Test API connection by fetching phone number details
      await this.validateConnection();

      logger.info('WhatsApp Business API client initialized successfully');
    } catch (error) {
      logger.error('Error initializing WhatsApp Business API client:', error);
      throw error;
    }
  }

  /**
   * Validate API connection
   */
  private async validateConnection(): Promise<void> {
    try {
      const response = await this.apiClient.get(
        `/${config.whatsapp.phoneNumberId}`
      );
      logger.info('WhatsApp Business API connection validated', {
        phoneNumber: response.data.display_phone_number,
        verifiedName: response.data.verified_name,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('API validation failed:', error.response?.data);
      }
      throw new Error('Failed to validate WhatsApp Business API connection');
    }
  }

  /**
   * Send a text message to a phone number
   */
  async sendMessage(phoneNumber: string, message: string): Promise<{ id: string }> {
    try {
      // Format phone number (remove any non-numeric characters)
      const formattedNumber = this.formatPhoneNumber(phoneNumber);

      logger.info(`Sending message to ${formattedNumber}`);

      const response = await this.apiClient.post(
        `/${config.whatsapp.phoneNumberId}/messages`,
        {
          "messaging_product": "whatsapp",
          "to": formattedNumber,
          "type": "template",
          "template": {
            "name": "hello_world",
            "language": {
              "code": "en_US"
            }
          },
        }
      );

      logger.info(`Message sent successfully to ${formattedNumber}`, {
        messageId: response.data.messages[0].id,
      });

      return { id: response.data.messages[0].id };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(`Error sending message to ${phoneNumber}:`, error.response?.data);
        throw new Error(error.response?.data?.error?.message || 'Failed to send message');
      }
      throw error;
    }
  }

  /**
   * Send event invitation to multiple recipients
   */
  async sendBulkInvitations(phoneNumbers: string[], message: string): Promise<SendResult[]> {
    const results: SendResult[] = [];

    for (const phoneNumber of phoneNumbers) {
      try {
        const result = await this.sendMessage(phoneNumber, message);
        results.push({
          phoneNumber,
          success: true,
          messageId: result.id,
        });

        // Add a small delay between messages to avoid rate limiting
        await this.delay(1000);
      } catch (error) {
        results.push({
          phoneNumber,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Register a message handler
   */
  onMessage(handler: MessageHandler): void {
    this.messageHandlers.push(handler);
  }

  /**
   * Handle incoming WhatsApp webhook message
   * This processes messages from Meta's webhook
   */
  async handleIncomingWebhook(webhookData: any): Promise<void> {
    try {
      // Parse Meta's webhook format
      if (!webhookData.entry || webhookData.entry.length === 0) {
        return;
      }

      for (const entry of webhookData.entry) {
        if (!entry.changes || entry.changes.length === 0) {
          continue;
        }

        for (const change of entry.changes) {
          if (change.field !== 'messages') {
            continue;
          }

          const value = change.value;

          // Process incoming messages
          if (value.messages && value.messages.length > 0) {
            for (const message of value.messages) {
              await this.processIncomingMessage(message, value.contacts);
            }
          }
        }
      }
    } catch (error) {
      logger.error('Error handling incoming webhook:', error);
    }
  }

  /**
   * Process a single incoming message
   */
  private async processIncomingMessage(message: any, contacts: any[]): Promise<void> {
    try {
      // Only process text messages
      if (message.type !== 'text') {
        logger.info(`Skipping non-text message type: ${message.type}`);
        return;
      }

      // Get contact information
      const contact = contacts?.find((c: any) => c.wa_id === message.from);
      const contactName = contact?.profile?.name || 'Unknown';

      const messageData: MessageData = {
        id: message.id,
        from: message.from,
        phoneNumber: message.from,
        contactName,
        body: message.text.body,
        timestamp: parseInt(message.timestamp, 10),
        isGroup: false, // Business API doesn't support group messages in the same way
      };

      logger.info(`Processing message from ${messageData.phoneNumber}: ${messageData.body}`);

      // Call all registered message handlers
      for (const handler of this.messageHandlers) {
        await handler(messageData);
      }

      // Mark message as read
      await this.markMessageAsRead(message.id);
    } catch (error) {
      logger.error('Error processing incoming message:', error);
    }
  }

  /**
   * Mark a message as read
   */
  private async markMessageAsRead(messageId: string): Promise<void> {
    try {
      await this.apiClient.post(
        `/${config.whatsapp.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }
      );
    } catch (error) {
      logger.error('Error marking message as read:', error);
    }
  }

  /**
   * Format phone number for WhatsApp Business API
   * Removes all non-numeric characters
   */
  private formatPhoneNumber(phoneNumber: string): string {
    return phoneNumber.replace(/\D/g, '');
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if client is ready (always true for Business API)
   */
  isClientReady(): boolean {
    return !!(config.whatsapp.accessToken && config.whatsapp.phoneNumberId);
  }

  /**
   * Cleanup (no-op for Business API)
   */
  async destroy(): Promise<void> {
    logger.info('WhatsApp Business API client cleanup complete');
  }
}

// Export singleton instance
export default new WhatsAppService();
