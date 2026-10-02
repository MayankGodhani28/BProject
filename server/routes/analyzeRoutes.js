import express from "express";
import multer from "multer";
import { analyzeContent, analyzeFile } from "../services/aiService.js";
import Event from "../models/Event.js";
import Note from "../models/Note.js";

const router = express.Router();

/**
 * Helper function to automatically persist AI results to MongoDB
 */
async function saveAnalysisToDatabase(analysis, source) {
  try {
    if (analysis.actionType === "CALENDAR_EVENT" && analysis.eventDetails) {
      const newEvent = await Event.create({
        title: analysis.eventDetails.title,
        date: analysis.eventDetails.date,
        time: analysis.eventDetails.time || "",
        description: analysis.eventDetails.description || "",
        summary: analysis.summary,
        source: source,
      });
      console.log(`Saved new Event to MongoDB: "${newEvent.title}" on ${newEvent.date}`);
      return { type: "EVENT", record: newEvent };
    }

    if (analysis.actionType === "NOTE" && analysis.noteDetails) {
      const newNote = await Note.create({
        title: analysis.noteDetails.title,
        content: analysis.noteDetails.content,
        tags: analysis.noteDetails.tags || [],
        summary: analysis.summary,
        source: source,
      });
      console.log(`Saved new Note to MongoDB: "${newNote.title}"`);
      return { type: "NOTE", record: newNote };
    }

    return null;
  } catch (dbError) {
    console.error("Database save warning:", dbError.message);
    return null; // Return null so API still responds even if DB save encountered an issue
  }
}

// Configure multer to hold uploaded files in memory as Buffers (max 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    // Allowed file types: PDFs and images
    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Unsupported file type. Please upload a PDF or an image (JPEG, PNG, WEBP)."
        ),
        false
      );
    }
  },
});

/**
 * POST /api/analyze/text
 * Analyzes plain text input using the AI service.
 * Body: { "text": "I have a TCS test on 5th October" }
 */
router.post("/text", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid 'text' field in the request body.",
      });
    }

    const analysis = await analyzeContent(text);
    const saved = await saveAnalysisToDatabase(analysis, "text_input");

    return res.status(200).json({
      success: true,
      data: analysis,
      saved: saved, // Contains MongoDB record details with _id
    });
  } catch (error) {
    console.error("Error analyzing text:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze content.",
    });
  }
});

/**
 * POST /api/analyze/file
 * Accepts an uploaded PDF or document photo via multipart/form-data.
 * Field name: 'file'
 */
router.post("/file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file was uploaded. Please attach a PDF or image in the 'file' field.",
      });
    }

    console.log(`Received file: ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`);

    // Call the AI service with file buffer and mime type
    const analysis = await analyzeFile(req.file.buffer, req.file.mimetype);
    const saved = await saveAnalysisToDatabase(
      analysis,
      `file: ${req.file.originalname}`
    );

    return res.status(200).json({
      success: true,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      data: analysis,
      saved: saved, // Contains MongoDB record details with _id
    });
  } catch (error) {
    console.error("Error analyzing file:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze uploaded file.",
    });
  }
});

export default router;

