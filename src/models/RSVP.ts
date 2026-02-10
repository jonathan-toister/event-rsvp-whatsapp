/**
 * RSVP Model
 * Represents a user's response to an event invitation
 */

export type RSVPResponse = 'accepted' | 'declined' | 'pending';

export interface RSVPData {
  id?: string;
  eventId: string;
  phoneNumber: string;
  contactName?: string;
  response: RSVPResponse;
  message?: string;
  respondedAt?: Date | null;
  createdAt?: Date;
}

class RSVP {
  id: string;
  eventId: string;
  phoneNumber: string;
  contactName: string;
  response: RSVPResponse;
  message: string;
  respondedAt: Date | null;
  createdAt: Date;

  constructor(data: RSVPData) {
    this.id = data.id || this.generateId();
    this.eventId = data.eventId;
    this.phoneNumber = data.phoneNumber;
    this.contactName = data.contactName || 'Unknown';
    this.response = data.response;
    this.message = data.message || '';
    this.respondedAt = data.respondedAt || null;
    this.createdAt = data.createdAt || new Date();
  }

  generateId(): string {
    return `rsvp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Mark RSVP as accepted
   */
  accept(message: string = ''): void {
    this.response = 'accepted';
    this.message = message;
    this.respondedAt = new Date();
  }

  /**
   * Mark RSVP as declined
   */
  decline(message: string = ''): void {
    this.response = 'declined';
    this.message = message;
    this.respondedAt = new Date();
  }

  /**
   * Get human-readable status
   */
  getStatus(): string {
    const statusMap: Record<RSVPResponse, string> = {
      accepted: '✅ Accepted',
      declined: '❌ Declined',
      pending: '⏳ Pending',
    };
    return statusMap[this.response] || 'Unknown';
  }
}

export default RSVP;
