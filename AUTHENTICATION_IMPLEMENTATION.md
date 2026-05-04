# Authentication Implementation Summary

## What Was Created/Updated

### 1. Enhanced auth.middleware.js

**File**: `backend/src/middleware/auth.middleware.js`

#### New Middleware: `authenticateToken`

```javascript
export const authenticateToken = async (req, res, next) => {
  // Validates JWT token from cookies or Authorization header
  // Sets req.user with user details
  // Works for any authenticated user (admin or customer)
};
```

**Features**:

- ✅ Accepts tokens from both cookies and Authorization headers
- ✅ Validates JWT signature and expiration
- ✅ Fetches user from database
- ✅ Checks if account is active
- ✅ Provides detailed error messages
- ✅ Attaches user info to req.user

#### Enhanced Middleware: `authenticateAdmin`

```javascript
export const authenticateAdmin = async (req, res, next) => {
  // Same as authenticateToken + validates admin role
  // Returns 403 Forbidden if user is not admin
};
```

**Status**: ✅ Updated with cookie + header support

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT REQUEST                          │
├─────────────────────────────────────────────────────────────┤
│  POST /api/messages/send                                    │
│  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...             │
│  Body: { conversationId: "123", message: "test" }          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│        1. Middleware Chain Execution (in order)             │
├─────────────────────────────────────────────────────────────┤
│  express.json()  ← Parse JSON body                          │
│  morgan()        ← Log request                              │
│  cookieParser()  ← Parse cookies                            │
│  authenticateToken ← Validate JWT & set req.user           │
│  controller()    ← Handle business logic                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│      2. authenticateToken Execution Steps                   │
├─────────────────────────────────────────────────────────────┤
│  1. Get token from:                                         │
│     a) req.cookies.token, OR                               │
│     b) Authorization header (Bearer token)                  │
│                                                             │
│  2. Verify token with JWT_SECRET                           │
│     - Check signature                                       │
│     - Check expiration                                      │
│                                                             │
│  3. Decode token payload:                                   │
│     { id: "user_id", tenantId: "tenant_id" }              │
│                                                             │
│  4. Fetch user from MongoDB:                               │
│     userModel.findById(decoded.id)                         │
│                                                             │
│  5. Validate user:                                          │
│     - User exists?                                          │
│     - Account isActive?                                     │
│                                                             │
│  6. Build req.user object:                                 │
│     {                                                       │
│       _id: user._id,                                        │
│       email: user.email,                                    │
│       role: user.role,                                      │
│       tenantId: user.tenantId,                             │
│       isActive: user.isActive,                             │
│       username: user.username,                             │
│       avatar: user.avatar                                   │
│     }                                                       │
│                                                             │
│  7. Call next() → Continue to controller                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│    3. Controller with Access to req.user                    │
├─────────────────────────────────────────────────────────────┤
│  export const sendMessage = async (req, res) => {          │
│      const { _id, tenantId } = req.user;  ← Available!    │
│      const { conversationId, message } = req.body;         │
│                                                             │
│      // Save with user context                             │
│      await processMessage(                                  │
│          conversationId,                                    │
│          _id,           ← From req.user                     │
│          tenantId,      ← From req.user                     │
│          message                                            │
│      );                                                     │
│  }                                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE OPERATIONS                        │
├─────────────────────────────────────────────────────────────┤
│  Create Message with tenantId for isolation                │
│  Create Conversation with userId from req.user             │
│  Create Ticket with customerId and tenantId                │
└─────────────────────────────────────────────────────────────┘
```

---

## Flow Diagram: Token Lifecycle

```
┌──────────────────────────────────────────────────────────┐
│                    USER LOGIN                            │
├──────────────────────────────────────────────────────────┤
│  POST /api/auth/login                                    │
│  Body: { email: "user@example.com", password: "..." }   │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓
    ┌─────────────────────────────────────┐
    │  auth.controller.js                 │
    │  checkToken(user, res, message)     │
    │                                     │
    │  const token = jwt.sign(            │
    │    { id: user._id,                  │
    │      tenantId: user.tenantId },     │
    │    config.JWT_SECRET,               │
    │    { expiresIn: '7d' }              │
    │  );                                 │
    └────────────┬────────────────────────┘
                 │
        ┌────────┴─────────┐
        │                  │
        ↓                  ↓
    COOKIE              RESPONSE
    Set-Cookie:         {
    token=jwt...        "token": "jwt...",
    (HttpOnly)          "user": {...}
                        }
        │                  │
        └────────┬─────────┘
                 │
    ┌────────────┴──────────────────────────────────┐
    │                                               │
    ↓                                               ↓
