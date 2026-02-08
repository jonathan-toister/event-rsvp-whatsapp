/**
 * Event Model
 * Represents an event for which invitations will be sent via WhatsApp
 */
class Event {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.title = data.title;
    this.description = data.description;
    this.date = data.date;
    this.time = data.time;
    this.location = data.location;
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt || new Date();
    this.invitees = data.invitees || []; // Array of phone numbers
    this.status = data.status || 'draft'; // draft, scheduled, sent
  }

  generateId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format event details as a WhatsApp message
   */
  toWhatsAppMessage() {
    return `
🎉 *Event Invitation* 🎉

*${this.title}*

📝 ${this.description}

📅 Date: ${this.date}
🕐 Time: ${this.time}
📍 Location: ${this.location}

Please reply with:
✅ "Accept" or "Yes" to confirm your attendance
❌ "Decline" or "No" if you cannot attend

We look forward to seeing you there!
    `.trim();
  }

  /**
   * Validate event data
   */
  validate() {
    const errors = [];
    
    if (!this.title || this.title.trim() === '') {
      errors.push('Event title is required');
    }
    
    if (!this.date) {
      errors.push('Event date is required');
    }
    
    if (!this.time) {
      errors.push('Event time is required');
    }
    
    if (!this.invitees || this.invitees.length === 0) {
      errors.push('At least one invitee is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = Event;
