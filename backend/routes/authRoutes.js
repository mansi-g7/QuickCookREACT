import express from "express";
import Admin from "../models/Admin.js";

const router = express.Router();

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Username and password are required" 
      });
    }

    // Find admin by username
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Check password (you might want to use bcrypt for hashing in production)
    if (admin.password !== password) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Generate token (simple JWT token for now)
    const token = `admin_token_${admin._id}_${Date.now()}`;

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role || "admin"
      }
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Register (optional)
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false, 
        message: "Username already exists" 
      });
    }

    // Create new admin
    const admin = new Admin({ username, email, password });
    await admin.save();

    // Generate token
    const token = `admin_token_${admin._id}_${Date.now()}`;

    res.json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role || "admin"
      }
    });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get current user
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "No token provided" 
      });
    }

    // Parse token to get admin ID (simple implementation)
    const idMatch = token.match(/admin_token_(.+?)_/);
    
    if (!idMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
    }

    const admin = await Admin.findById(idMatch[1]);
    
    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: "Admin not found" 
      });
    }

    res.json({
      success: true,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role || "admin"
      }
    });
  } catch (err) {
    console.error("Error fetching current user:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