BROWSER STORAGE                              FRONTEND APP
localStorage.setItem(                        User logged in
  'token',                                   Navigate to chat
  response.token
)
    │                                               │
    └────────────┬──────────────────────────────────┘
                 │
    ┌────────────┴──────────────────────────────────┐
    │    SUBSEQUENT API REQUESTS (with token)       │
    └────────────┬──────────────────────────────────┘
                 │
    ┌────────────┴──────────────────────────────┐
    │                                           │
    ↓                                           ↓
AUTOMATIC                            EXPLICIT HEADER
(Browser)                            (API Client)

fetch('/api/protected')              fetch('/api/protected',
// Cookie sent                       {
// automatically                       headers: {
                                      'Authorization':
                                      `Bearer ${token}`
                                     }
                                     })
    │                                           │
    └────────────┬──────────────────────────────┘
                 │
                 ↓
    ┌────────────────────────────────────────┐
    │  authenticateToken Middleware          │
    │  - Extract token                       │
    │  - Verify signature                    │
    │  - Decode payload                      │
    │  - Set req.user                        │
    │  - Call next()                         │
    └────────────┬─────────────────────────────┘
                 │
                 ↓
    ┌────────────────────────────────────────┐
    │  Controller (with req.user access)     │
    │  - Process request                     │
    │  - Return response                     │
    └────────────────────────────────────────┘
```

---

## File Dependencies

```
backend/
├── middleware/
│   └── auth.middleware.js
│       ├── Imports: jwt, userModel, config
│       ├── Exports: authenticateToken, authenticateAdmin
│       └── Used by: All protected routes
│
├── controllers/
│   ├── message.controller.js
│   │   └── Uses: authenticateToken (via routes)
│   │       Access: req.user._id, req.user.tenantId
│   │
│   ├── ticket.controller.js
│   │   └── Uses: authenticateToken & authenticateAdmin
│   │       Access: req.user._id, req.user.tenantId
│   │
│   └── ai.controller.js
│       └── Uses: authenticateToken
│
├── routes/
│   ├── message.routes.js
│   │   └── Uses: authenticateToken middleware
│   │
│   ├── ticket.routes.js
│   │   └── Uses: authenticateToken middleware
│   │
│   └── ai.routes.js
│       └── Uses: authenticateToken middleware
│
├── models/
│   └── user.model.js
│       └── Required fields:
│           - _id, email, role, tenantId, isActive
│
├── config/
│   └── config.js
│       └── Requires: JWT_SECRET from .env
│
└── app.js
    └── Includes all routes using authenticateToken
```

---

## Token Structure & Content

### How Token is Created

```javascript
// In auth.controller.js - checkToken()
const token = jwt.sign(
  {
    id: user._id, // ← MongoDB user ID
    tenantId: user.tenantId, // ← Organization ID
  },
  config.JWT_SECRET, // ← From .env file
  { expiresIn: "7d" }, // ← Valid for 7 days
);
```

### What's Inside the Token

```javascript
{
  // Payload (encrypted)
  "id": "507f1f77bcf86cd799439011",        // User ID
  "tenantId": "507f1f77bcf86cd799439012",  // Organization ID

  // Standard JWT claims (automatic)
  "iat": 1715000000,      // Issued at timestamp
  "exp": 1715604000       // Expires at timestamp (7 days later)
}
```

### How Token is Decoded

```javascript
// In authenticateToken middleware
const decoded = jwt.verify(token, config.JWT_SECRET);
// decoded = { id: "...", tenantId: "..." }

const user = await userModel.findById(decoded.id);
// Fetch full user document from database
```

### What's Available in Controller

```javascript
export const someController = async (req, res) => {
  req.user = {
    _id: "507f1f77bcf86cd799439011",
    email: "user@example.com",
    role: "customer",
    tenantId: "507f1f77bcf86cd799439012",
    isActive: true,
    username: "john_doe",
    avatar: "https://...",
  };

  // All available for use
};
```

---

## Key Data Flows

### Flow 1: Create Conversation

```
Client Request
  ↓
