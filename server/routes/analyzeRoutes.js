import express from "express";
import { analyzeContent } from "../services/aiService.js";

const router = express.Router();

/**
 * POST /api/analyze/text
 * Analyzes plain text input using the AI service.
 * Body: { "text": "I have a TCS test on 5th October" }
 */
router.post("/text", async (req, res) => {
  try {
    const { text } = req.body;

    // Validate that text was provided
    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid 'text' field in the request body.",
      });
    }

    // Call the LangChain Gemini AI service
    const analysis = await analyzeContent(text);

    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Error analyzing content:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze content.",
    });
  }
});

export default router;
