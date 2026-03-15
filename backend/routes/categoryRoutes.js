const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

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

module.exports = router;
