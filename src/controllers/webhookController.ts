import { Request, Response } from 'express';
import crypto from 'crypto';
import whatsappService, { MessageData } from '../services/whatsappService';
import rsvpService from '../services/rsvpService';
import eventService from '../services/eventService';
import logger from '../utils/logger';
import config from '../config';
import Event from '../models/Event';

/**
 * Webhook Controller
 * Handles incoming WhatsApp messages and webhooks
 */
class WebhookController {
  constructor() {
    // Register message handler with WhatsApp service
    whatsappService.onMessage(this.handleWhatsAppMessage.bind(this));
  }

  /**
   * Handle incoming WhatsApp messages
   * Processes user responses to event invitations
   */
  async handleWhatsAppMessage(messageData: MessageData): Promise<void> {
    try {
      const { phoneNumber, contactName, body, isGroup } = messageData;

      // Ignore group messages
      if (isGroup) {
        return;
      }

      logger.info(`Processing message from ${phoneNumber}: ${body}`);

      // Check if user has pending RSVPs
      const pendingRSVPs = rsvpService.getPendingRSVPsForPhone(phoneNumber);

      if (pendingRSVPs.length === 0) {
        logger.info(`No pending RSVPs found for ${phoneNumber}`);
        return;
      }

      // Parse response
      const response = this.parseRSVPResponse(body);

      if (!response) {
        logger.info(`Could not parse RSVP response from message: ${body}`);
        return;
      }

      // Update all pending RSVPs for this phone number
      for (const rsvp of pendingRSVPs) {
        rsvpService.updateRSVPResponse(
          rsvp.eventId,
          phoneNumber,
          response,
          contactName,
          body
        );

        // Send confirmation message
        const event = eventService.getEvent(rsvp.eventId);
        if (event) {
          const confirmationMessage = this.getConfirmationMessage(response, event);
          await whatsappService.sendMessage(phoneNumber, confirmationMessage);
        }
      }

      logger.info(`RSVP processed for ${phoneNumber}: ${response}`);
    } catch (error) {
      logger.error('Error handling WhatsApp message:', error);
    }
  }

  /**
   * Verify webhook endpoint (GET request from Meta)
   * GET /api/v1/webhook
   */
  async verifyWebhook(req: Request, res: Response): Promise<void> {
    try {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      logger.info('Webhook verification request received', { mode, token });

      // Check if mode and token are correct
      if (mode === 'subscribe' && token === config.whatsapp.webhookVerifyToken) {
        logger.info('Webhook verified successfully');
        res.status(200).send(challenge);
      } else {
        logger.warn('Webhook verification failed: invalid token or mode');
        res.status(403).json({
          success: false,
          message: 'Webhook verification failed',
        });
      }
    } catch (error) {
      logger.error('Error in webhook verification:', error);
      res.status(500).json({
        success: false,
        message: 'Error verifying webhook',
      });
    }
  }

  /**
   * Receive webhook messages (POST request from Meta)
   * POST /api/v1/webhook
   */
  async receiveWebhook(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Webhook message received');

      // Process the webhook data
      await whatsappService.handleIncomingWebhook(req.body);

      // Respond quickly to Meta (required within 20 seconds)
      res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Error receiving webhook:', error);
      // Still respond 200 to prevent Meta from retrying
      res.status(200).json({ success: true });
    }
  }

  /**
   * Parse RSVP response from message text
   */
  parseRSVPResponse(text: string): 'accepted' | 'declined' | null {
    const normalizedText = text.toLowerCase().trim();

    // Accept patterns
    const acceptPatterns = [
      'accept',
      'yes',
      'sure',
      'ok',
      'okay',
      'confirm',
      'confirmed',
      'attending',
      'will attend',
      "i'll be there",
      "i'll come",
      'count me in',
      '✅',
      '👍',
    ];

    // Decline patterns
    const declinePatterns = [
      'decline',
      'no',
      'nope',
      'sorry',
      'cannot',
      "can't",
      'unable',
      'not attending',
      "won't attend",
      "can't make it",
      "won't be there",
      'count me out',
      '❌',
      '👎',
    ];

    // Check for accept
    if (acceptPatterns.some(pattern => normalizedText.includes(pattern))) {
      return 'accepted';
    }

    // Check for decline
    if (declinePatterns.some(pattern => normalizedText.includes(pattern))) {
      return 'declined';
    }

    return null;
  }

  /**
   * Get confirmation message based on response
   */
  getConfirmationMessage(response: 'accepted' | 'declined', event: Event): string {
    if (response === 'accepted') {
      return `
✅ Thank you for confirming!

We're excited to see you at:
*${event.title}*
📅 ${event.date} at ${event.time}
📍 ${event.location}

See you there! 🎉
      `.trim();
    } else {
      return `
Thank you for letting us know.

We're sorry you can't make it to:
*${event.title}*

Hope to see you at future events! 😊
      `.trim();
    }
  }

  /**
   * Health check endpoint for webhooks
   * GET /api/v1/webhook/health
   */
  async health(req: Request, res: Response): Promise<void> {
    try {
      const isWhatsAppReady = whatsappService.isClientReady();

      res.status(200).json({
        success: true,
        whatsappStatus: isWhatsAppReady ? 'ready' : 'not ready',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error in webhook health check:', error);
      res.status(500).json({
        success: false,
        message: 'Health check failed',
      });
    }
  }

  /**
   * Get webhook statistics
   * GET /api/v1/webhook/stats
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      // Calculate statistics
      const allEvents = eventService.getAllEvents();
      const totalEvents = allEvents.length;

      let totalRSVPs = 0;
      let totalAccepted = 0;
      let totalDeclined = 0;
      let totalPending = 0;

      for (const event of allEvents) {
        const stats = rsvpService.getRSVPStats(event.id);
        totalRSVPs += stats.total;
        totalAccepted += stats.accepted;
        totalDeclined += stats.declined;
        totalPending += stats.pending;
      }

      res.status(200).json({
        success: true,
        data: {
          events: totalEvents,
          rsvps: {
            total: totalRSVPs,
            accepted: totalAccepted,
            declined: totalDeclined,
            pending: totalPending,
          },
          whatsappStatus: whatsappService.isClientReady() ? 'ready' : 'not ready',
        },
      });
    } catch (error) {
      logger.error('Error in webhook stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving statistics',
      });
    }
  }
}

export default new WebhookController();
