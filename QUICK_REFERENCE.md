# Quick Reference

Quick command reference for the Event RSVP WhatsApp application.

## Installation
```bash
npm install
cp .env.example .env
npm start
```

## Basic Commands

### Start Application
```bash
npm start          # Production mode
npm run dev        # Development mode (auto-reload)
```

### Stop Application
Press `Ctrl+C` in the terminal

## API Endpoints Quick Reference

### Events
```bash
# Create event
POST /api/v1/events

# Get all events
GET /api/v1/events

# Get specific event
GET /api/v1/events/:id

# Update event
PUT /api/v1/events/:id

# Delete event
DELETE /api/v1/events/:id

# Send invitations
POST /api/v1/events/:id/send

# Get RSVPs
GET /api/v1/events/:id/rsvps
```

### System
```bash
# API health
GET /api/v1/health

# WhatsApp health
GET /api/v1/webhook/health

# Statistics
GET /api/v1/webhook/stats
```

## cURL Commands

### Create Event
```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Event Title",
    "description": "Event description",
    "date": "2026-03-20",
    "time": "14:00",
    "location": "Event Location",
    "invitees": ["1234567890"]
  }'
```

### Send Invitations
```bash
curl -X POST http://localhost:3000/api/v1/events/EVENT_ID/send
```

### Check RSVPs
```bash
curl http://localhost:3000/api/v1/events/EVENT_ID/rsvps
```

### Get Statistics
```bash
curl http://localhost:3000/api/v1/webhook/stats
```

## WhatsApp Responses

**Accept:** accept, yes, sure, ok, confirm, attending, ✅, 👍

**Decline:** decline, no, sorry, cannot, can't, won't attend, ❌, 👎

## File Locations

```
├── src/
│   ├── server.js              # Entry point
│   ├── app.js                 # Express setup
│   ├── config/                # Configuration
│   ├── models/                # Data models
│   ├── services/              # Business logic
│   ├── controllers/           # Request handlers
│   ├── routes/                # API routes
│   ├── middleware/            # Middleware
│   └── utils/                 # Utilities
├── docs/                      # Documentation
├── logs/                      # Application logs
├── .env                       # Environment config (create from .env.example)
└── package.json               # Dependencies
```

## Environment Variables

```env
PORT=3000
NODE_ENV=development
WHATSAPP_SESSION_NAME=event-rsvp-session
LOG_LEVEL=info
```

## Logs

```bash
# View all logs
tail -f logs/combined.log

# View errors only
tail -f logs/error.log
```

## Common Issues

**QR Code not appearing**: Check internet connection, restart app

**WhatsApp not ready**: Wait a few seconds after starting, verify QR scan

**Messages not sending**: Check WhatsApp status at /webhook/health

**Session expired**: Delete `.wwebjs_auth/` folder and re-authenticate

**Port in use**: Change PORT in .env or kill process on port 3000

## Phone Number Format

✅ Correct: `"1234567890"` or `"911234567890"`

❌ Incorrect: `"+1-234-567-890"` or `"(123) 456-7890"`

## Documentation

- `README.md` - Overview and features
- `docs/GETTING_STARTED.md` - Setup guide
- `docs/API.md` - Complete API reference
- `docs/ARCHITECTURE.md` - Architecture details
- `docs/EXAMPLES.md` - Usage examples

## Support

Report issues: https://github.com/jonathan-toister/event-rsvp-whatsapp/issues