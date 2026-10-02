import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";

// 1. Define the Structured Output Schema using Zod
// This guarantees that the AI returns exact JSON matching this structure.
const AnalysisSchema = z.object({
  summary: z
    .string()
    .describe(
      "A clear and concise explanation of what this text or document means",
    ),

  actionType: z
    .enum(["CALENDAR_EVENT", "NOTE", "NONE"])
    .describe(
      "Classify whether this input contains an actionable date/event (CALENDAR_EVENT), general information to remember (NOTE), or just general text (NONE)",
    ),

  eventDetails: z
    .object({
      title: z.string().describe("Short title of the event, e.g., 'TCS Test'"),
      date: z
        .string()
        .describe(
          "Event date in YYYY-MM-DD format. Infer the year based on current date.",
        ),
      time: z
        .string()
        .optional()
        .describe(
          "Event time if mentioned (e.g., '10:00 AM', '14:30'), otherwise leave empty",
        ),
      description: z
        .string()
        .describe("Brief description or instructions regarding the event"),
    })
    .optional()
    .describe("Required only if actionType is CALENDAR_EVENT"),

  noteDetails: z
    .object({
      title: z.string().describe("Title for the note"),
      content: z.string().describe("Formatted content of the note"),
      tags: z
        .array(z.string())
        .describe("Relevat tags, e.g., ['exam', 'prep']"),
    })
    .optional()
    .describe("Required only if actionType is NOTE"),
});

/**
 * Initializes the LangChain Gemini model and binds the structured schema.
 */
function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in your .env file!");
  }

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: apiKey,
    temperature: 0.2, // Low temperature for consistent, accurate extraction
  });

  // withStructuredOutput forces the model to respond in our exact Zod schema
  return model.withStructuredOutput(AnalysisSchema);
}

/**
 * Analyzes raw text and returns structured meaning + action intent.
 * @param {string} text - User's input text or extracted document text
 */
export async function analyzeContent(text) {
  const structuredModel = getModel();

  // We provide the current date so the AI can resolve relative dates like "tomorrow" or "next Friday"
  const currentDate = new Date().toISOString().split("T")[0];

  const prompt = `
Today's date is: ${currentDate}.

Analyze the following content carefully:
1. Explain what it means in simple, clear language.
2. Determine if it contains an actionable date/event (e.g. test, exam, meeting, deadline) that should be added to a calendar.
3. If it is important information to save without a specific event date, mark it as a NOTE.
4. Otherwise, mark actionType as NONE.

Content to analyze:
"""
${text}
"""
`;

  const result = await structuredModel.invoke(prompt);
  return result;
}