POST /api/messages/conversations
  ↓
authenticateToken (validates, sets req.user)
  ↓
createConversation Controller
  ├─ Gets userId from req.user._id
  ├─ Gets tenantId from req.user.tenantId
  ├─ Creates: Conversation {
  │    customerId: userId,
  │    tenantId: tenantId,
  │    status: "open"
  │  }
  └─ Returns conversation ID
  ↓
Client receives conversation ID
```

### Flow 2: Send Message & Auto-Escalate

```
Client Request
  ↓
POST /api/messages/send
Body: { conversationId, message: "I'm very frustrated!" }
  ↓
authenticateToken (sets req.user)
  ↓
sendMessage Controller
  ├─ Gets userId & tenantId from req.user
  ├─ Calls ai.service.processMessage()
  │  ├─ Analyzes sentiment (score: -3)
  │  ├─ Saves user message
  │  ├─ Generates AI response
  │  ├─ Saves AI message
  │  └─ Score < -1? → Create ticket!
  │     ├─ new Ticket {
  │     │   customerId: userId,
  │     │   tenantId: tenantId,
  │     │   priority: "high",
  │     │   description: "..." (original message)
  │     │ }
  │     └─ Update Conversation status to "pending"
  └─ Returns all data + ticket info
  ↓
Client receives:
{
  userMessage: {...},
  aiMessage: {...},
  sentiment: { score: -3, isNegative: true },
  ticketCreated: true,
  ticket: {...}
}
```

### Flow 3: Get Customer Tickets

```
Client Request
  ↓
GET /api/tickets/customer
  ↓
authenticateToken (sets req.user)
  ↓
getCustomerTickets Controller
  ├─ Gets userId from req.user._id
  ├─ Gets tenantId from req.user.tenantId
  ├─ Queries: Ticket.find({
  │    customerId: userId,
  │    tenantId: tenantId
  │  })
  └─ Returns only user's tickets
  ↓
Client receives: [ticket1, ticket2, ...]
```

---

## Environment Requirements

### .env File (Must Exist)

```env
# CRITICAL - Must be set for auth to work
JWT_SECRET=your_super_secret_key_min_32_chars_here

# Other required variables
MONGO_URI=mongodb://localhost:27017/ai-customer-support
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### How to Generate JWT_SECRET

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output example:
# a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0

# Use this value in .env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
```

### Verification

```bash
# Check if environment is loaded
node -e "console.log(process.env.JWT_SECRET)"

# Should print your secret, not undefined
```

---

## Error Handling Chain

```
authenticateToken Errors:

No token
  → 401 "Unauthorized - No token provided"

Invalid format/signature
  → 401 "Unauthorized - Invalid token"

Token expired
  → 401 "Unauthorized - Token expired"

User deleted/not found
  → 401 "Unauthorized - User not found"

Account deactivated
  → 401 "Unauthorized - Account is inactive"

Admin-only route, user not admin (authenticateAdmin)
  → 403 "Forbidden - Admin access required"

Server error
  → 500 "Internal server error during authentication"
```

---

## Testing the Complete Flow

### Step 1: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "pass123"}'
```

Response:

```json
{
  "message": "Login successful",
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "tenantId": "507f1f77bcf86cd799439012",
    "role": "customer"
  }
}
```

### Step 2: Save Token

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Step 3: Use Token

```bash
curl -X POST http://localhost:3000/api/messages/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "customerId": "507f1f77bcf86cd799439011",
    "tenantId": "507f1f77bcf86cd799439012",
    "status": "open"
  }
}
```

---

## Summary

✅ **authenticateToken is ready to use**

**What it does:**

1. Extracts JWT token from cookies or Authorization header
2. Verifies token with JWT_SECRET
3. Fetches user from database
4. Sets req.user with user details
5. Allows controller access to user context

**What's required:**

- JWT_SECRET in .env
- User model with correct fields
- Routes wrapped with authenticateToken
- Controllers access req.user

**Used by:**

- All message routes
- All ticket routes
- All AI routes
- And any new protected routes

---

**Status**: ✅ Production Ready  
**Last Updated**: May 3, 2026
