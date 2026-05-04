# API Testing Examples - CURL Commands

## Prerequisites

```bash
# Replace these with actual values
TOKEN="your_jwt_token_here"
API_URL="http://localhost:3000"
USER_ID="user_mongo_id_here"
TENANT_ID="tenant_mongo_id_here"
```

## Authentication

### Get JWT Token (if using login)

```bash
curl -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

## Conversation Management

### 1. Create New Conversation

```bash
curl -X POST $API_URL/api/messages/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Response:
# {
#   "success": true,
#   "data": {
#     "_id": "conv_id_123",
#     "customerId": "user_id",
#     "tenantId": "tenant_id",
#     "status": "open",
#     "lastMessage": "",
#     "createdAt": "2026-05-03T..."
#   }
# }
```

Save the `_id` value as `CONV_ID`:

```bash
CONV_ID="conv_id_123"
```

### 2. List All User Conversations

```bash
curl -X GET $API_URL/api/messages/conversations \
  -H "Authorization: Bearer $TOKEN"

# Returns: Array of conversation objects
```

### 3. Get Messages in Conversation

```bash
curl -X GET $API_URL/api/messages/conversations/$CONV_ID/messages \
  -H "Authorization: Bearer $TOKEN"

# Returns: Array of message objects
```

### 4. Close Conversation

```bash
curl -X POST $API_URL/api/messages/conversations/$CONV_ID/close \
  -H "Authorization: Bearer $TOKEN"

# Changes status to "closed"
```

---

## Message Operations

### Send Message (Triggers AI Response + Sentiment Analysis)

#### Example 1: Positive Message (No Ticket)

```bash
curl -X POST $API_URL/api/messages/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"conversationId\": \"$CONV_ID\",
    \"message\": \"Your service is absolutely amazing! Very satisfied.\"
  }"

# Response:
# {
#   "success": true,
#   "data": {
#     "userMessage": {...},
#     "aiMessage": {...},
#     "sentiment": {
#       "score": 3,
#       "isNegative": false,
#       "comparative": 0.75
#     },
#     "ticketCreated": false,
#     "ticket": null
#   }
# }
```

#### Example 2: Neutral Message (No Ticket)

```bash
curl -X POST $API_URL/api/messages/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"conversationId\": \"$CONV_ID\",
    \"message\": \"I have a question about my account.\"
  }"

# Sentiment score: ~0 (neutral)
# No ticket created
```

#### Example 3: Negative Message (CREATES TICKET! ✅)

```bash
curl -X POST $API_URL/api/messages/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"conversationId\": \"$CONV_ID\",
    \"message\": \"I'm absolutely furious! This is the worst experience ever!\"
  }"

# Response:
# {
#   "success": true,
#   "data": {
#     "userMessage": {...},
#     "aiMessage": {...},
#     "sentiment": {
#       "score": -3,
#       "isNegative": true,
#       "comparative": -1.5
#     },
#     "ticketCreated": true,
#     "ticket": {
#       "_id": "ticket_id_456",
#       "title": "Customer Support: I'm absolutely furious! This is...",
#       "description": "Ticket auto-created due to negative sentiment...",
#       "priority": "high",
#       "status": "open",
#       "customerId": "user_id",
#       "tenantId": "tenant_id",
#       "createdAt": "2026-05-03T..."
#     }
#   }
# }
```

#### Example 4: Very Negative Message

```bash
curl -X POST $API_URL/api/messages/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"conversationId\": \"$CONV_ID\",
    \"message\": \"This is absolutely horrible, terrible, and disappointing!\"
  }"

# Sentiment score: -4 (very negative)
# Ticket created with HIGH priority
```

---

## AI Services

### Test AI Response Only (Without Saving)

```bash
curl -X POST $API_URL/api/ai/test-response \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I reset my password?"
  }'

# Response:
# {
#   "success": true,
#   "data": {
#     "userMessage": "How do I reset my password?",
#     "aiResponse": "You can reset your password by clicking..."
#   }
# }
```

### Analyze Sentiment Only (Without Saving)

```bash
curl -X POST $API_URL/api/ai/analyze-sentiment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I love this service!"
  }'

# Response:
# {
#   "success": true,
#   "data": {
#     "message": "I love this service!",
#     "sentiment": {
#       "score": 3,
#       "isNegative": false,
#       "comparative": 1.0
#     }
#   }
# }
```

### Test Multiple Sentiment Examples

```bash
# Positive
curl -X POST $API_URL/api/ai/analyze-sentiment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Great job, thanks!"}'

# Negative
curl -X POST $API_URL/api/ai/analyze-sentiment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "This is terrible and broken!"}'

# Neutral
curl -X POST $API_URL/api/ai/analyze-sentiment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "I want to check my order status."}'
```

---

## Ticket Management

### 1. Get All Tickets (Admin/Tenant View)

```bash
curl -X GET $API_URL/api/tickets \
  -H "Authorization: Bearer $TOKEN"

# Returns all tickets for tenant
```

### 2. Get Customer's Tickets

```bash
curl -X GET $API_URL/api/tickets/customer \
  -H "Authorization: Bearer $TOKEN"

# Returns only current user's tickets
```

### 3. Get Single Ticket Details

```bash
TICKET_ID="ticket_id_123"

curl -X GET $API_URL/api/tickets/$TICKET_ID \
  -H "Authorization: Bearer $TOKEN"

# Response:
# {
#   "success": true,
#   "data": {
#     "_id": "ticket_id_123",
#     "title": "Customer Support: I'm absolutely furious...",
#     "description": "Ticket auto-created due to negative sentiment...",
#     "status": "open",
#     "priority": "high",
#     "customerId": {...},
#     "agentId": null,
#     "tenantId": {...},
#     "isAiResolved": false,
#     "createdAt": "2026-05-03T...",
#     "updatedAt": "2026-05-03T..."
#   }
# }
```

### 4. Assign Ticket to Agent

```bash
AGENT_ID="agent_mongo_id"

