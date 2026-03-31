import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// Load environment variables
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/quickcook";
const PORT = process.env.BACKEND_PORT || 5000;

import recipeRoutes from "./routes/recipeRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import contactMessageRoutes from "./routes/contactMessageRoutes.js";

const app = express();

console.log("Starting server...");
console.log("MongoDB URI:", MONGODB_URI);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contact-messages", contactMessageRoutes);

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });

    console.log("✓ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("✗ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

startServer();