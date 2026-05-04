# Authentication Middleware Guide

## Overview

The `authenticateToken` middleware is used to verify JWT tokens and authenticate users for protected routes. It supports two methods of token transmission:

1. **Cookie-based** (automatically sent by browsers)
2. **Authorization Header** (for API clients) - `Bearer token_value`

---

## What's Required

### 1. Environment Variables (.env)

```env
JWT_SECRET=your_super_secret_key_here
```

**CRITICAL**: This must be:

- Kept in `.env` (never commit to git)
- Long and random (minimum 32 characters recommended)
- Same across all server instances (if scaling)

**Generate secure JWT_SECRET**:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

### 2. User Model Requirements

The `authenticateToken` middleware expects users with:

```javascript
{
  _id: ObjectId,           // User ID (required)
  email: String,           // Email (required)
  role: String,            // 'admin' or 'customer' (required)
  tenantId: ObjectId,      // Organization ID (required)
  isActive: Boolean,       // Account status (required)
  username: String,        // Username (optional)
  avatar: String           // Avatar URL (optional)
}
```

### 3. JWT Token Generation

Tokens are generated during login/registration with:

- **Payload**: `{ id: user._id, tenantId: user.tenantId }`
- **Secret**: `JWT_SECRET` from environment
- **Expiration**: 7 days

```javascript
const token = jwt.sign(
  { id: user._id, tenantId: user.tenantId },
  config.JWT_SECRET,
  { expiresIn: "7d" },
);
```

---

## How to Use

### 1. Import Middleware

```javascript
import {
  authenticateToken,
  authenticateAdmin,
} from "../middleware/auth.middleware.js";
```

### 2. Protect Routes

#### For any authenticated user:

```javascript
router.get("/profile", authenticateToken, getProfile);
router.post("/messages/send", authenticateToken, sendMessage);
```

#### For admin only:

```javascript
router.get("/admin/tickets", authenticateAdmin, getTenantTickets);
router.delete("/admin/users/:id", authenticateAdmin, deleteUser);
```

### 3. Access User in Controller

After authentication, `req.user` contains:

```javascript
export const getProfile = (req, res) => {
  const {
    _id, // User ID
    email, // Email
    role, // 'admin' or 'customer'
    tenantId, // Organization ID
    isActive, // Account status
    username, // Username
    avatar, // Avatar URL
  } = req.user;

  console.log(`User ${_id} from tenant ${tenantId}`);
  res.json({ user: req.user });
};
```

---

## Token Transmission Methods

### Method 1: Cookie (Automatic)

Browser automatically sends cookie with each request:

```javascript
// Login response sets cookie
res.cookie("token", token);

// Browser automatically includes cookie in subsequent requests
// No client-side action needed
```

### Method 2: Authorization Header (API Clients)

Client must include header:

```javascript
// JavaScript/Fetch
fetch('/api/protected', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});

// Axios
axios.get('/api/protected', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});

// CURL
curl -H "Authorization: Bearer token_value" http://localhost:3000/api/protected
```

---

## Routes Using authenticateToken

All these routes require valid authentication:

### Message Routes

```
POST   /api/messages/conversations              (create chat)
GET    /api/messages/conversations              (list chats)
GET    /api/messages/conversations/:id/messages (get history)
POST   /api/messages/conversations/:id/close    (close chat)
POST   /api/messages/send                       (send message)
```

### AI Routes

```
POST   /api/ai/test-response                    (test AI)
POST   /api/ai/analyze-sentiment                (analyze sentiment)
```

### Ticket Routes

```
GET    /api/tickets                             (all tickets)
GET    /api/tickets/customer                    (user's tickets)
GET    /api/tickets/stats                       (statistics)
GET    /api/tickets/:id                         (ticket details)
POST   /api/tickets/:id/assign                  (assign ticket)
PATCH  /api/tickets/:id/status                  (update status)
PATCH  /api/tickets/:id/priority                (update priority)
POST   /api/tickets/:id/resolve                 (resolve)
POST   /api/tickets/:id/close                   (close)
```

---

## Error Responses

### No Token Provided

```javascript
// Request: GET /api/protected
// Response:
{
    "message": "Unauthorized - No token provided",
    "code": 401
}
```

### Invalid Token

```javascript
{
    "message": "Unauthorized - Invalid token",
    "code": 401
}
```

### Token Expired

```javascript
{
    "message": "Unauthorized - Token expired",
    "code": 401
}
```

### User Not Found

```javascript
{
    "message": "Unauthorized - User not found",
    "code": 401
}
```

### Account Inactive

```javascript
{
    "message": "Unauthorized - Account is inactive",
    "code": 401
}
```

### Admin Access Required

```javascript
{
    "message": "Forbidden - Admin access required",
    "code": 403
}
```

