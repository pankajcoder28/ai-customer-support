# Frontend Integration Guide - Chat System

## Installation

### 1. Install Socket.io Client

```bash
cd frontend
npm install socket.io-client
```

### 2. Create Socket Service

Create `src/services/socketService.js`:

```javascript
import io from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:3000";

class SocketService {
  socket = null;

  connect(token) {
    this.socket = io(SOCKET_SERVER_URL, {
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket.id);
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  joinConversation(conversationId, userId) {
    this.socket.emit("join-conversation", {
      conversationId,
      userId,
    });
  }

  sendMessage(conversationId, message, userId, tenantId) {
    this.socket.emit("send-message", {
      conversationId,
      message,
      userId,
      tenantId,
    });
  }

  onNewMessage(callback) {
    this.socket.on("new-message", callback);
  }

  onJoinedConversation(callback) {
    this.socket.on("joined-conversation", callback);
  }

  onTicketCreated(callback) {
    this.socket.on("ticket-created", callback);
  }

  onMessageError(callback) {
    this.socket.on("message-error", callback);
  }

  sendTyping(conversationId, userId) {
    this.socket.emit("user-typing", {
      conversationId,
      userId,
    });
  }

  stopTyping(conversationId, userId) {
    this.socket.emit("user-stopped-typing", {
      conversationId,
      userId,
    });
  }

  onUserTyping(callback) {
    this.socket.on("user-is-typing", callback);
  }

  onUserStoppedTyping(callback) {
    this.socket.on("user-stopped-typing", callback);
  }

  removeListener(event) {
    this.socket.off(event);
  }
}

export default new SocketService();
```

## Frontend Components

### 1. Chat Component

Create `src/features/chat/pages/Chat.jsx`:

```javascript
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import socketService from "../../../services/socketService";
import MessageItem from "../components/MessageItem";
import "../styles/chat.css";

const Chat = () => {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Load conversation messages
    fetchMessages();

    // Join conversation
    const userId = localStorage.getItem("userId");
    socketService.joinConversation(conversationId, userId);

    // Setup Socket.io listeners
    socketService.onNewMessage(handleNewMessage);
    socketService.onMessageError(handleMessageError);
    socketService.onUserTyping(handleUserTyping);
    socketService.onUserStoppedTyping(handleUserStoppedTyping);

    return () => {
      socketService.removeListener("new-message");
      socketService.removeListener("message-error");
      socketService.removeListener("user-is-typing");
      socketService.removeListener("user-stopped-typing");
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/messages/conversations/${conversationId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await response.json();
      setMessages(data.data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleNewMessage = (data) => {
    if (data.userMessage) {
      setMessages((prev) => [...prev, data.userMessage]);
    }
    if (data.aiMessage) {
      setMessages((prev) => [...prev, data.aiMessage]);
    }

    if (data.ticketCreated) {
      showTicketNotification(data.ticket);
    }
    setLoading(false);
  };

  const handleMessageError = (error) => {
    alert("Error sending message: " + error.message);
    setLoading(false);
  };

  const handleUserTyping = (data) => {
    setTypingUsers((prev) => new Set(prev).add(data.userId));
  };

  const handleUserStoppedTyping = (data) => {
    setTypingUsers((prev) => {
      const updated = new Set(prev);
      updated.delete(data.userId);
      return updated;
    });
  };

  const showTicketNotification = (ticket) => {
    alert(
      `Support Ticket Created!\n\nYour concern has been escalated to our support team.\n\nTicket ID: ${ticket._id}\nPriority: ${ticket.priority}\n\nA support agent will be with you shortly.`,
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);

    // Send typing indicator
    const userId = localStorage.getItem("userId");
    socketService.sendTyping(conversationId, userId);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(conversationId, userId);
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    setLoading(true);
    const userId = localStorage.getItem("userId");
    const tenantId = localStorage.getItem("tenantId");

    socketService.sendMessage(conversationId, inputValue, userId, tenantId);

    setInputValue("");
    socketService.stopTyping(conversationId, userId);
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((msg) => (
          <MessageItem key={msg._id} message={msg} />
        ))}
        {typingUsers.size > 0 && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span> Agent is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-form">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !inputValue.trim()}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default Chat;
```

### 2. Message Item Component

