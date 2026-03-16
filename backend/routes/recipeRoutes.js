import express from "express";
import Recipe from "../models/Recipe.js";

const router = express.Router();

// Add Recipe
router.post("/", async (req, res) => {
  try {
    const { name, description, category, ingredients, instructions, cookingTime, servings, difficulty, image, isPublished } = req.body;
    
    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Recipe name is required" });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: "Description is required" });
    }
    if (!category) {
      return res.status(400).json({ success: false, message: "Category is required" });
    }

    const recipe = new Recipe({
      name: name.trim(),
      description: description.trim(),
      category,
      ingredients: Array.isArray(ingredients) ? ingredients : (ingredients ? ingredients.split('\n').filter(i => i.trim()) : []),
      instructions: instructions ? instructions.trim() : "",
      cookingTime: parseInt(cookingTime) || 30,
      servings: parseInt(servings) || 4,
      difficulty: difficulty || "Medium",
      image: image || null,
      isPublished: isPublished !== undefined ? isPublished : true,
      createdAt: new Date()
    });

    const savedRecipe = await recipe.save();
    
    res.json({ 
      success: true, 
      message: "Recipe added successfully",
      recipe: savedRecipe
    });
  } catch (err) {
    console.error("Error adding recipe:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Recipes
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('category');
    res.json(recipes);
  } catch (err) {
    console.error("Error fetching recipes:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Recipe by ID
router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('category');
    if (!recipe) {
      return res.status(404).json({ success: false, message: "Recipe not found" });
    }
    res.json(recipe);
  } catch (err) {
    console.error("Error fetching recipe:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Recipe
router.put("/:id", async (req, res) => {
  try {
    const { name, description, category, ingredients, instructions, cookingTime, servings, difficulty, image, isPublished } = req.body;
    
    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Recipe name is required" });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: "Description is required" });
    }
    if (!category) {
      return res.status(400).json({ success: false, message: "Category is required" });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        description: description.trim(),
        category,
        ingredients: Array.isArray(ingredients) ? ingredients : (ingredients ? ingredients.split('\n').filter(i => i.trim()) : []),
        instructions: instructions ? instructions.trim() : "",
        cookingTime: parseInt(cookingTime) || 30,
        servings: parseInt(servings) || 4,
        difficulty: difficulty || "Medium",
        image: image || null,
        isPublished: isPublished !== undefined ? isPublished : true,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('category');

    if (!updatedRecipe) {
      return res.status(404).json({ success: false, message: "Recipe not found" });
    }

    res.json({ 
      success: true, 
      message: "Recipe updated successfully",
      recipe: updatedRecipe
    });
  } catch (err) {
    console.error("Error updating recipe:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Recipe
router.delete("/:id", async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    
    if (!deletedRecipe) {
      return res.status(404).json({ success: false, message: "Recipe not found" });
    }

    res.json({ 
      success: true, 
      message: "Recipe deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting recipe:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;