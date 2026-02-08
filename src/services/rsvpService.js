const RSVP = require('../models/RSVP');
const logger = require('../utils/logger');

/**
 * RSVP Service
 * Manages RSVP responses from invitees
 */
class RSVPService {
  constructor() {
    // In-memory storage for POC (in production, use a database)
    this.rsvps = new Map();
    // Index for quick lookup by event and phone number
    this.rsvpIndex = new Map(); // key: `${eventId}:${phoneNumber}`
  }

  /**
   * Create RSVP records for event invitees
   * @param {string} eventId - Event ID
   * @param {Array<string>} phoneNumbers - Array of phone numbers
   */
  createRSVPsForEvent(eventId, phoneNumbers) {
    const rsvps = [];

    for (const phoneNumber of phoneNumbers) {
      const rsvp = new RSVP({
        eventId,
        phoneNumber,
        response: 'pending',
      });

      this.rsvps.set(rsvp.id, rsvp);
      this.rsvpIndex.set(`${eventId}:${phoneNumber}`, rsvp.id);
      rsvps.push(rsvp);
    }

    logger.info(`Created ${rsvps.length} RSVP records for event ${eventId}`);
    return rsvps;
  }

  /**
   * Get RSVP by event and phone number
   * @param {string} eventId - Event ID
   * @param {string} phoneNumber - Phone number
   * @returns {RSVP|null} RSVP or null if not found
   */
  getRSVPByEventAndPhone(eventId, phoneNumber) {
    const rsvpId = this.rsvpIndex.get(`${eventId}:${phoneNumber}`);
    if (!rsvpId) {
      return null;
    }
    return this.rsvps.get(rsvpId) || null;
  }

  /**
   * Get all RSVPs for an event
   * @param {string} eventId - Event ID
   * @returns {Array<RSVP>} Array of RSVPs
   */
  getRSVPsForEvent(eventId) {
    const rsvps = [];
    for (const rsvp of this.rsvps.values()) {
      if (rsvp.eventId === eventId) {
        rsvps.push(rsvp);
      }
    }
    return rsvps;
  }

  /**
   * Update RSVP response
   * @param {string} eventId - Event ID
   * @param {string} phoneNumber - Phone number
   * @param {string} response - Response ('accepted' or 'declined')
   * @param {string} contactName - Contact name
   * @param {string} message - Optional message
   * @returns {RSVP|null} Updated RSVP or null if not found
   */
  updateRSVPResponse(eventId, phoneNumber, response, contactName, message = '') {
    const rsvp = this.getRSVPByEventAndPhone(eventId, phoneNumber);
    
    if (!rsvp) {
      logger.warn(`RSVP not found for event ${eventId} and phone ${phoneNumber}`);
      return null;
    }

    if (contactName) {
      rsvp.contactName = contactName;
    }

    if (response === 'accepted') {
      rsvp.accept(message);
    } else if (response === 'declined') {
      rsvp.decline(message);
    }

    logger.info(`RSVP updated for ${phoneNumber} on event ${eventId}: ${response}`);
    return rsvp;
  }

  /**
   * Get RSVP statistics for an event
   * @param {string} eventId - Event ID
   * @returns {Object} RSVP statistics
   */
  getRSVPStats(eventId) {
    const rsvps = this.getRSVPsForEvent(eventId);
    
    const stats = {
      total: rsvps.length,
      accepted: 0,
      declined: 0,
      pending: 0,
      acceptedList: [],
      declinedList: [],
      pendingList: [],
    };

    for (const rsvp of rsvps) {
      if (rsvp.response === 'accepted') {
        stats.accepted++;
        stats.acceptedList.push({
          phoneNumber: rsvp.phoneNumber,
          contactName: rsvp.contactName,
          respondedAt: rsvp.respondedAt,
        });
      } else if (rsvp.response === 'declined') {
        stats.declined++;
        stats.declinedList.push({
          phoneNumber: rsvp.phoneNumber,
          contactName: rsvp.contactName,
          respondedAt: rsvp.respondedAt,
        });
      } else {
        stats.pending++;
        stats.pendingList.push({
          phoneNumber: rsvp.phoneNumber,
          contactName: rsvp.contactName,
        });
      }
    }

    return stats;
  }

  /**
   * Check if phone number has pending RSVP for any event
   * @param {string} phoneNumber - Phone number
   * @returns {Array<RSVP>} Array of pending RSVPs
   */
  getPendingRSVPsForPhone(phoneNumber) {
    const pendingRSVPs = [];
    
    for (const rsvp of this.rsvps.values()) {
      if (rsvp.phoneNumber === phoneNumber && rsvp.response === 'pending') {
        pendingRSVPs.push(rsvp);
      }
    }

    return pendingRSVPs;
  }
}

// Export singleton instance
module.exports = new RSVPService();
