import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { processMessage } from "../services/ai.service.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"],
  },
});

// Store active connections by user
const activeConnections = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Join user to their conversation room
  socket.on("join-conversation", (data) => {
    const { conversationId, userId } = data;
    socket.join(`conversation-${conversationId}`);
    activeConnections.set(socket.id, { conversationId, userId });
    console.log(`User ${userId} joined conversation ${conversationId}`);

    socket.emit("joined-conversation", {
      success: true,
      message: "Connected to conversation",
    });
  });

  // Handle incoming messages
  socket.on("send-message", async (data) => {
    try {
      const { conversationId, message, userId, tenantId } = data;
      const roomId = `conversation-${conversationId}`;

      // Process the message (AI response + sentiment analysis)
      const result = await processMessage(
        conversationId,
        userId,
        tenantId,
        message
      );

      // Emit to all users in the conversation
      io.to(roomId).emit("new-message", {
        success: true,
        userMessage: result.userMessage,
        aiMessage: result.aiMessage,
        sentiment: result.sentiment,
        ticketCreated: result.ticket ? true : false,
        ticket: result.ticket,
      });

      // If ticket was created, notify admins
      if (result.ticket) {
        io.emit("ticket-created", {
          ticket: result.ticket,
          reason: "Negative sentiment detected",
          conversationId,
        });
      }
    } catch (error) {
      console.error("Send Message Error:", error);
      socket.emit("message-error", {
        success: false,
        message: "Failed to send message",
        error: error.message,
      });
    }
  });

  

  // Handle disconnect
  socket.on("disconnect", () => {
    const connectionInfo = activeConnections.get(socket.id);
    if (connectionInfo) {
      console.log(
        `User ${connectionInfo.userId} left conversation ${connectionInfo.conversationId}`
      );
    }
    activeConnections.delete(socket.id);
    console.log("Client disconnected:", socket.id);
  });

  // Error handling
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

httpServer.listen(3000, () => {
  console.log("server is running on port 3000");
});