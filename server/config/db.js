import mongoose from "mongoose";

/**
 * Connects to MongoDB using Mongoose.
 * Falls back to local MongoDB if MONGODB_URI is not set in .env.
 */
export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI; //|| "mongodb://localhost:27017/ai_doc_assistant";

    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Failed: ${error.message}`);
    console.log(
      "Tip: Make sure your MongoDB service is running locally, or set MONGODB_URI in your .env file.",
    );
  }
};
