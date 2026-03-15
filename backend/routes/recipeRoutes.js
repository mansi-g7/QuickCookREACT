const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");

// Add Recipe
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Validation
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }

    const recipe = new Recipe(req.body);
    const savedRecipe = await recipe.save();
    
    res.json({ 
      success: true, 
      message: "Recipe added successfully",
      _id: savedRecipe._id
    });
  } catch (err) {
    console.error("Error adding recipe:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Recipes
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    console.error("Error fetching recipes:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;