---

## Testing Authentication

### Test 1: Get Token (Login)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response includes:
# "token": "eyJhbGciOiJIUzI1NiIs..."
```

### Test 2: Use Token in Cookie

```bash
curl -X GET http://localhost:3000/api/messages/conversations \
  -H "Cookie: token=eyJhbGciOiJIUzI1NiIs..."
```

### Test 3: Use Token in Header

```bash
curl -X GET http://localhost:3000/api/messages/conversations \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### Test 4: Invalid Token

```bash
curl -X GET http://localhost:3000/api/messages/conversations \
  -H "Authorization: Bearer invalid_token"

# Response:
# {"message": "Unauthorized - Invalid token", "code": 401}
```

### Test 5: No Token

```bash
curl -X GET http://localhost:3000/api/messages/conversations

# Response:
# {"message": "Unauthorized - No token provided", "code": 401}
```

---

## Socket.io Authentication

For real-time features, authenticate Socket.io connection:

```javascript
// Client-side
const socket = io("http://localhost:3000", {
  auth: {
    token: localStorage.getItem("token"),
  },
});

// Server-side (server.socket.js)
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    socket.userId = decoded.id;
    socket.tenantId = decoded.tenantId;
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
});
```

---

## Token Refresh Strategy

Since tokens expire in 7 days, implement refresh:

### Option 1: Client Stores Token Locally

```javascript
// After login, store token
localStorage.setItem("token", response.token);

// Use in requests
const token = localStorage.getItem("token");
```

### Option 2: Automatic Token Refresh

```javascript
// Check token expiration before API calls
if (isTokenExpired(token)) {
  const newToken = await refreshToken();
  localStorage.setItem("token", newToken);
}
```

### Option 3: Refresh Token Endpoint (Recommended)

```javascript
// During login, get both access and refresh tokens
{
    "accessToken": "expires in 15 min",
    "refreshToken": "expires in 7 days"
}

// When access token expires, use refresh token to get new one
POST /api/auth/refresh-token
Body: { refreshToken: "..." }
```

---

## Middleware Execution Order

```javascript
import express from "express";
import { authenticateToken } from "./middleware/auth.middleware.js";
import { sendMessage } from "./controllers/message.controller.js";

const router = express.Router();

// Correct order:
// 1. Request comes in
// 2. authenticateToken middleware runs
//    - Validates token
//    - Sets req.user
// 3. Route handler (sendMessage) runs
//    - Can access req.user
router.post("/send", authenticateToken, sendMessage);

export default router;
```

---

## Multi-Tenant Context

The middleware provides tenant isolation:

```javascript
export const getUserTickets = (req, res) => {
  const userId = req.user._id;
  const tenantId = req.user.tenantId;

  // Only fetch tickets for this tenant
  Ticket.find({
    customerId: userId,
    tenantId: tenantId, // ← Tenant isolation
  });
};
```

---

## Security Best Practices

1. **Never expose JWT_SECRET**
   - Keep in .env only
   - Rotate periodically
   - Use different secrets per environment

2. **Use HTTPS in production**
   - Prevents token interception
   - Required for secure cookies

3. **Set secure cookie flags**

   ```javascript
   res.cookie("token", token, {
     httpOnly: true, // Prevents JS access
     secure: true, // HTTPS only
     sameSite: "Strict", // CSRF protection
   });
   ```

4. **Validate token on every request**
   - Already done by middleware
   - Don't skip for performance

5. **Handle token expiration**
   - Redirect to login on 401
   - Implement refresh token strategy

6. **Revoke tokens on logout**
   ```javascript
   res.clearCookie("token");
   ```

---

## Checklist for Setup

- [ ] JWT_SECRET defined in .env
- [ ] Auth controller generates tokens
- [ ] User model has required fields
- [ ] authenticateToken imported in routes
- [ ] Routes wrapped with authenticateToken
- [ ] Controller accesses req.user
- [ ] Error handling for auth failures
- [ ] HTTPS enabled in production
- [ ] Secure cookie flags set
- [ ] Token refresh strategy implemented

---

## Common Issues & Solutions

### Issue: "jwt secret is not available"

**Solution**: Add JWT_SECRET to .env file and restart server

### Issue: Token works in some routes but not others

**Solution**: Check middleware is applied to route:

```javascript
// ❌ WRONG
router.post("/send", sendMessage);

// ✅ CORRECT
router.post("/send", authenticateToken, sendMessage);
```

### Issue: req.user is undefined in controller

**Solution**: Ensure authenticateToken middleware runs before controller

### Issue: Token doesn't work with Authorization header

**Solution**: Verify Bearer token format: `Bearer token_value`

---

**Last Updated**: May 3, 2026
