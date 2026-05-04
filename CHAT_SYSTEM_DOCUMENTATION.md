# AI Customer Support Chat System Documentation

## Overview

This chat system provides AI-powered customer support with automatic ticket escalation based on sentiment analysis. When customers express negative sentiment, a support ticket is automatically created for agent intervention.

## System Architecture

### Components

#### 1. **AI Service** (`ai.service.js`)

Handles all AI and sentiment analysis operations:

- **`analyzeSentiment(text)`** - Uses sentiment library to analyze message sentiment
  - Returns score, isNegative flag, and comparative value
  - Score < -1 triggers ticket creation
- **`getAIResponse(userMessage, conversationHistory)`** - Generates AI responses
  - Uses GPT-3.5-turbo model via LangChain
  - Provides context-aware responses based on conversation history
- **`processMessage(conversationId, userId, tenantId, userMessage)`** - Main processing pipeline
  - Analyzes sentiment
  - Saves user message
  - Generates AI response
  - Creates ticket if negative sentiment detected
  - Updates conversation metadata
- **`createTicketFromNegativeSentiment()`** - Auto-creates tickets
  - Sets priority to "high"
  - Captures original message content
  - Updates conversation status to "pending"

#### 2. **Message Controller** (`message.controller.js`)

Manages conversation and message operations:

- `sendMessage()` - Process and save messages
- `getConversationMessages()` - Retrieve conversation history
- `getConversations()` - List all user conversations
- `createConversation()` - Start new chat session
- `closeConversation()` - End conversation

#### 3. **Ticket Controller** (`ticket.controller.js`)

Handles support ticket management:

- `getTenantTickets()` - Admin view of all tickets
- `getCustomerTickets()` - Customer's own tickets
- `assignTicket()` - Assign to support agent
- `updateTicketStatus()` - Change ticket status (open, in_progress, resolved, closed)
- `updateTicketPriority()` - Adjust priority level
- `getTicketStats()` - Dashboard statistics

#### 4. **Socket.io Server** (`server.socket.js`)

Real-time communication:

- `join-conversation` - User joins chat room
- `send-message` - Message transmission with AI processing
- `user-typing` / `user-stopped-typing` - Typing indicators
- `new-message` - Broadcast messages to all participants
- `ticket-created` - Notify on auto-escalation

#### 5. **Routes**

**Message Routes** (`/api/messages`):

```
POST   /conversations              - Create new conversation
GET    /conversations              - Get all conversations
GET    /conversations/:id/messages - Get conversation messages
POST   /conversations/:id/close    - Close conversation
POST   /send                       - Send message
```

**AI Routes** (`/api/ai`):

```
POST   /test-response      - Test AI response
POST   /analyze-sentiment  - Analyze message sentiment
```

**Ticket Routes** (`/api/tickets`):

```
GET    /                   - Get all tenant tickets
GET    /customer           - Get customer's tickets
GET    /stats              - Get ticket statistics
GET    /:ticketId          - Get ticket details
POST   /:ticketId/assign   - Assign ticket
PATCH  /:ticketId/status   - Update status
PATCH  /:ticketId/priority - Update priority
POST   /:ticketId/resolve  - Resolve ticket
POST   /:ticketId/close    - Close ticket
```

## Data Models

### Conversation Schema

```javascript
{
  tenantId: ObjectId,           // Organization reference
  customerId: ObjectId,         // Customer reference
  status: "open|closed|pending", // Current state
  lastMessage: String,          // Preview for UI
  lastMessageAt: Date,          // For sorting
  timestamps: true
}
```

### Message Schema

```javascript
{
  text: String,                    // Message content
  sender: "user|ai|agent",        // Message source
  conversationId: ObjectId,       // Linked conversation
  tenantId: ObjectId,             // Organization reference
  userId: ObjectId,               // User reference
  timestamps: true
}
```

### Ticket Schema

```javascript
{
  title: String,                        // Ticket summary
  description: String,                  // Full details
  status: "open|in_progress|resolved|closed",
  priority: "low|medium|high",
  customerId: ObjectId,                 // Customer reference
  agentId: ObjectId,                    // Assigned agent
  tenantId: ObjectId,                   // Organization reference
  isAiResolved: Boolean,               // Auto-resolution flag
  timestamps: true
}
```

## Workflow

### Customer Support Flow

1. **Customer Initiates Chat**
   - Calls `POST /api/messages/conversations` to create conversation
   - Joins Socket.io room with `join-conversation` event

