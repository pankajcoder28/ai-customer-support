import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import Sentiment from "sentiment";
import { config } from "../config/config.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import Ticket from "../models/ticket.model.js";

const openaiModel = new ChatOpenAI({
  model: "gpt-3.5-turbo",
  apiKey: config.OPENAI_API_KEY,
  temperature: 0.7,
});

const sentimentAnalyzer = new Sentiment();

// Analyze sentiment and determine if it's negative
export const analyzeSentiment = (text) => {
  const result = sentimentAnalyzer.analyze(text);
  // Negative sentiment has a score < -1
  const isNegative = result.score < -1;
  return {
    score: result.score,
    isNegative,
    comparative: result.comparative,
  };
};

// Get AI response for customer message
export const getAIResponse = async (userMessage, conversationHistory = []) => {
  try {
    const systemPrompt = new SystemMessage(
      `You are a helpful and empathetic customer support AI assistant. 
      Your role is to help customers with their issues, answer questions, and provide excellent service.
      Be professional, friendly, and solution-oriented.
      Keep responses concise and clear.`
    );

    const messages = [
      systemPrompt,
      ...conversationHistory.map((msg) =>
        msg.sender === "user"
          ? new HumanMessage(msg.text)
          : new HumanMessage(`Agent: ${msg.text}`)
      ),
      new HumanMessage(userMessage),
    ];

    const response = await openaiModel.invoke(messages);
    return response.content;
  } catch (error) {
    console.error("AI Service Error:", error);
    throw new Error("Failed to get AI response");
  }
};

// Process incoming message, analyze sentiment, and create ticket if needed
export const processMessage = async (
  conversationId,
  userId,
  tenantId,
  userMessage
) => {
  try {
    // Analyze sentiment
    const sentiment = analyzeSentiment(userMessage);

    // Save user message to database
    const savedUserMessage = await Message.create({
      text: userMessage,
      sender: "user",
      conversationId,
      tenantId,
      userId,
    });

    // Get conversation history for context
    const conversationHistory = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("text sender")
      .lean();

    // Reverse to get chronological order
    conversationHistory.reverse();

    // Get AI response
    const aiResponse = await getAIResponse(userMessage, conversationHistory);

    // Save AI message
    const savedAIMessage = await Message.create({
      text: aiResponse,
      sender: "ai",
      conversationId,
      tenantId,
    });

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: userMessage.substring(0, 100),
      lastMessageAt: new Date(),
    });

    // If sentiment is negative, create a ticket
    let ticket = null;
    if (sentiment.isNegative) {
      ticket = await createTicketFromNegativeSentiment(
        userId,
        tenantId,
        userMessage,
        conversationId
      );
    }

    return {
      userMessage: savedUserMessage,
      aiMessage: savedAIMessage,
      sentiment,
      ticket,
    };
  } catch (error) {
    console.error("Process Message Error:", error);
    throw error;
  }
};

// Create ticket when negative sentiment is detected
export const createTicketFromNegativeSentiment = async (
  customerId,
  tenantId,
  messageContent,
  conversationId
) => {
  try {
    const ticket = await Ticket.create({
      title: `Customer Support: ${messageContent.substring(0, 50)}...`,
      description: `Ticket auto-created due to negative sentiment detected in customer message.\n\nOriginal message:\n${messageContent}\n\nConversation ID: ${conversationId}`,
      customerId,
      tenantId,
      priority: "high",
      status: "open",
    });

    // Update conversation status to pending
    await Conversation.findByIdAndUpdate(conversationId, {
      status: "pending",
    });

    return ticket;
  } catch (error) {
    console.error("Create Ticket Error:", error);
    throw error;
  }
};

export default {
  analyzeSentiment,
  getAIResponse,
  processMessage,
  createTicketFromNegativeSentiment,
};

