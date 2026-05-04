import express from "express";
import { getAIResponse, analyzeSentiment } from "../services/ai.service.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Test AI response endpoint
router.post("/test-response", authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const response = await getAIResponse(message);

    res.status(200).json({
      success: true,
      data: {
        userMessage: message,
        aiResponse: response,
      },
    });
  } catch (error) {
    console.error("AI Test Response Error:", error);
    res.status(500).json({
      message: "Failed to get AI response",
      error: error.message,
    });
  }
});

// Sentiment analysis endpoint
router.post("/analyze-sentiment", authenticateToken, (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const sentiment = analyzeSentiment(message);

    res.status(200).json({
      success: true,
      data: {
        message,
        sentiment: {
          score: sentiment.score,
          isNegative: sentiment.isNegative,
          comparative: sentiment.comparative,
        },
      },
    });
  } catch (error) {
    console.error("Sentiment Analysis Error:", error);
    res.status(500).json({
      message: "Failed to analyze sentiment",
      error: error.message,
    });
  }
});

export default router;