2. **Customer Sends Message**
   - Calls `POST /api/messages/send` or emits `send-message` via Socket.io
   - Backend processes message:
     - Analyzes sentiment
     - Saves user message to database
     - Generates AI response
     - Saves AI response to database

3. **Sentiment Analysis**
   - Sentiment score < -1 triggers escalation
   - System automatically creates a ticket
   - Conversation status changes to "pending"
   - Admin receives `ticket-created` notification

4. **Ticket Escalation**
   - Support agent assigned to ticket
   - Agent can view conversation history
   - Agent takes over conversation via Socket.io
   - Conversation continues with agent messages (sender: "agent")

5. **Resolution**
   - Agent updates ticket status to "resolved"
   - Customer conversation closed
   - Ticket marked as closed

## Sentiment Analysis

Uses the `sentiment` npm package:

- Analyzes English text for emotional tone
- Returns numerical score (positive/negative/neutral)
- Default threshold: score < -1 for negative

Example scores:

```
"This is great!" = +3 (positive)
"I'm satisfied" = +2 (positive)
"It's okay" = 0 (neutral)
"This is bad" = -2 (negative) ✓ Creates ticket
"I'm very disappointed" = -4 (negative) ✓ Creates ticket
```

## Socket.io Events

### Client → Server

**join-conversation**

```javascript
socket.emit("join-conversation", {
  conversationId: "...",
  userId: "...",
});
```

**send-message**

```javascript
socket.emit("send-message", {
  conversationId: "...",
  message: "User message",
  userId: "...",
  tenantId: "...",
});
```

**user-typing**

```javascript
socket.emit("user-typing", {
  conversationId: "...",
  userId: "...",
});
```

### Server → Client

**joined-conversation**

```javascript
{
  success: true,
  message: 'Connected to conversation'
}
```

**new-message**

```javascript
{
  success: true,
  userMessage: {...},
  aiMessage: {...},
  sentiment: {
    score: -2,
    isNegative: true
  },
  ticketCreated: true,
  ticket: {...}
}
```

**ticket-created**

```javascript
{
  ticket: {...},
  reason: 'Negative sentiment detected',
  conversationId: '...'
}
```

## API Examples

### Create Conversation

```bash
curl -X POST http://localhost:3000/api/messages/conversations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### Send Message

```bash
curl -X POST http://localhost:3000/api/messages/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "...",
    "message": "I'm very upset with this service!"
  }'
```

### Analyze Sentiment

```bash
curl -X POST http://localhost:3000/api/ai/analyze-sentiment \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "This is terrible!"}'

// Response:
{
  "success": true,
  "data": {
    "sentiment": {
      "score": -3,
      "isNegative": true,
      "comparative": -0.75
    }
  }
}
```

### Get Tickets

```bash
curl -X GET http://localhost:3000/api/tickets \
  -H "Authorization: Bearer <token>"

curl -X GET http://localhost:3000/api/tickets/customer \
  -H "Authorization: Bearer <token>"
```

### Assign Ticket

```bash
curl -X POST http://localhost:3000/api/tickets/:ticketId/assign \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"agentId": "..."}'
```

## Configuration

Required environment variables:

```env
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MONGODB_URI=your_mongodb_connection_string
```

## Dependencies

```json
{
  "@langchain/openai": "^1.4.5",
  "@langchain/core": "^1.1.44",
  "sentiment": "^5.0.2",
  "socket.io": "^4.8.3",
  "mongoose": "^9.6.1",
  "express": "^5.2.1",
  "jsonwebtoken": "^9.0.3"
}
```

## Features

✅ AI-powered customer support chat
✅ Real-time messaging via Socket.io
✅ Automatic sentiment analysis
✅ Automatic ticket escalation for negative sentiment
✅ Agent assignment and management
✅ Conversation history and context
✅ Typing indicators
✅ Ticket statistics and dashboard
✅ Multi-tenant support
✅ Authentication & authorization

## Security Considerations

1. All endpoints require JWT authentication
2. Conversation access restricted to authorized users
3. Ticket visibility based on role (customer vs admin)
4. Tenant isolation enforced at database level
5. Socket.io room isolation per conversation

## Future Enhancements

- [ ] Conversation handoff between agents
- [ ] Customer satisfaction surveys
- [ ] Knowledge base integration
- [ ] Conversation transcripts
- [ ] Advanced sentiment with emotion detection
- [ ] Canned response templates
- [ ] AI confidence scoring
- [ ] Support for multiple languages
- [ ] WebRTC for voice/video support
