import express from "express";
import Category from "../models/Category.js";

const router = express.Router();

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get category by ID
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    console.error("Error fetching category:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create category
router.post("/", async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const category = new Category(req.body);
    const savedCategory = await category.save();
    
    res.json({ success: true, message: "Category created successfully", _id: savedCategory._id });
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update category
router.put("/:id", async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, icon, color },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    
    res.json({ success: true, message: "Category updated successfully", ...category.toObject() });
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete category
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
