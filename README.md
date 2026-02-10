# Event RSVP WhatsApp

A Node.js backend application that uses WhatsApp Business API to send event invitations and manage RSVP responses through WhatsApp messages.

## 📋 Overview

This application provides a REST API to create events, send invitations via WhatsApp Business API, and automatically process RSVP responses from invitees. It uses Meta's official WhatsApp Business Cloud API for reliable, scalable messaging.

## 🚀 Features

- **Event Management**: Create, update, and delete events via REST API
- **WhatsApp Business API Integration**: Send event invitations through WhatsApp
- **Webhook-based Message Handling**: Real-time message processing via Meta webhooks
- **Automated RSVP Processing**: Automatically detects and processes accept/decline responses
- **Real-time Status**: Track RSVP statistics for each event
- **Bulk Invitations**: Send invitations to multiple recipients
- **Smart Message Parsing**: Understands various response formats (yes, no, accept, decline, etc.)
- **TypeScript**: Fully typed codebase for better development experience

## 🏗️ Architecture

```
src/
├── config/           # Configuration management
│   └── index.ts      # Application configuration
├── controllers/      # Request handlers
│   ├── eventController.ts
│   └── webhookController.ts
├── middleware/       # Express middleware
│   ├── errorHandler.ts
│   └── requestLogger.ts
├── models/          # Data models
│   ├── Event.ts
│   └── RSVP.ts
├── routes/          # API route definitions
│   ├── index.ts
│   ├── eventRoutes.ts
│   └── webhookRoutes.ts
├── services/        # Business logic
│   ├── eventService.ts
│   ├── rsvpService.ts
│   └── whatsappService.ts
├── utils/           # Utility functions
│   └── logger.ts
├── app.ts           # Express app setup
└── server.ts        # Application entry point
```

## 📦 Prerequisites

- Node.js >= 18.20.8
- npm or yarn
- Meta Business Account
- WhatsApp Business API access
- Publicly accessible webhook URL (for receiving messages)

## 🔧 WhatsApp Business API Setup

### Step 1: Create a Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click "My Apps" > "Create App"
3. Select "Business" as the app type
4. Fill in app details and create the app

### Step 2: Add WhatsApp Product

1. In your app dashboard, click "Add Product"
2. Find "WhatsApp" and click "Set Up"
3. Select or create a Business Portfolio
4. Add a phone number (you can use Meta's test number or add your own)

### Step 3: Get API Credentials

1. **Access Token**: Go to WhatsApp > API Setup
   - Copy the temporary access token (valid for 24 hours)
   - For production, generate a permanent token from System Users

2. **Phone Number ID**: Found in WhatsApp > API Setup
   - Copy the "Phone number ID" (not the phone number itself)

3. **Business Account ID**: Found in WhatsApp > API Setup
   - Copy the "WhatsApp Business Account ID"

### Step 4: Configure Webhook

1. Go to WhatsApp > Configuration
2. Click "Edit" next to Webhook
3. Set Callback URL: `https://your-domain.com/api/v1/webhook`
4. Set Verify Token: (use a random secure string)
5. Subscribe to "messages" webhook field

**Note**: Your webhook URL must be:
- Publicly accessible (use ngrok for local development)
- Use HTTPS
- Return a 200 response within 20 seconds

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

4. Edit `.env` file with your WhatsApp Business API credentials:
```env
PORT=3000
NODE_ENV=development

# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
WHATSAPP_API_VERSION=v21.0

# Webhook Configuration
WEBHOOK_VERIFY_TOKEN=your_random_secure_verify_token_here

# Logging
LOG_LEVEL=info
```

5. Build the TypeScript code:
```bash
npm run build
```

## 🚀 Running the Application

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Development Mode (with file watching):
```bash
npm run dev:watch
```

### Production Mode:
```bash
npm run build
npm start
```

## 🌐 Webhook Setup for Local Development

For local development, you'll need to expose your local server to the internet for Meta to send webhooks:

### Using ngrok:

1. Install ngrok: https://ngrok.com/download

2. Start your application:
```bash
npm run dev
```

3. In a new terminal, start ngrok:
```bash
ngrok http 3000
```

4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

5. Configure webhook in Meta Developer Console:
   - Callback URL: `https://abc123.ngrok.io/api/v1/webhook`
   - Verify Token: (same as your WEBHOOK_VERIFY_TOKEN in .env)

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
**Note**: Phone numbers should be in international format without the + symbol (e.g., "1234567890" for US number)

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

#### 9. Webhook Verification (GET)
```http
GET /webhook
```
Used by Meta to verify the webhook URL.

#### 10. Webhook Receiver (POST)
```http
POST /webhook
```
Receives incoming messages from Meta.

#### 11. Webhook Health
```http
GET /webhook/health
```
Check WhatsApp service status.

#### 12. Webhook Statistics
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

- Never commit `.env` files with real credentials
- Use environment variables for all sensitive configuration
- Implement proper authentication for API endpoints (not included in POC)
- Add rate limiting to prevent abuse
- Validate and sanitize all user inputs
- Enable webhook signature verification in production (see webhookController.ts)
- Use a permanent access token for production (not temporary token)
- Regularly rotate access tokens

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

### WhatsApp API Not Connecting
- Verify your access token is valid and not expired
- Check that WHATSAPP_PHONE_NUMBER_ID is correct (it's not the phone number itself)
- Ensure you have proper permissions in Meta Business Manager
- Check logs in `logs/` directory for detailed error messages

### Webhook Not Receiving Messages
- Ensure webhook URL is publicly accessible (test with curl)
- Verify webhook is configured correctly in Meta Developer Console
- Check that WEBHOOK_VERIFY_TOKEN matches in both .env and Meta console
- Subscribe to "messages" webhook field
- Review Meta's webhook logs in the Developer Console

### Messages Not Sending
- Verify phone numbers are in correct international format (no + symbol)
- Check that you haven't exceeded rate limits
- Ensure the recipient hasn't blocked your business number
- Review error logs for specific API error messages

## 📝 Logging

Logs are written to:
- Console: All log levels with colors
- `logs/error.log`: Error-level logs only
- `logs/combined.log`: All logs

## 💰 Pricing

WhatsApp Business API pricing:
- Free tier: 1,000 service conversations per month
- After free tier: Pricing varies by country
- See: https://developers.facebook.com/docs/whatsapp/pricing

## 🔄 Migration from WhatsApp Web.js

This project now uses the official WhatsApp Business API instead of whatsapp-web.js. Key differences:

| Feature | WhatsApp Web.js (Old) | Business API (Current) |
|---------|----------------------|------------------------|
| Authentication | QR Code scanning | Access token |
| Phone Dependency | Requires phone online | No phone needed |
| Scalability | Limited | Production-ready |
| Webhooks | Event-driven (local) | HTTP webhooks |
| Cost | Free | Free tier + paid |
| Approval | None required | Meta approval required |

## 🔄 Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- User authentication and authorization
- Web dashboard for event management
- Support for event reminders
- Multiple event organizers
- Event templates
- Analytics and reporting
- Media message support (images, documents)
- Message templates for faster delivery
- Multi-language support

## 📄 License

ISC

## 🤝 Contributing

This is a POC project. Feel free to fork and enhance it for your needs.

## 📧 Support

For issues and questions, please create an issue in the GitHub repository.

## 🔗 Useful Links

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Meta for Developers](https://developers.facebook.com/)
- [WhatsApp Business API Pricing](https://developers.facebook.com/docs/whatsapp/pricing)
- [Webhook Setup Guide](https://developers.facebook.com/docs/graph-api/webhooks/getting-started)
