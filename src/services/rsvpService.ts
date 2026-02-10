import RSVP from '../models/RSVP';
import logger from '../utils/logger';

interface RSVPContact {
  phoneNumber: string;
  contactName: string;
  respondedAt?: Date | null;
}

interface RSVPStats {
  total: number;
  accepted: number;
  declined: number;
  pending: number;
  acceptedList: RSVPContact[];
  declinedList: RSVPContact[];
  pendingList: RSVPContact[];
}

/**
 * RSVP Service
 * Manages RSVP responses from invitees
 */
class RSVPService {
  private rsvps: Map<string, RSVP>;
  private rsvpIndex: Map<string, string>;

  constructor() {
    // In-memory storage for POC (in production, use a database)
    this.rsvps = new Map();
    // Index for quick lookup by event and phone number
    this.rsvpIndex = new Map(); // key: `${eventId}:${phoneNumber}`
  }

  /**
   * Create RSVP records for event invitees
   */
  createRSVPsForEvent(eventId: string, phoneNumbers: string[]): RSVP[] {
    const rsvps: RSVP[] = [];

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
   */
  getRSVPByEventAndPhone(eventId: string, phoneNumber: string): RSVP | null {
    const rsvpId = this.rsvpIndex.get(`${eventId}:${phoneNumber}`);
    if (!rsvpId) {
      return null;
    }
    return this.rsvps.get(rsvpId) || null;
  }

  /**
   * Get all RSVPs for an event
   */
  getRSVPsForEvent(eventId: string): RSVP[] {
    const rsvps: RSVP[] = [];
    for (const rsvp of this.rsvps.values()) {
      if (rsvp.eventId === eventId) {
        rsvps.push(rsvp);
      }
    }
    return rsvps;
  }

  /**
   * Update RSVP response
   */
  updateRSVPResponse(
    eventId: string,
    phoneNumber: string,
    response: 'accepted' | 'declined',
    contactName?: string,
    message: string = ''
  ): RSVP | null {
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
   */
  getRSVPStats(eventId: string): RSVPStats {
    const rsvps = this.getRSVPsForEvent(eventId);

    const stats: RSVPStats = {
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
   */
  getPendingRSVPsForPhone(phoneNumber: string): RSVP[] {
    const pendingRSVPs: RSVP[] = [];

    for (const rsvp of this.rsvps.values()) {
      if (rsvp.phoneNumber === phoneNumber && rsvp.response === 'pending') {
        pendingRSVPs.push(rsvp);
      }
    }

    return pendingRSVPs;
  }
}

// Export singleton instance
export default new RSVPService();
