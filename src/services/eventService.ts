import Event, { EventData } from '../models/Event';
import logger from '../utils/logger';

/**
 * Event Service
 * Manages event creation and storage
 */
class EventService {
  private events: Map<string, Event>;

  constructor() {
    // In-memory storage for POC (in production, use a database)
    this.events = new Map();
  }

  /**
   * Create a new event
   */
  createEvent(eventData: EventData): Event {
    try {
      const event = new Event(eventData);

      // Validate event
      const validation = event.validate();
      if (!validation.isValid) {
        throw new Error(`Event validation failed: ${validation.errors.join(', ')}`);
      }

      // Store event
      this.events.set(event.id, event);

      logger.info(`Event created: ${event.id} - ${event.title}`);
      return event;
    } catch (error) {
      logger.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Get event by ID
   */
  getEvent(eventId: string): Event | null {
    return this.events.get(eventId) || null;
  }

  /**
   * Get all events
   */
  getAllEvents(): Event[] {
    return Array.from(this.events.values());
  }

  /**
   * Update event
   */
  updateEvent(eventId: string, updates: Partial<EventData>): Event | null {
    const event = this.events.get(eventId);
    if (!event) {
      return null;
    }

    Object.assign(event, updates);
    this.events.set(eventId, event);

    logger.info(`Event updated: ${eventId}`);
    return event;
  }

  /**
   * Delete event
   */
  deleteEvent(eventId: string): boolean {
    const deleted = this.events.delete(eventId);
    if (deleted) {
      logger.info(`Event deleted: ${eventId}`);
    }
    return deleted;
  }

  /**
   * Mark event as sent
   */
  markEventAsSent(eventId: string): void {
    const event = this.events.get(eventId);
    if (event) {
      event.status = 'sent';
      logger.info(`Event marked as sent: ${eventId}`);
    }
  }
}

// Export singleton instance
export default new EventService();
