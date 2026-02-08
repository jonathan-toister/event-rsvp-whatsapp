/**
 * RSVP Model
 * Represents a user's response to an event invitation
 */
class RSVP {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.eventId = data.eventId;
    this.phoneNumber = data.phoneNumber;
    this.contactName = data.contactName || 'Unknown';
    this.response = data.response; // 'accepted', 'declined', 'pending'
    this.message = data.message || '';
    this.respondedAt = data.respondedAt || null;
    this.createdAt = data.createdAt || new Date();
  }

  generateId() {
    return `rsvp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Mark RSVP as accepted
   */
  accept(message = '') {
    this.response = 'accepted';
    this.message = message;
    this.respondedAt = new Date();
  }

  /**
   * Mark RSVP as declined
   */
  decline(message = '') {
    this.response = 'declined';
    this.message = message;
    this.respondedAt = new Date();
  }

  /**
   * Get human-readable status
   */
  getStatus() {
    const statusMap = {
      accepted: '✅ Accepted',
      declined: '❌ Declined',
      pending: '⏳ Pending',
    };
    return statusMap[this.response] || 'Unknown';
  }
}

module.exports = RSVP;
