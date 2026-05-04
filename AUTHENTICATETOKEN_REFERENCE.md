# authenticateToken Middleware - Complete Code Reference

## What authenticateToken Does

The `authenticateToken` middleware is a protective layer that:

1. ✅ Validates JWT tokens are legitimate
2. ✅ Checks tokens haven't expired
3. ✅ Verifies users still exist in database
4. ✅ Confirms accounts are active
5. ✅ Makes user info available to controllers

---

## Middleware Code Structure

```javascript
// Location: backend/src/middleware/auth.middleware.js

export const authenticateToken = async (req, res, next) => {
  try {
    // STEP 1: Get Token
    let token = req.cookies?.token;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized - No token provided",
      });
    }

    // STEP 2: Verify Token (check signature & expiration)
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);

      // STEP 3: Fetch User from Database
      const user = await userModel.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          message: "Unauthorized - User not found",
        });
      }

      // STEP 4: Check Account Status
      if (!user.isActive) {
        return res.status(401).json({
          message: "Unauthorized - Account is inactive",
        });
      }

      // STEP 5: Attach User to Request
      req.user = {
        _id: user._id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        isActive: user.isActive,
        username: user.username,
        avatar: user.avatar,
      };

      // STEP 6: Continue to Next Handler
      next();
    } catch (jwtError) {
      // Handle JWT-specific errors
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Unauthorized - Token expired",
        });
      } else if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({
          message: "Unauthorized - Invalid token",
        });
      }
      throw jwtError;
    }
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({
      message: "Internal server error during authentication",
    });
  }
};
```

---

## Step-by-Step Breakdown

### STEP 1: Extract Token from Request

**Where can token come from?**

```javascript
let token = req.cookies?.token;

if (!token) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7); // Remove 'Bearer ' prefix
  }
}
```

**Examples:**

- ✅ `req.cookies.token = "eyJhbGci..."`
- ✅ `req.headers.authorization = "Bearer eyJhbGci..."`
- ❌ No token → 401 error

**Client sending token in header:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                      ↑
                  Added "Bearer "
```

**Client sending token in cookie:**

```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### STEP 2: Verify Token Signature & Expiration

```javascript
const decoded = jwt.verify(token, config.JWT_SECRET);
```

**What it checks:**

- ✅ Token signature is valid (not tampered with)
- ✅ Token uses correct secret (JWT_SECRET)
- ✅ Token hasn't expired (exp < now)

**Errors caught:**

```
TokenExpiredError     → "Unauthorized - Token expired"
JsonWebTokenError     → "Unauthorized - Invalid token"
```

**How JWT expiration works:**

```javascript
// When token is created:
jwt.sign(payload, secret, { expiresIn: '7d' })

// Token includes:
{
  iat: 1715000000,    // Created at this timestamp
  exp: 1715604000     // Expires at this timestamp
}

// If current time > exp time:
// → TokenExpiredError → 401 response
```

---

### STEP 3: Fetch User from Database

```javascript
const user = await userModel.findById(decoded.id);

if (!user) {
  return res.status(401).json({
    message: "Unauthorized - User not found",
  });
}
```

**What happens:**

- 🔍 Looks up user using ID from token payload
- ✅ Gets full user document with all fields
- ❌ If user deleted/not found → 401 error

**Why fetch user again?**

- Token might contain old user.\_id
- User might have been deleted
- Need current user data for permission checks
- Need to verify user still belongs to tenant

---

### STEP 4: Check Account Status

```javascript
if (!user.isActive) {
  return res.status(401).json({
    message: "Unauthorized - Account is inactive",
  });
}
```

**What's checked:**

- User.isActive === true (account enabled)
- ✅ Allows active users
- ❌ Blocks deactivated accounts

**Use cases:**

- User suspension
- Account deletion (soft delete)
- Admin deactivated user

---

### STEP 5: Attach User to Request Object

```javascript
req.user = {
  _id: user._id,
  email: user.email,
  role: user.role,
  tenantId: user.tenantId,
  isActive: user.isActive,
  username: user.username,
  avatar: user.avatar,
};
```

**Now available in controller:**

```javascript
export const sendMessage = (req, res) => {
  console.log(req.user._id); // "507f1f77bcf86cd799439011"
  console.log(req.user.email); // "user@example.com"
  console.log(req.user.role); // "customer"
  console.log(req.user.tenantId); // "507f1f77bcf86cd799439012"
  // ... rest of code
};
```

---

### STEP 6: Continue to Next Handler

```javascript
next();
```

**What happens:**

- ✅ Middleware completes successfully
- ✅ Request continues to controller
- ✅ Controller receives authenticated request with req.user

**If any error before this:**

- ❌ Returns error response
- ❌ Never calls next()
- ❌ Controller never runs

---

## Route Integration

### How authenticateToken Connects to Routes

```javascript
// routes/message.routes.js
import { authenticateToken } from "../middleware/auth.middleware.js";
import { sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

// Middleware → Controller
router.post("/send", authenticateToken, sendMessage);
//             ↑      ↑                  ↑
//             path   middleware         controller
```

**Execution order:**

```
1. Request: POST /api/messages/send
        ↓
2. authenticateToken runs
   ├─ Validates token
   ├─ Sets req.user
   ├─ Calls next()
        ↓
3. sendMessage controller runs
   ├─ Accesses req.user
   ├─ Processes message
   └─ Returns response
```

---

## Error Responses

### Table: All Possible Errors

