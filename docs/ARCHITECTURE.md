# Application Architecture

## Overview

The Event RSVP WhatsApp application follows a layered architecture pattern with clear separation of concerns. This document provides a detailed overview of the application structure, components, and their interactions.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Client/User                          │
│              (REST API / WhatsApp)                      │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│                     Routes Layer                         │
│     (eventRoutes, webhookRoutes)                        │
│     - Route definitions and request routing             │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│                  Controllers Layer                       │
│     (eventController, webhookController)                │
│     - Request handling and response formatting          │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│                   Services Layer                         │
│  (eventService, rsvpService, whatsappService)           │
│     - Business logic and data operations                │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│                    Models Layer                          │
│              (Event, RSVP)                              │
│     - Data structures and validation                    │
└─────────────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│                 Data Storage Layer                       │
│          (In-Memory Maps / Future: Database)            │
└─────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Entry Point (server.js)
**Purpose:** Application bootstrapping and initialization

**Responsibilities:**
- Load environment configuration
- Initialize Express server
- Initialize WhatsApp service
- Handle graceful shutdown
- Manage process-level error handling

**Key Features:**
- Asynchronous startup sequence
- Signal handling (SIGTERM, SIGINT)
- Graceful shutdown with timeout
- Uncaught exception handling

### 2. Application Setup (app.js)
**Purpose:** Express application configuration

**Responsibilities:**
- Configure middleware stack
- Set up security (Helmet)
- Configure CORS
- Define route structure
- Set up error handling

**Middleware Stack:**
1. Helmet (security headers)
2. CORS (cross-origin requests)
3. Body Parser (JSON/URL-encoded)
4. Request Logger
5. Routes
6. 404 Handler
7. Error Handler

### 3. Configuration (config/)
**Purpose:** Centralized configuration management

**Configuration Sources:**
- Environment variables (.env file)
- Default values
- Path configurations

**Configuration Groups:**
- Server settings (port, environment)
- Application settings (name, API prefix)
- WhatsApp settings (session name, auth path)
- Webhook settings (tokens, secrets)
- Logging settings (log level)

### 4. Routes Layer (routes/)
**Purpose:** Define API endpoints and route requests to controllers

**Structure:**
```
routes/
├── index.js          # Main router, combines all routes
├── eventRoutes.js    # Event management endpoints
└── webhookRoutes.js  # Webhook endpoints
```

**Endpoints:**
- Event CRUD operations
- Invitation sending
- RSVP retrieval
- Health checks
- Statistics

### 5. Controllers Layer (controllers/)
**Purpose:** Handle HTTP requests and format responses

**Controllers:**

#### eventController.js
- `createEvent()` - Create new event
- `getAllEvents()` - List all events
- `getEvent()` - Get single event
- `updateEvent()` - Update event details
- `deleteEvent()` - Delete event
- `sendInvitations()` - Send WhatsApp invitations
- `getEventRSVPs()` - Get RSVP statistics

#### webhookController.js
- `handleWhatsAppMessage()` - Process incoming messages
- `parseRSVPResponse()` - Parse user responses
- `getConfirmationMessage()` - Generate confirmation messages
- `health()` - Health check endpoint
- `getStats()` - Application statistics

### 6. Services Layer (services/)
**Purpose:** Implement business logic and manage data operations

**Services:**

#### eventService.js
**Responsibilities:**
- Event creation and validation
- Event storage and retrieval
- Event updates and deletion
- Event status management

**Storage:** In-memory Map (key: event ID, value: Event object)

#### rsvpService.js
**Responsibilities:**
- RSVP record creation
- RSVP response tracking
- RSVP statistics calculation
- Pending RSVP queries

**Storage:** 
- Primary: In-memory Map (key: RSVP ID, value: RSVP object)
- Index: In-memory Map (key: `${eventId}:${phoneNumber}`, value: RSVP ID)

#### whatsappService.js
**Responsibilities:**
- WhatsApp Web client initialization
- QR code authentication
- Message sending (single and bulk)
- Incoming message handling
- Phone number formatting
- Connection state management

**Key Features:**
- Singleton pattern
- Event-driven architecture
- Message handler registration
- Rate limiting (2-second delay between bulk messages)
- Automatic reconnection handling

### 7. Models Layer (models/)
**Purpose:** Define data structures and validation

**Models:**

#### Event.js
**Properties:**
- id, title, description, date, time, location
- createdBy, createdAt, invitees, status

**Methods:**
- `generateId()` - Create unique event ID
- `toWhatsAppMessage()` - Format invitation message
- `validate()` - Validate event data

#### RSVP.js
**Properties:**
- id, eventId, phoneNumber, contactName
- response, message, respondedAt, createdAt

