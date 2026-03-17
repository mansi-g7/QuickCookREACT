import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// Load environment variables
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/quickcook";
const PORT = process.env.BACKEND_PORT || 5000;

import recipeRoutes from "./routes/recipeRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

console.log("Starting server...");
console.log("MongoDB URI:", MONGODB_URI);

app.use(cors());
app.use(express.json());

// Connect to MongoDB with timeout
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000
})
.then(()=>console.log("✓ MongoDB Connected"))
.catch(err=>{
  console.log("✗ MongoDB connection error (continuing anyway):", err.message);
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/categories", categoryRoutes);

app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});