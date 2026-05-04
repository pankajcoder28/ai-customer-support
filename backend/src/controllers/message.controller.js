import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import { processMessage } from "../services/ai.service.js";

// Send a message in conversation
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    const userId = req.user?._id;
    const tenantId = req.user?.tenantId;

    if (!conversationId || !message) {
      return res
        .status(400)
        .json({ message: "Conversation ID and message are required" });
    }

    // Verify conversation exists and belongs to user
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Process message (AI response + sentiment analysis + potential ticket creation)
    const result = await processMessage(
      conversationId,
      userId,
      tenantId,
      message
    );

    res.status(201).json({
      success: true,
      data: {
        userMessage: result.userMessage,
        aiMessage: result.aiMessage,
        sentiment: result.sentiment,
        ticketCreated: result.ticket ? true : false,
        ticket: result.ticket,
      },
    });
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
};

// Get all messages in a conversation
export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate("userId", "name email");

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

// Get all conversations for a user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user?._id;
    const tenantId = req.user?.tenantId;

    const conversations = await Conversation.find({
      customerId: userId,
      tenantId,
    })
      .sort({ lastMessageAt: -1 })
      .populate("customerId", "name email");

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Get Conversations Error:", error);
    res.status(500).json({
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};

// Create a new conversation
export const createConversation = async (req, res) => {
  try {
    const userId = req.user?._id;
    const tenantId = req.user?.tenantId;

    const conversation = await Conversation.create({
      customerId: userId,
      tenantId,
      status: "open",
      lastMessage: "",
      lastMessageAt: new Date(),
    });

    res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Create Conversation Error:", error);
    res.status(500).json({
      message: "Failed to create conversation",
      error: error.message,
    });
  }
};

// Close a conversation
export const closeConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { status: "closed" },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Close Conversation Error:", error);
    res.status(500).json({
      message: "Failed to close conversation",
      error: error.message,
    });
  }
};
