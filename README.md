# Event RSVP WhatsApp

A Node.js backend application (POC) that uses WhatsApp Web to send event invitations and manage RSVP responses through WhatsApp messages.

## 📋 Overview

This application provides a REST API to create events, send invitations via WhatsApp, and automatically process RSVP responses from invitees. It uses the `whatsapp-web.js` library to integrate with WhatsApp Web.

## 🚀 Features

- **Event Management**: Create, update, and delete events via REST API
- **WhatsApp Integration**: Send event invitations through WhatsApp Web
- **Automated RSVP Processing**: Automatically detects and processes accept/decline responses
- **Real-time Status**: Track RSVP statistics for each event
- **Bulk Invitations**: Send invitations to multiple recipients
- **Smart Message Parsing**: Understands various response formats (yes, no, accept, decline, etc.)

## 🏗️ Architecture

```
src/
├── config/           # Configuration management
│   └── index.js      # Application configuration
├── controllers/      # Request handlers
│   ├── eventController.js
│   └── webhookController.js
├── middleware/       # Express middleware
│   ├── errorHandler.js
│   └── requestLogger.js
├── models/          # Data models
│   ├── Event.js
│   └── RSVP.js
├── routes/          # API route definitions
│   ├── index.js
│   ├── eventRoutes.js
│   └── webhookRoutes.js
├── services/        # Business logic
│   ├── eventService.js
│   ├── rsvpService.js
│   └── whatsappService.js
├── utils/           # Utility functions
│   └── logger.js
├── app.js           # Express app setup
└── server.js        # Application entry point
```

## 📦 Prerequisites

- Node.js >= 18.20.8
- npm or yarn
- A phone with WhatsApp installed for authentication

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/jonathan-toister/event-rsvp-whatsapp.git
cd event-rsvp-whatsapp
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

4. Edit `.env` file with your configuration:
```env
PORT=3000
NODE_ENV=development
WHATSAPP_SESSION_NAME=event-rsvp-session
```

## 🚀 Running the Application

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

### First Time Setup:
When you run the application for the first time, you'll need to authenticate with WhatsApp:

1. Start the application
2. A QR code will appear in the console
3. Open WhatsApp on your phone
4. Go to Settings > Linked Devices > Link a Device
5. Scan the QR code displayed in the console
6. Once authenticated, the session is saved for future use

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Endpoints

#### 1. Health Check
```http
GET /health
```
Check if the API is running.

#### 2. Create Event
```http
POST /events
Content-Type: application/json

{
  "title": "Team Building Event",
  "description": "Join us for a fun team building activity!",
  "date": "2026-03-15",
  "time": "14:00",
  "location": "Central Park, New York",
  "invitees": ["1234567890", "9876543210"]
}
```

#### 3. Get All Events
```http
GET /events
```

#### 4. Get Event by ID
```http
GET /events/:id
```

#### 5. Update Event
```http
PUT /events/:id
Content-Type: application/json

{
  "title": "Updated Event Title"
}
```

#### 6. Delete Event
```http
DELETE /events/:id
```

#### 7. Send Invitations
```http
POST /events/:id/send
```
Sends WhatsApp invitations to all invitees.

#### 8. Get Event RSVPs
```http
GET /events/:id/rsvps
```
Get RSVP statistics and details for an event.

#### 9. Webhook Health
```http
GET /webhook/health
```
Check WhatsApp service status.

#### 10. Webhook Statistics
```http
GET /webhook/stats
```
Get overall application statistics.

## 💬 WhatsApp Message Flow

### Sending Invitations
When you send invitations via the API, each invitee receives a formatted WhatsApp message:

```
🎉 Event Invitation 🎉

Team Building Event

📝 Join us for a fun team building activity!

📅 Date: 2026-03-15
🕐 Time: 14:00
📍 Location: Central Park, New York

Please reply with:
✅ "Accept" or "Yes" to confirm your attendance
❌ "Decline" or "No" if you cannot attend

We look forward to seeing you there!
```

### User Responses
Users can respond with various phrases that are automatically detected:

**Accept responses:**
- "accept", "yes", "sure", "ok", "confirm", "attending"
- "I'll be there", "count me in"
- ✅ or 👍

**Decline responses:**
- "decline", "no", "sorry", "cannot", "can't"
- "not attending", "won't attend", "can't make it"
- ❌ or 👎

### Confirmation Messages
After processing a response, the system sends a confirmation:

**For acceptance:**
```
✅ Thank you for confirming!

We're excited to see you at:
Team Building Event
📅 2026-03-15 at 14:00
📍 Central Park, New York

See you there! 🎉
```

**For decline:**
```
Thank you for letting us know.

We're sorry you can't make it to:
Team Building Event

Hope to see you at future events! 😊
```

## 📊 Data Storage

This POC uses in-memory storage for events and RSVPs. For production use, you should integrate a database like:
- PostgreSQL
- MongoDB
- MySQL

## 🔒 Security Considerations

- Never commit `.env` files or WhatsApp session data
- Use environment variables for sensitive configuration
- Implement proper authentication for API endpoints (not included in POC)
- Add rate limiting to prevent abuse
- Validate and sanitize all user inputs

## 🧪 Testing the Application

### Using cURL

Create an event:
```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "description": "A test event",
    "date": "2026-03-20",
    "time": "15:00",
    "location": "Test Location",
    "invitees": ["1234567890"]
  }'
```

Send invitations:
```bash
curl -X POST http://localhost:3000/api/v1/events/{EVENT_ID}/send
```

Check RSVPs:
```bash
curl http://localhost:3000/api/v1/events/{EVENT_ID}/rsvps
```

### Using Postman or Thunder Client
Import the API endpoints and test them interactively.

## 🐛 Troubleshooting

### WhatsApp Client Not Connecting
- Make sure you have a stable internet connection
- Try deleting the `.wwebjs_auth` directory and re-authenticating
- Check if WhatsApp Web is accessible from your browser

### QR Code Not Appearing
- Check console logs for errors
- Ensure all dependencies are installed correctly
- Verify that Puppeteer can run on your system

### Messages Not Sending
- Verify WhatsApp client is in "ready" state
- Check that phone numbers are in international format without special characters
- Review logs in `logs/combined.log`

## 📝 Logging

Logs are written to:
- Console: All log levels with colors
- `logs/error.log`: Error-level logs only
- `logs/combined.log`: All logs

## 🔄 Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- User authentication and authorization
- Web dashboard for event management
- Support for event reminders
- Multiple event organizers
- Event templates
- Analytics and reporting
- WhatsApp Business API integration
- File attachments support
- Multi-language support

## 📄 License

ISC

## 🤝 Contributing

This is a POC project. Feel free to fork and enhance it for your needs.

## 📧 Support

For issues and questions, please create an issue in the GitHub repository.
