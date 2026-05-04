import express from "express";
import {
  sendMessage,
  getConversationMessages,
  getConversations,
  createConversation,
  closeConversation,
} from "../controllers/message.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Middleware to protect routes
router.use(authenticateToken);

// Conversation routes
router.post("/conversations", createConversation);
router.get("/conversations", getConversations);
router.get("/conversations/:conversationId/messages", getConversationMessages);
router.post("/conversations/:conversationId/close", closeConversation);

// Message routes
router.post("/send", sendMessage);

export default router;
