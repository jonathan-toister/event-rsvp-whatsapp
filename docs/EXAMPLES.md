# Usage Examples

This document provides practical examples of using the Event RSVP WhatsApp application.

## Table of Contents
1. [Basic Event Flow](#basic-event-flow)
2. [Advanced Examples](#advanced-examples)
3. [Testing Locally](#testing-locally)
4. [Sample API Requests](#sample-api-requests)

---

## Basic Event Flow

### Example 1: Simple Event Invitation

Let's create and send a simple birthday party invitation.

#### Step 1: Create the Event
```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Birthday Party! 🎂",
    "description": "Join us for cake, games, and fun!",
    "date": "2026-03-20",
    "time": "18:00",
    "location": "123 Main Street, New York",
    "invitees": ["1234567890", "9876543210", "5555555555"],
    "createdBy": "John Doe"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": "event_1234567890_abc123",
    "title": "Birthday Party! 🎂",
    "description": "Join us for cake, games, and fun!",
    "date": "2026-03-20",
    "time": "18:00",
    "location": "123 Main Street, New York",
    "createdBy": "John Doe",
    "invitees": ["1234567890", "9876543210", "5555555555"],
    "status": "draft"
  }
}
```

#### Step 2: Send Invitations
```bash
curl -X POST http://localhost:3000/api/v1/events/event_1234567890_abc123/send
```

**Response:**
```json
{
  "success": true,
  "message": "Invitations sent",
  "data": {
    "total": 3,
    "successful": 3,
    "failed": 0,
    "results": [
      { "phoneNumber": "1234567890", "success": true, "messageId": "msg_001" },
      { "phoneNumber": "9876543210", "success": true, "messageId": "msg_002" },
      { "phoneNumber": "5555555555", "success": true, "messageId": "msg_003" }
    ]
  }
}
```

#### Step 3: Users Respond via WhatsApp
Users receive a message like:
```
🎉 Event Invitation 🎉

Birthday Party! 🎂

📝 Join us for cake, games, and fun!

📅 Date: 2026-03-20
🕐 Time: 18:00
📍 Location: 123 Main Street, New York

Please reply with:
✅ "Accept" or "Yes" to confirm your attendance
❌ "Decline" or "No" if you cannot attend

We look forward to seeing you there!
```

Users can reply with:
- "Yes" or "Accept" → Automatically marked as accepted
- "No" or "Decline" → Automatically marked as declined

#### Step 4: Check RSVPs
```bash
curl http://localhost:3000/api/v1/events/event_1234567890_abc123/rsvps
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 3,
    "accepted": 2,
    "declined": 1,
    "pending": 0,
    "acceptedList": [
      {
        "phoneNumber": "1234567890",
        "contactName": "John Smith",
        "respondedAt": "2026-02-08T23:00:00.000Z"
      },
      {
        "phoneNumber": "9876543210",
        "contactName": "Jane Doe",
        "respondedAt": "2026-02-08T23:15:00.000Z"
      }
    ],
    "declinedList": [
      {
        "phoneNumber": "5555555555",
        "contactName": "Bob Johnson",
        "respondedAt": "2026-02-08T23:30:00.000Z"
      }
    ],
    "pendingList": []
  }
}
```

---

## Advanced Examples

### Example 2: Company Meeting

```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Q1 Strategy Meeting",
    "description": "Quarterly review and planning session. Please bring your laptops and quarterly reports.",
    "date": "2026-03-10",
    "time": "09:00",
    "location": "Conference Room A, 5th Floor",
    "invitees": [
      "1111111111",
      "2222222222",
      "3333333333",
      "4444444444",
      "5555555555"
    ],
    "createdBy": "Sarah Manager"
  }'
```

### Example 3: Wedding Invitation

```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Wedding Celebration 💍",
    "description": "We are getting married! Join us for our special day filled with love, laughter, and celebration.",
    "date": "2026-06-15",
    "time": "16:00",
    "location": "Garden Wedding Venue, 456 Oak Avenue",
    "invitees": ["1234567890", "9876543210"],
    "createdBy": "Alex & Jamie"
  }'
```

### Example 4: Virtual Event

```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Online Workshop: Node.js Best Practices",
    "description": "Learn advanced Node.js patterns and techniques. Zoom link will be sent on the day of the event.",
    "date": "2026-03-25",
    "time": "15:00",
    "location": "Virtual (Zoom)",
    "invitees": ["1234567890", "9876543210", "5555555555"]
  }'
```

---

## Testing Locally

### Complete Test Scenario

Here's a complete scenario you can run to test all features:

#### 1. Create a Test Event
```bash
EVENT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "description": "Testing the system",
    "date": "2026-03-30",
    "time": "12:00",
    "location": "Test Location",
    "invitees": ["YOUR_PHONE_NUMBER"]
  }')

EVENT_ID=$(echo $EVENT_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Created event with ID: $EVENT_ID"
```

#### 2. View All Events
```bash
curl http://localhost:3000/api/v1/events
```

#### 3. View Specific Event
```bash
curl http://localhost:3000/api/v1/events/$EVENT_ID
```

#### 4. Send Invitations
```bash
curl -X POST http://localhost:3000/api/v1/events/$EVENT_ID/send
```

#### 5. Reply on WhatsApp
Open WhatsApp and reply to the invitation message with "Accept" or "Decline"

#### 6. Check RSVP Status
```bash
curl http://localhost:3000/api/v1/events/$EVENT_ID/rsvps
```

#### 7. Update Event (Optional)
```bash
curl -X PUT http://localhost:3000/api/v1/events/$EVENT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Test Event"
  }'
```

#### 8. Get Statistics
```bash
curl http://localhost:3000/api/v1/webhook/stats
```

---

## Sample API Requests

### Using JavaScript (fetch)

```javascript
// Create Event
const createEvent = async () => {
  const response = await fetch('http://localhost:3000/api/v1/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'JavaScript Event',
      description: 'Created from JavaScript',
      date: '2026-04-01',
      time: '14:00',
      location: 'JavaScript City',
      invitees: ['1234567890'],
    }),
  });
  
  const data = await response.json();
  console.log('Event created:', data);
  return data.data.id;
};

// Send Invitations
const sendInvitations = async (eventId) => {
  const response = await fetch(
    `http://localhost:3000/api/v1/events/${eventId}/send`,
    { method: 'POST' }
  );
  
  const data = await response.json();
  console.log('Invitations sent:', data);
};

// Get RSVPs
const getRSVPs = async (eventId) => {
  const response = await fetch(
    `http://localhost:3000/api/v1/events/${eventId}/rsvps`
  );
  
  const data = await response.json();
  console.log('RSVPs:', data);
};

// Usage
(async () => {
  const eventId = await createEvent();
  await sendInvitations(eventId);
  
  // Wait for responses, then check
  setTimeout(async () => {
    await getRSVPs(eventId);
  }, 60000); // Check after 1 minute
})();
```

### Using Python (requests)

```python
import requests
import json
import time

BASE_URL = 'http://localhost:3000/api/v1'

# Create Event
def create_event():
    event_data = {
        'title': 'Python Event',
        'description': 'Created from Python',
        'date': '2026-04-05',
        'time': '15:00',
        'location': 'Python Town',
        'invitees': ['1234567890']
    }
    
    response = requests.post(
        f'{BASE_URL}/events',
        headers={'Content-Type': 'application/json'},
        data=json.dumps(event_data)
    )
    
    data = response.json()
    print(f"Event created: {data}")
    return data['data']['id']

# Send Invitations
def send_invitations(event_id):
    response = requests.post(f'{BASE_URL}/events/{event_id}/send')
    data = response.json()
    print(f"Invitations sent: {data}")

# Get RSVPs
def get_rsvps(event_id):
    response = requests.get(f'{BASE_URL}/events/{event_id}/rsvps')
    data = response.json()
    print(f"RSVPs: {data}")

# Usage
if __name__ == '__main__':
    event_id = create_event()
    send_invitations(event_id)
    
    # Wait for responses, then check
    time.sleep(60)
    get_rsvps(event_id)
```

---

## Response Patterns

### Accepted Responses
The system recognizes these as "accepted":
- "accept", "accepted", "accepting"
- "yes", "yeah", "yep", "yup"
- "sure", "surely"
- "ok", "okay"
- "confirm", "confirmed"
- "attending", "will attend", "I'll be there", "I'll come"
- "count me in"
- ✅ (checkmark emoji)
- 👍 (thumbs up emoji)

### Declined Responses
The system recognizes these as "declined":
- "decline", "declined"
- "no", "nope", "nah"
- "sorry", "apologies"
- "cannot", "can't", "cant"
- "unable"
- "not attending", "won't attend", "won't be there"
- "can't make it"
- "count me out"
- ❌ (cross mark emoji)
- 👎 (thumbs down emoji)

---

## Monitoring and Analytics

### Get Overall Statistics
```bash
curl http://localhost:3000/api/v1/webhook/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "events": 5,
    "rsvps": {
      "total": 25,
      "accepted": 15,
      "declined": 5,
      "pending": 5
    },
    "whatsappStatus": "ready"
  }
}
```

### Check System Health
```bash
curl http://localhost:3000/api/v1/health
curl http://localhost:3000/api/v1/webhook/health
```

---

## Tips and Best Practices

1. **Phone Number Format**: Always use international format without special characters
   - ✅ "1234567890" or "911234567890"
   - ❌ "+1-234-567-890" or "(123) 456-7890"

2. **Rate Limiting**: The system adds a 2-second delay between bulk messages to avoid rate limiting

3. **Testing**: Use your own phone number for testing before sending to real invitees

4. **Message Timing**: Send invitations at appropriate times (avoid late night/early morning)

5. **Clear Instructions**: The default invitation message includes clear accept/decline instructions

6. **Follow Up**: Check RSVPs regularly and send reminders if needed

7. **Event Updates**: If event details change, create a new event rather than updating sent ones

---

## Troubleshooting Examples

### Check if WhatsApp is Ready
```bash
curl http://localhost:3000/api/v1/webhook/health | jq '.whatsappStatus'
```

### View All Events
```bash
curl http://localhost:3000/api/v1/events | jq '.data'
```

### Find Events with Pending RSVPs
```bash
curl http://localhost:3000/api/v1/events | jq '.data[] | select(.status == "sent")'
```

---

## Next Steps

- Explore the full API documentation in `docs/API.md`
- Learn about the architecture in `docs/ARCHITECTURE.md`
- Check the getting started guide in `docs/GETTING_STARTED.md`
- Customize invitation messages in `src/models/Event.js`
- Add new response patterns in `src/controllers/webhookController.js`