# Getting Started Guide

This guide will help you set up and run the Event RSVP WhatsApp application.

## Prerequisites

Before you begin, ensure you have:
- Node.js version 18.20.8 or higher installed
- npm (comes with Node.js)
- A smartphone with WhatsApp installed
- Stable internet connection

## Step 1: Installation

1. Clone the repository:
```bash
git clone https://github.com/jonathan-toister/event-rsvp-whatsapp.git
cd event-rsvp-whatsapp
```

2. Install dependencies:
```bash
npm install
```

## Step 2: Configuration

1. Copy the environment example file:
```bash
cp .env.example .env
```

2. (Optional) Edit the `.env` file to customize settings:
```bash
nano .env  # or use your preferred editor
```

Default configuration:
- Port: 3000
- Environment: development
- WhatsApp Session: event-rsvp-session

## Step 3: Running the Application

### First Time Setup

When running for the first time, you'll need to authenticate with WhatsApp:

```bash
npm start
```

You should see output like:
```
Starting Event RSVP WhatsApp...
Environment: development
Server running on port 3000
API available at: http://localhost:3000/api/v1
Initializing WhatsApp service...
QR Code received. Please scan with WhatsApp:
```

A QR code will be displayed in your terminal.

### Authenticating with WhatsApp

1. Open WhatsApp on your phone
2. Tap the three dots menu (⋮) or Settings
3. Select "Linked Devices"
4. Tap "Link a Device"
5. Scan the QR code displayed in your terminal
6. Wait for authentication to complete

Once authenticated, you'll see:
```
WhatsApp client authenticated successfully
WhatsApp client is ready!
```

**Note:** Your session is saved locally in `.wwebjs_auth/` directory. You won't need to scan the QR code again unless you delete this directory.

### Subsequent Runs

After the first authentication, simply run:
```bash
npm start
```

The application will use the saved session and start immediately.

### Development Mode (with auto-reload)

For development with automatic restart on file changes:
```bash
npm run dev
```

## Step 4: Verify Installation

### Check API Health

Open a new terminal and run:
```bash
curl http://localhost:3000/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-02-08T22:00:00.000Z"
}
```

### Check WhatsApp Status

```bash
curl http://localhost:3000/api/v1/webhook/health
```

Expected response:
```json
{
  "success": true,
  "whatsappStatus": "ready",
  "timestamp": "2026-02-08T22:00:00.000Z"
}
```

## Step 5: Create Your First Event

### Using cURL

```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "description": "This is a test event",
    "date": "2026-03-15",
    "time": "14:00",
    "location": "Test Location",
    "invitees": ["YOUR_PHONE_NUMBER"]
  }'
```

**Important:** Replace `YOUR_PHONE_NUMBER` with your actual phone number in international format (e.g., "1234567890" or "911234567890").

You'll receive a response with the event details including an `id` field.

### Send Invitations

Use the event `id` from the previous step:

```bash
curl -X POST http://localhost:3000/api/v1/events/EVENT_ID/send
```

Replace `EVENT_ID` with the actual ID. You should receive the invitation on WhatsApp!

## Step 6: Test RSVP Flow

1. After receiving the invitation on WhatsApp, reply with one of:
   - "Accept", "Yes", "Sure", "OK", "Confirm"
   - "Decline", "No", "Sorry", "Cannot"

2. You should receive a confirmation message

3. Check RSVP status:
```bash
curl http://localhost:3000/api/v1/events/EVENT_ID/rsvps
```

## Using Postman or Thunder Client

### Import Collection

Create a new collection with these requests:

1. **Create Event** - POST `http://localhost:3000/api/v1/events`
2. **Get All Events** - GET `http://localhost:3000/api/v1/events`
3. **Get Event** - GET `http://localhost:3000/api/v1/events/:id`
4. **Send Invitations** - POST `http://localhost:3000/api/v1/events/:id/send`
5. **Get RSVPs** - GET `http://localhost:3000/api/v1/events/:id/rsvps`

See `docs/API.md` for detailed API documentation.

## Common Issues and Solutions

### Issue: QR Code Not Appearing

**Solution:**
- Ensure you have a stable internet connection
- Check that no firewall is blocking the connection
- Try restarting the application

### Issue: "WhatsApp client is not ready"

**Solution:**
- Wait a few seconds after starting the application
- Check the console logs for errors
- Verify you've scanned the QR code successfully

### Issue: Messages Not Being Sent

**Solution:**
- Verify WhatsApp status: `GET /api/v1/webhook/health`
- Check console logs for errors
- Ensure phone numbers are in correct format (international, no special characters)
- Make sure you're not rate-limited (wait 2 seconds between messages)

### Issue: Session Expired

**Solution:**
- Delete the `.wwebjs_auth/` directory
- Restart the application
- Scan the QR code again

### Issue: Port Already in Use

**Solution:**
- Change the port in `.env` file
- Or stop the process using port 3000:
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

## Stopping the Application

To stop the application gracefully:
- Press `Ctrl+C` in the terminal

The application will:
1. Stop accepting new connections
2. Close the WhatsApp client
3. Save all data (in production with database)
4. Exit cleanly

## Next Steps

Now that you have the application running:

1. **Read the Documentation**
   - `README.md` - Project overview and features
   - `docs/API.md` - Complete API reference
   - `docs/ARCHITECTURE.md` - Application architecture

2. **Explore the API**
   - Create multiple events
   - Add multiple invitees
   - Test different RSVP responses
   - Check statistics

3. **Customize the Application**
   - Modify invitation message format in `src/models/Event.js`
   - Add new response patterns in `src/controllers/webhookController.js`
   - Customize confirmation messages

4. **Production Considerations**
   - Add database (PostgreSQL/MongoDB)
   - Implement authentication
   - Add rate limiting
   - Set up monitoring
   - Use process manager (PM2)

## Development Tips

### View Logs

Logs are saved in the `logs/` directory:
```bash
# View all logs
tail -f logs/combined.log

# View errors only
tail -f logs/error.log
```

### Environment Variables

Key environment variables you can set:

```env
# Server
PORT=3000
NODE_ENV=development

# WhatsApp
WHATSAPP_SESSION_NAME=event-rsvp-session

# Logging
LOG_LEVEL=info  # Options: error, warn, info, debug
```

### Code Structure

```
src/
├── config/       - Configuration management
├── controllers/  - Request handlers
├── middleware/   - Express middleware
├── models/       - Data models
├── routes/       - API routes
├── services/     - Business logic
└── utils/        - Utilities (logger, etc.)
```

## Support and Contributing

- Report issues on GitHub
- Check existing issues before creating new ones
- Feel free to fork and submit pull requests

## Resources

- [WhatsApp Web.js Documentation](https://wwebjs.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/)

Happy coding! 🎉