curl -X POST $API_URL/api/tickets/$TICKET_ID/assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"agentId\": \"$AGENT_ID\"
  }"

# Response:
# {
#   "success": true,
#   "message": "Ticket assigned successfully",
#   "data": {
#     "_id": "ticket_id_123",
#     "status": "in_progress",
#     "agentId": {...},
#     ...
#   }
# }
```

### 5. Update Ticket Status

#### Open

```bash
curl -X PATCH $API_URL/api/tickets/$TICKET_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "open"}'
```

#### In Progress

```bash
curl -X PATCH $API_URL/api/tickets/$TICKET_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'
```

#### Resolved

```bash
curl -X PATCH $API_URL/api/tickets/$TICKET_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "resolved"}'
```

#### Closed

```bash
curl -X PATCH $API_URL/api/tickets/$TICKET_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "closed"}'
```

### 6. Update Ticket Priority

#### Low

```bash
curl -X PATCH $API_URL/api/tickets/$TICKET_ID/priority \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"priority": "low"}'
```

#### Medium

```bash
curl -X PATCH $API_URL/api/tickets/$TICKET_ID/priority \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"priority": "medium"}'
```

#### High

```bash
curl -X PATCH $API_URL/api/tickets/$TICKET_ID/priority \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"priority": "high"}'
```

### 7. Resolve Ticket

```bash
curl -X POST $API_URL/api/tickets/$TICKET_ID/resolve \
  -H "Authorization: Bearer $TOKEN"

# Changes status to "resolved"
```

### 8. Close Ticket

```bash
curl -X POST $API_URL/api/tickets/$TICKET_ID/close \
  -H "Authorization: Bearer $TOKEN"

# Changes status to "closed"
```

### 9. Get Ticket Statistics

```bash
curl -X GET $API_URL/api/tickets/stats \
  -H "Authorization: Bearer $TOKEN"

# Response:
# {
#   "success": true,
#   "data": {
#     "total": 5,
#     "open": 2,
#     "inProgress": 1,
#     "resolved": 1,
#     "closed": 1,
#     "highPriority": 2
#   }
# }
```

---

## Complete Workflow Test

Test the entire flow from conversation to ticket creation:

```bash
#!/bin/bash

# 1. Create conversation
echo "Creating conversation..."
CONV=$(curl -s -X POST http://localhost:3000/api/messages/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
CONV_ID=$(echo $CONV | jq -r '.data._id')
echo "Conversation ID: $CONV_ID"

# 2. Send positive message (no ticket)
echo -e "\nSending positive message..."
curl -s -X POST http://localhost:3000/api/messages/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"conversationId\": \"$CONV_ID\", \"message\": \"Your service is great!\"}" \
  | jq '.data.sentiment'

# 3. Send negative message (creates ticket)
echo -e "\nSending negative message..."
RESULT=$(curl -s -X POST http://localhost:3000/api/messages/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"conversationId\": \"$CONV_ID\", \"message\": \"This is terrible!\"}")
echo $RESULT | jq '.data.sentiment'
TICKET_ID=$(echo $RESULT | jq -r '.data.ticket._id')
echo "Ticket ID: $TICKET_ID"

# 4. View created ticket
echo -e "\nTicket Details:"
curl -s -X GET http://localhost:3000/api/tickets/$TICKET_ID \
  -H "Authorization: Bearer $TOKEN" | jq '.data'

# 5. Get statistics
echo -e "\nTicket Statistics:"
curl -s -X GET http://localhost:3000/api/tickets/stats \
  -H "Authorization: Bearer $TOKEN" | jq '.data'
```

---

## Error Responses

### Missing Authentication

```bash
curl -X GET http://localhost:3000/api/messages/conversations

# Response:
# {
#   "message": "Unauthorized",
#   "code": 401
# }
```

### Invalid Request

```bash
curl -X POST http://localhost:3000/api/messages/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Missing conversationId"}'

# Response:
# {
#   "message": "Conversation ID and message are required",
#   "statusCode": 400
# }
```

### Not Found

```bash
curl -X GET http://localhost:3000/api/tickets/invalid_id \
  -H "Authorization: Bearer $TOKEN"

# Response:
# {
#   "message": "Ticket not found"
# }
```

---

## Tips for Testing

1. **Use jq for JSON Formatting**

   ```bash
   curl -s ... | jq '.'
   ```

2. **Save Variables**

   ```bash
   RESPONSE=$(curl -s ...)
   ID=$(echo $RESPONSE | jq -r '.data._id')
   ```

3. **Pretty Print Response**

   ```bash
   curl ... | jq '.data | keys'
   ```

4. **Test with Different Sentiment Messages**
   - Positive: "Great", "Love", "Excellent", "Amazing"
   - Negative: "Terrible", "Hate", "Worst", "Horrible"
   - Neutral: "Question", "Help", "Check status"

---

## PowerShell Equivalents

If using PowerShell instead of bash:

```powershell
$TOKEN = "your_token"
$URL = "http://localhost:3000"

# Create conversation
$response = Invoke-WebRequest -Uri "$URL/api/messages/conversations" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $TOKEN"} `
  -ContentType "application/json"

$convId = ($response.Content | ConvertFrom-Json).data._id

# Send message
Invoke-WebRequest -Uri "$URL/api/messages/send" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $TOKEN"} `
  -ContentType "application/json" `
  -Body (@{"conversationId"=$convId;"message"="Test message"} | ConvertTo-Json)
```

---

**Last Updated**: May 3, 2026
