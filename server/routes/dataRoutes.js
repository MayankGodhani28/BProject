import express from "express";
import Event from "../models/Event.js";
import Note from "../models/Note.js";

const router = express.Router();

/**
 * GET /api/data/events
 * Fetch all saved calendar events, sorted by date (soonest first)
 */
router.get("/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/data/notes
 * Fetch all saved notes, sorted by newest first
 */
router.get("/notes", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/data/events/:id
 * Delete an event by MongoDB _id
 */
router.delete("/events/:id", async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }
    res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/data/notes/:id
 * Delete a note by MongoDB _id
 */
router.delete("/notes/:id", async (req, res) => {
  try {
    const deleted = await Note.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }
    res.status(200).json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
