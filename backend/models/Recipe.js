const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  ingredients: [String],
  steps: [String],
  image: String,
  cookingTime: String,
  difficulty: String
});

module.exports = mongoose.model("Recipe", recipeSchema);