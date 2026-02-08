const Event = require('../models/Event');
const logger = require('../utils/logger');

/**
 * Event Service
 * Manages event creation and storage
 */
class EventService {
  constructor() {
    // In-memory storage for POC (in production, use a database)
    this.events = new Map();
  }

  /**
   * Create a new event
   * @param {Object} eventData - Event data
   * @returns {Event} Created event
   */
  createEvent(eventData) {
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
   * @param {string} eventId - Event ID
   * @returns {Event|null} Event or null if not found
   */
  getEvent(eventId) {
    return this.events.get(eventId) || null;
  }

  /**
   * Get all events
   * @returns {Array<Event>} Array of events
   */
  getAllEvents() {
    return Array.from(this.events.values());
  }

  /**
   * Update event
   * @param {string} eventId - Event ID
   * @param {Object} updates - Updates to apply
   * @returns {Event|null} Updated event or null if not found
   */
  updateEvent(eventId, updates) {
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
   * @param {string} eventId - Event ID
   * @returns {boolean} True if deleted, false if not found
   */
  deleteEvent(eventId) {
    const deleted = this.events.delete(eventId);
    if (deleted) {
      logger.info(`Event deleted: ${eventId}`);
    }
    return deleted;
  }

  /**
   * Mark event as sent
   * @param {string} eventId - Event ID
   */
  markEventAsSent(eventId) {
    const event = this.events.get(eventId);
    if (event) {
      event.status = 'sent';
      logger.info(`Event marked as sent: ${eventId}`);
    }
  }
}

// Export singleton instance
module.exports = new EventService();
