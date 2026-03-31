import mongoose from "mongoose";
import Admin from "./models/Admin.js";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/quickcook";

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: "Admin" });
    
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }
    
    // Create admin user
    const admin = new Admin({
      username: "Admin",
      email: "admin@gmail.com",
      password: "admin123",
      role: "admin"
    });
    
    await admin.save();
    console.log("Admin user created successfully!");
    console.log("Username: Admin");
    console.log("Password: admin123");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin:", err);
    process.exit(1);
  }
}

seedAdmin();
