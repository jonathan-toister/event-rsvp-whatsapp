/**
 * Event Model
 * Represents an event for which invitations will be sent via WhatsApp
 */

export interface EventData {
  id?: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location?: string;
  createdBy?: string;
  createdAt?: Date;
  invitees?: string[];
  status?: 'draft' | 'scheduled' | 'sent';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location?: string;
  createdBy?: string;
  createdAt: Date;
  invitees: string[];
  status: 'draft' | 'scheduled' | 'sent';

  constructor(data: EventData) {
    this.id = data.id || this.generateId();
    this.title = data.title;
    this.description = data.description;
    this.date = data.date;
    this.time = data.time;
    this.location = data.location;
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt || new Date();
    this.invitees = data.invitees || [];
    this.status = data.status || 'draft';
  }

  generateId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format event details as a WhatsApp message
   */
  toWhatsAppMessage(): string {
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
  validate(): ValidationResult {
    const errors: string[] = [];

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

export default Event;
