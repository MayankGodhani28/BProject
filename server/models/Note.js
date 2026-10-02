import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Note content is required"],
    },
    tags: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      default: "text_input", // e.g. "text_input" or "file: notes.jpg"
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

export default mongoose.model("Note", NoteSchema);
