export const parseIngredients = (ingredientsText) => {
  return ingredientsText
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

export const validateRecipeAdminForm = (recipeForm, selectedCategory) => {
  const errors = {};
  const name = (recipeForm.name || '').trim();
  const description = (recipeForm.description || '').trim();
  const instructions = (recipeForm.instructions || '').trim();
  const ingredientsArray = parseIngredients(recipeForm.ingredients || '');
  const cookingTime = Number(recipeForm.cookingTime);
  const servings = Number(recipeForm.servings);
  const difficulty = recipeForm.difficulty;

  if (!name) {
    errors.name = 'Recipe name is required.';
  } else if (name.length < 2) {
    errors.name = 'Recipe name must be at least 2 characters.';
  }

  if (!description) {
    errors.description = 'Description is required.';
  } else if (description.length < 10) {
    errors.description = 'Description must be at least 10 characters.';
  }

  if (!selectedCategory) {
    errors.category = 'Please select a category.';
  }

  if (ingredientsArray.length === 0) {
    errors.ingredients = 'Please add at least one ingredient.';
  }

  if (!instructions) {
    errors.instructions = 'Instructions are required.';
  } else if (instructions.length < 10) {
    errors.instructions = 'Instructions must be at least 10 characters.';
  }

  if (recipeForm.cookingTime !== '' && (!Number.isFinite(cookingTime) || cookingTime <= 0)) {
    errors.cookingTime = 'Cooking time must be a positive number.';
  }

  if (recipeForm.servings !== '' && (!Number.isFinite(servings) || servings <= 0)) {
    errors.servings = 'Servings must be a positive number.';
  }

  if (!difficulty) {
    errors.difficulty = 'Please select difficulty.';
  }

  return errors;
};

export const validateCategoryAdminForm = (categoryForm) => {
  const errors = {};
  const name = (categoryForm.name || '').trim();
  const description = (categoryForm.description || '').trim();

  if (!name) {
    errors.name = 'Category name is required.';
  } else if (name.length < 2) {
    errors.name = 'Category name must be at least 2 characters.';
  }

  // Description is optional now, but if provided, must be at least 5 characters
  if (description && description.length < 5) {
    errors.description = 'Description must be at least 5 characters (or leave empty).';
  }

  if (!categoryForm.icon) {
    errors.icon = 'Please select an icon.';
  }

  if (!categoryForm.color) {
    errors.color = 'Please select a color.';
  }

  return errors;
};