**Methods:**
- `generateId()` - Create unique RSVP ID
- `accept()` - Mark as accepted
- `decline()` - Mark as declined
- `getStatus()` - Get formatted status

### 8. Middleware (middleware/)
**Purpose:** Request/response processing and cross-cutting concerns

**Middleware:**

#### requestLogger.js
- Logs all incoming HTTP requests
- Records method, URL, status, duration, IP
- Attaches to response finish event

#### errorHandler.js
- Catches unhandled errors
- Formats error responses
- Logs error details
- Hides stack traces in production

### 9. Utilities (utils/)
**Purpose:** Shared utility functions

#### logger.js
- Winston-based logging
- Multiple transports (console, file)
- Log rotation
- Structured logging with timestamps
- Environment-aware formatting

**Log Outputs:**
- Console: Colorized, human-readable
- error.log: Error-level logs only
- combined.log: All logs

## Data Flow

### Event Creation and Invitation Flow
```
1. Client sends POST /api/v1/events
   ↓
2. eventRoutes receives request
   ↓
3. eventController.createEvent() processes request
   ↓
4. eventService.createEvent() validates and stores event
   ↓
5. Event model validates data
   ↓
6. Response sent back to client
   ↓
7. Client sends POST /api/v1/events/:id/send
   ↓
8. eventController.sendInvitations() processes request
   ↓
9. rsvpService.createRSVPsForEvent() creates RSVP records
   ↓
10. whatsappService.sendBulkInvitations() sends messages
   ↓
11. WhatsApp Web sends messages to users
```

### RSVP Response Flow
```
1. User sends WhatsApp message
   ↓
2. whatsappService receives message via event listener
   ↓
3. webhookController.handleWhatsAppMessage() processes message
   ↓
4. webhookController.parseRSVPResponse() parses response
   ↓
5. rsvpService.updateRSVPResponse() updates RSVP record
   ↓
6. whatsappService.sendMessage() sends confirmation
   ↓
7. User receives confirmation message
```

## Design Patterns

### 1. Singleton Pattern
Used in services to ensure single instances:
- eventService
- rsvpService
- whatsappService

### 2. Repository Pattern
Services act as repositories for data access:
- Abstract storage details
- Provide clean API for data operations
- Easy to swap storage implementations

### 3. MVC Pattern
Modified Model-View-Controller:
- Models: Data structures
- Controllers: Request handlers
- Services: Business logic (replaces traditional "Model" logic)

### 4. Middleware Pattern
Express middleware chain for request processing:
- Security → CORS → Parsing → Logging → Routes → Error Handling

### 5. Observer Pattern
WhatsApp message handling:
- Register handlers with `onMessage()`
- Handlers called when messages arrive

## Scalability Considerations

### Current POC Limitations
- In-memory storage (data lost on restart)
- Single instance only (no clustering)
- No authentication/authorization
- Basic rate limiting

### Future Enhancements for Production

#### 1. Database Integration
Replace in-memory storage with persistent database:
- PostgreSQL or MongoDB
- Connection pooling
- Migrations
- Backup/restore

#### 2. Authentication & Authorization
- JWT-based authentication
- Role-based access control
- API key management

#### 3. Caching
- Redis for session storage
- Cache frequently accessed data
- Reduce database load

#### 4. Queue System
- Message queue for WhatsApp messages (RabbitMQ, Bull)
- Handle bulk operations asynchronously
- Retry failed messages

#### 5. Monitoring & Observability
- Application metrics (Prometheus)
- Distributed tracing (Jaeger)
- Error tracking (Sentry)
- Health checks (k8s probes)

#### 6. High Availability
- Load balancing
- Horizontal scaling
- Database replication
- Failover mechanisms

## Security Considerations

### Current Implementation
- Helmet for security headers
- CORS configuration
- Environment variable protection
- Input validation

### Production Requirements
- HTTPS/TLS encryption
- Rate limiting (express-rate-limit)
- Input sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens
- API authentication
- Audit logging
- Secret management (Vault, AWS Secrets Manager)

## Testing Strategy

### Recommended Tests
1. **Unit Tests**
   - Models (validation logic)
   - Services (business logic)
   - Utilities (helper functions)

2. **Integration Tests**
   - Controllers (request/response)
   - Routes (endpoint behavior)
   - Services (data operations)

3. **End-to-End Tests**
   - Complete user flows
   - WhatsApp integration (mocked)

### Testing Tools
- Jest or Mocha (test runner)
- Supertest (HTTP testing)
- Sinon (mocking/stubbing)
- Nock (HTTP mocking)

## Deployment

### Docker Support (Future)
```dockerfile
FROM node:18.20.8-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables
See `.env.example` for all required configuration

### Process Management
- PM2 for production
- Auto-restart on crashes
- Log management
- Cluster mode support