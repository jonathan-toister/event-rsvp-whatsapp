import { Request, Response } from 'express';
import eventService from '../services/eventService';
import whatsappService from '../services/whatsappService';
import rsvpService from '../services/rsvpService';
import logger from '../utils/logger';
import { EventData } from '../models/Event';

/**
 * Event Controller
 * Handles HTTP requests for event management
 */
class EventController {
  /**
   * Create a new event
   * POST /api/v1/events
   */
  async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventData: EventData = req.body;
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
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get all events
   * GET /api/v1/events
   */
  async getAllEvents(req: Request, res: Response): Promise<void> {
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
  async getEvent(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const event = eventService.getEvent(id);

      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found',
        });
        return;
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
  async sendInvitations(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const event = eventService.getEvent(id);

      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found',
        });
        return;
      }

      // Check if WhatsApp is ready
      if (!whatsappService.isClientReady()) {
        res.status(503).json({
          success: false,
          message: 'WhatsApp client is not ready. Please try again later.',
        });
        return;
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
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get RSVPs for an event
   * GET /api/v1/events/:id/rsvps
   */
  async getEventRSVPs(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const event = eventService.getEvent(id);

      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found',
        });
        return;
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
  async updateEvent(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const updates: Partial<EventData> = req.body;

      const event = eventService.updateEvent(id, updates);

      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found',
        });
        return;
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
  async deleteEvent(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const deleted = eventService.deleteEvent(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Event not found',
        });
        return;
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

export default new EventController();
