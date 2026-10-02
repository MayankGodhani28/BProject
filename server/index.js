import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import analyzeRoutes from "./routes/analyzeRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic test route
app.get("/", (req, res) => {
  res.json({ message: "AI Document Assistant Server is running!" });
});

// API Routes
app.use("/api/analyze", analyzeRoutes);
app.use("/api/data", dataRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
