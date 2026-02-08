const whatsappService = require('../services/whatsappService');
const rsvpService = require('../services/rsvpService');
const eventService = require('../services/eventService');
const logger = require('../utils/logger');

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
  async handleWhatsAppMessage(messageData) {
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
   * Parse RSVP response from message text
   * @param {string} text - Message text
   * @returns {string|null} 'accepted', 'declined', or null
   */
  parseRSVPResponse(text) {
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
   * @param {string} response - Response type ('accepted' or 'declined')
   * @param {Object} event - Event object
   * @returns {string} Confirmation message
   */
  getConfirmationMessage(response, event) {
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
  async health(req, res) {
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
  async getStats(req, res) {
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

module.exports = new WebhookController();