| Condition                   | Status | Response                                        |
| --------------------------- | ------ | ----------------------------------------------- |
| No token in request         | 401    | `"Unauthorized - No token provided"`            |
| Token format wrong          | 401    | `"Unauthorized - Invalid token"`                |
| Token signature invalid     | 401    | `"Unauthorized - Invalid token"`                |
| Token expired (>7 days old) | 401    | `"Unauthorized - Token expired"`                |
| User doesn't exist in DB    | 401    | `"Unauthorized - User not found"`               |
| User.isActive = false       | 401    | `"Unauthorized - Account is inactive"`          |
| Server error during auth    | 500    | `"Internal server error during authentication"` |

### Example Error Response

```json
{
  "message": "Unauthorized - Token expired",
  "code": 401
}
```

---

## What User Object Contains

After successful authentication, `req.user` contains:

```javascript
{
  _id: ObjectId,           // MongoDB user ID
  email: String,           // User email
  role: String,            // "admin" or "customer"
  tenantId: ObjectId,      // Organization ID
  isActive: Boolean,       // Account enabled/disabled
  username: String,        // Username
  avatar: String           // Avatar URL
}
```

### Used in Controllers

```javascript
export const getProfile = async (req, res) => {
  // Available from authentication:
  const userId = req.user._id; // "507f1f77bcf86cd799439011"
  const userEmail = req.user.email; // "user@example.com"
  const userRole = req.user.role; // "customer"
  const tenantId = req.user.tenantId; // "507f1f77bcf86cd799439012"

  // Use for queries:
  const messages = await Message.find({
    userId: req.user._id, // ← From req.user
    tenantId: req.user.tenantId, // ← From req.user
  });

  res.json({ profile: req.user });
};
```

---

## Token vs User vs Request Flow

```
┌──────────────────────────────────┐
│  JWT Token (encrypted string)    │
├──────────────────────────────────┤
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │
│ (contains: id, tenantId, iat, exp) │
└────────────────┬─────────────────┘
                 │ Decrypt with JWT_SECRET
                 ↓
┌──────────────────────────────────┐
│  Decoded Token (plain object)    │
├──────────────────────────────────┤
│ {                                │
│   id: "507f1f77bcf86cd799439011",│
│   tenantId: "507f1f77bcf86cd799439012",
│   iat: 1715000000,               │
│   exp: 1715604000                │
│ }                                │
└────────────────┬─────────────────┘
                 │ Fetch from DB using decoded.id
                 ↓
┌──────────────────────────────────┐
│  User Document (from MongoDB)    │
├──────────────────────────────────┤
│ {                                │
│   _id: "507f1f77bcf86cd799439011",
│   email: "user@example.com",     │
│   password: "hashed...",         │
│   role: "customer",              │
│   tenantId: "507f1f77bcf86cd799439012",
│   isActive: true,                │
│   username: "john_doe",          │
│   avatar: "url...",              │
│   createdAt: Date,               │
│   updatedAt: Date                │
│ }                                │
└────────────────┬─────────────────┘
                 │ Extract safe fields
                 ↓
┌──────────────────────────────────┐
│  req.user (attached to request)  │
├──────────────────────────────────┤
│ {                                │
│   _id: "507f1f77bcf86cd799439011",
│   email: "user@example.com",     │
│   role: "customer",              │
│   tenantId: "507f1f77bcf86cd799439012",
│   isActive: true,                │
│   username: "john_doe",          │
│   avatar: "url..."               │
│ }                                │
│                                  │
│ Available in controller as:      │
│ req.user._id                     │
│ req.user.email                   │
│ req.user.tenantId                │
│ ... etc                          │
└──────────────────────────────────┘
```

---

## Quick Reference: Using in Controllers

### Template for Protected Controller

```javascript
export const myProtectedController = async (req, res) => {
  try {
    // req.user is automatically available
    const userId = req.user._id; // ✅ Use for user-specific data
    const tenantId = req.user.tenantId; // ✅ Use for tenant isolation
    const userRole = req.user.role; // ✅ Use for role checks

    // Example: Fetch user's messages
    const messages = await Message.find({
      userId, // ← From req.user
      tenantId, // ← From req.user
    });

    // Example: Create record for user
    const ticket = await Ticket.create({
      customerId: userId, // ← From req.user
      tenantId, // ← From req.user
      title: req.body.title,
    });

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
```

### Accessing req.user in Different Situations

```javascript
// Getting user ID
const userId = req.user._id;

// Getting tenant for isolation
const messages = await Message.find({ tenantId: req.user.tenantId });

// Checking role
if (req.user.role === "admin") {
  // Admin-only code
}

// Getting email for notifications
await sendEmail(req.user.email, "Your ticket...");

// Building audit log
console.log(`User ${req.user.username} created ticket`);
```

---

## Summary

**authenticateToken:**

- ✅ Is a middleware function
- ✅ Validates JWT tokens from cookies or headers
- ✅ Fetches user from database
- ✅ Checks account status
- ✅ Sets req.user with user data
- ✅ Allows controllers to use req.user
- ✅ Returns 401 errors for auth failures
- ✅ Calls next() to continue if valid

**Requirements:**

- JWT_SECRET in .env
- Valid user in database
- User.isActive = true
- Token not expired

**Usage:**

- Add to routes: `router.post('/path', authenticateToken, controller)`
- Use in controllers: `req.user._id`, `req.user.tenantId`

**Status**: ✅ Ready to use with all routes

---

**Created**: May 3, 2026  
**Last Updated**: Complete Implementation
