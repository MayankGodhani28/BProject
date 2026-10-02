import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Event date is required (YYYY-MM-DD)"],
      trim: true,
    },
    time: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    summary: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      default: "text_input", // e.g. "text_input" or "file: exam.pdf"
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

export default mongoose.model("Event", EventSchema);
