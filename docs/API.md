# API Reference

Complete API documentation for the Event RSVP WhatsApp application.

## Base URL
```
http://localhost:3000/api/v1
```

---

## Events

### Create Event
Create a new event that can be sent as invitation via WhatsApp.

**Endpoint:** `POST /events`

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "date": "string (required) - format: YYYY-MM-DD",
  "time": "string (required) - format: HH:MM",
  "location": "string (required)",
  "invitees": ["array of phone numbers (required)"],
  "createdBy": "string (optional)"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Building Workshop",
    "description": "A fun afternoon of team building activities",
    "date": "2026-04-15",
    "time": "14:00",
    "location": "Conference Room A",
    "invitees": ["1234567890", "9876543210"],
    "createdBy": "John Doe"
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": "event_1234567890_abc123",
    "title": "Team Building Workshop",
    "description": "A fun afternoon of team building activities",
    "date": "2026-04-15",
    "time": "14:00",
    "location": "Conference Room A",
    "createdBy": "John Doe",
    "createdAt": "2026-02-08T22:00:00.000Z",
    "invitees": ["1234567890", "9876543210"],
    "status": "draft"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Event validation failed: Event title is required"
}
```

---

### Get All Events
Retrieve all events in the system.

**Endpoint:** `GET /events`

**Example Request:**
```bash
curl http://localhost:3000/api/v1/events
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "event_1234567890_abc123",
      "title": "Team Building Workshop",
      "description": "A fun afternoon of team building activities",
      "date": "2026-04-15",
      "time": "14:00",
      "location": "Conference Room A",
      "status": "sent"
    },
    {
      "id": "event_9876543210_xyz789",
      "title": "Annual Company Picnic",
      "description": "Join us for food, games, and fun!",
      "date": "2026-05-20",
      "time": "12:00",
      "location": "Central Park",
      "status": "draft"
    }
  ]
}
```

---

### Get Event by ID
Retrieve a specific event by its ID.

**Endpoint:** `GET /events/:id`

**Example Request:**
```bash
curl http://localhost:3000/api/v1/events/event_1234567890_abc123
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "event_1234567890_abc123",
    "title": "Team Building Workshop",
    "description": "A fun afternoon of team building activities",
    "date": "2026-04-15",
    "time": "14:00",
    "location": "Conference Room A",
    "createdBy": "John Doe",
    "createdAt": "2026-02-08T22:00:00.000Z",
    "invitees": ["1234567890", "9876543210"],
    "status": "draft"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Event not found"
}
```

---

### Update Event
Update an existing event.

**Endpoint:** `PUT /events/:id`

**Request Body:**
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "date": "string (optional)",
  "time": "string (optional)",
  "location": "string (optional)"
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:3000/api/v1/events/event_1234567890_abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Team Building Workshop",
    "time": "15:00"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Event updated successfully",
  "data": {
    "id": "event_1234567890_abc123",
    "title": "Updated Team Building Workshop",
    "time": "15:00",
    ...
  }
}
```

---

### Delete Event
Delete an event from the system.

**Endpoint:** `DELETE /events/:id`

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/api/v1/events/event_1234567890_abc123
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Event not found"
}
```

---

### Send Event Invitations
Send WhatsApp invitations to all invitees for a specific event.

**Endpoint:** `POST /events/:id/send`

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/v1/events/event_1234567890_abc123/send
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Invitations sent",
  "data": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "results": [
      {
        "phoneNumber": "1234567890",
        "success": true,
        "messageId": "msg_abc123"
      },
      {
        "phoneNumber": "9876543210",
        "success": true,
        "messageId": "msg_xyz789"
      }
    ]
  }
}
```

**Error Response (503 Service Unavailable):**
```json
{
  "success": false,
  "message": "WhatsApp client is not ready. Please try again later."
}
```

---

### Get Event RSVPs
Get RSVP statistics and details for a specific event.

**Endpoint:** `GET /events/:id/rsvps`

**Example Request:**
```bash
curl http://localhost:3000/api/v1/events/event_1234567890_abc123/rsvps
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "accepted": 3,
    "declined": 1,
    "pending": 1,
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
    "pendingList": [
      {
        "phoneNumber": "7777777777",
        "contactName": "Alice Williams"
      }
    ]
  }
}
```

---

## Webhook

### Webhook Health Check
Check the status of the WhatsApp service.

**Endpoint:** `GET /webhook/health`

**Example Request:**
```bash
curl http://localhost:3000/api/v1/webhook/health
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "whatsappStatus": "ready",
  "timestamp": "2026-02-08T22:00:00.000Z"
}
```

---

### Webhook Statistics
Get overall application statistics.

**Endpoint:** `GET /webhook/stats`

**Example Request:**
```bash
curl http://localhost:3000/api/v1/webhook/stats
```

**Success Response (200 OK):**
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

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Detailed error message"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

### 503 Service Unavailable
```json
{
  "success": false,
  "message": "Service temporarily unavailable"
}
```

---

## Phone Number Format

Phone numbers should be provided in international format without special characters:
- ✅ Correct: `"1234567890"` or `"911234567890"`
- ❌ Incorrect: `"+1-234-567-890"` or `"(123) 456-7890"`

The system will automatically format them for WhatsApp use.