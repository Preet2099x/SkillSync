import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";

// Load Environment Variables
dotenv.config();

// Connect Database
connectDB();

// Initialize Express App
const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request body
app.use(morgan("dev")); // Log HTTP requests

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send({ message: "Great Success!" });
});

// Handle Unmatched Routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ success: false, message: "Internal Server Error." });
});

// Start Server
const PORT = process.env.PORT || 3000;
const DEV_MODE = process.env.DEV_MODE || "production";

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${DEV_MODE} mode on http://localhost:${PORT}`);
});