Create `src/features/chat/components/MessageItem.jsx`:

```javascript
import React from "react";
import { formatDistanceToNow } from "date-fns";
import "../styles/message-item.css";

const MessageItem = ({ message }) => {
  const isUserMessage = message.sender === "user";
  const isAiMessage = message.sender === "ai";

  return (
    <div className={`message-item ${message.sender}`}>
      <div className="message-content">
        <p className="message-text">{message.text}</p>
        <span className="message-time">
          {formatDistanceToNow(new Date(message.createdAt), {
            addSuffix: true,
          })}
        </span>
      </div>
      {isAiMessage && <span className="message-badge">AI Support</span>}
      {isUserMessage && <span className="message-badge">You</span>}
    </div>
  );
};

export default MessageItem;
```

### 3. Conversations List

Create `src/features/chat/pages/ConversationsList.jsx`:

```javascript
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/conversations-list.css";

const ConversationsList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/messages/conversations",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await response.json();
      setConversations(data.data || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversation = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/messages/conversations",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();
      navigate(`/chat/${data.data._id}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  if (loading) return <div>Loading conversations...</div>;

  return (
    <div className="conversations-container">
      <div className="conversations-header">
        <h2>Your Conversations</h2>
        <button onClick={handleCreateConversation} className="new-chat-btn">
          New Chat
        </button>
      </div>

      <div className="conversations-list">
        {conversations.length === 0 ? (
          <p>No conversations yet. Start a new chat!</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv._id}
              className="conversation-item"
              onClick={() => navigate(`/chat/${conv._id}`)}
            >
              <div className="conversation-preview">
                <p className="conversation-last-message">{conv.lastMessage}</p>
                <span className={`conversation-status ${conv.status}`}>
                  {conv.status}
                </span>
              </div>
              <span className="conversation-time">
                {new Date(conv.lastMessageAt).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationsList;
```

## Styling

Create `src/features/chat/styles/chat.css`:

```css
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
  background: #f5f5f5;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-input-form {
  display: flex;
  gap: 10px;
  padding: 15px;
  background: white;
  border-top: 1px solid #ddd;
}

.message-input-form input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.message-input-form button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.message-input-form button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #999;
  font-size: 12px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #999;
  animation: pulse 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%,
  60%,
  100% {
    opacity: 0.3;
  }
  30% {
    opacity: 1;
  }
}
```

Create `src/features/chat/styles/message-item.css`:

```css
.message-item {
  display: flex;
  gap: 10px;
  margin: 10px 0;
}

.message-item.user {
  justify-content: flex-end;
}

.message-item.ai {
  justify-content: flex-start;
}

.message-content {
  max-width: 60%;
  padding: 12px 15px;
  border-radius: 8px;
  background: white;
}

.message-item.user .message-content {
  background: #007bff;
  color: white;
  border-bottom-right-radius: 2px;
}

.message-item.ai .message-content {
  background: #e9ecef;
  color: #333;
  border-bottom-left-radius: 2px;
}

.message-text {
  margin: 0;
  word-wrap: break-word;
}

.message-time {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 5px;
  display: block;
}

.message-badge {
  font-size: 11px;
  text-transform: uppercase;
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}
```

## Usage

1. **Initialize Socket Connection** in your App component or auth context:

```javascript
import socketService from "./services/socketService";

useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    socketService.connect(token);
  }

  return () => {
    socketService.disconnect();
  };
}, []);
```

2. **Add Routes**:

```javascript
import Chat from './features/chat/pages/Chat';
import ConversationsList from './features/chat/pages/ConversationsList';

<Route path="/conversations" element={<ConversationsList />} />
<Route path="/chat/:conversationId" element={<Chat />} />
```

## Testing

Use these curl commands to test the chat system:

```bash
# Create conversation
curl -X POST http://localhost:3000/api/messages/conversations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"

# Send message
curl -X POST http://localhost:3000/api/messages/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "<conv_id>",
    "message": "I am very frustrated with your service!"
  }'

# Check if ticket was created (sentiment negative)
curl -X GET http://localhost:3000/api/tickets/customer \
  -H "Authorization: Bearer <token>"
```

## Environment Variables

Create `.env` in frontend root:

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

Update API calls to use:

```javascript
const API_URL = import.meta.env.VITE_API_URL;
```
