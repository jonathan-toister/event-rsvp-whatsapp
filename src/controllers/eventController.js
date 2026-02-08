const eventService = require('../services/eventService');
const whatsappService = require('../services/whatsappService');
const rsvpService = require('../services/rsvpService');
const logger = require('../utils/logger');

/**
 * Event Controller
 * Handles HTTP requests for event management
 */
class EventController {
  /**
   * Create a new event
   * POST /api/v1/events
   */
  async createEvent(req, res) {
    try {
      const eventData = req.body;
      const event = eventService.createEvent(eventData);

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: event,
      });
    } catch (error) {
      logger.error('Error in createEvent controller:', error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get all events
   * GET /api/v1/events
   */
  async getAllEvents(req, res) {
    try {
      const events = eventService.getAllEvents();

      res.status(200).json({
        success: true,
        count: events.length,
        data: events,
      });
    } catch (error) {
      logger.error('Error in getAllEvents controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving events',
      });
    }
  }

  /**
   * Get event by ID
   * GET /api/v1/events/:id
   */
  async getEvent(req, res) {
    try {
      const { id } = req.params;
      const event = eventService.getEvent(id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      res.status(200).json({
        success: true,
        data: event,
      });
    } catch (error) {
      logger.error('Error in getEvent controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving event',
      });
    }
  }

  /**
   * Send event invitations via WhatsApp
   * POST /api/v1/events/:id/send
   */
  async sendInvitations(req, res) {
    try {
      const { id } = req.params;
      const event = eventService.getEvent(id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      // Check if WhatsApp is ready
      if (!whatsappService.isClientReady()) {
        return res.status(503).json({
          success: false,
          message: 'WhatsApp client is not ready. Please try again later.',
        });
      }

      // Create RSVP records for invitees
      rsvpService.createRSVPsForEvent(event.id, event.invitees);

      // Send invitations
      const invitationMessage = event.toWhatsAppMessage();
      const results = await whatsappService.sendBulkInvitations(
        event.invitees,
        invitationMessage
      );

      // Mark event as sent
      eventService.markEventAsSent(event.id);

      // Count successes and failures
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      res.status(200).json({
        success: true,
        message: 'Invitations sent',
        data: {
          total: results.length,
          successful: successCount,
          failed: failureCount,
          results,
        },
      });
    } catch (error) {
      logger.error('Error in sendInvitations controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error sending invitations',
        error: error.message,
      });
    }
  }

  /**
   * Get RSVPs for an event
   * GET /api/v1/events/:id/rsvps
   */
  async getEventRSVPs(req, res) {
    try {
      const { id } = req.params;
      const event = eventService.getEvent(id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      const stats = rsvpService.getRSVPStats(id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error in getEventRSVPs controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving RSVPs',
      });
    }
  }

  /**
   * Update event
   * PUT /api/v1/events/:id
   */
  async updateEvent(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const event = eventService.updateEvent(id, updates);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: event,
      });
    } catch (error) {
      logger.error('Error in updateEvent controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating event',
      });
    }
  }

  /**
   * Delete event
   * DELETE /api/v1/events/:id
   */
  async deleteEvent(req, res) {
    try {
      const { id } = req.params;
      const deleted = eventService.deleteEvent(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Event deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteEvent controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting event',
      });
    }
  }
}

module.exports = new EventController();
