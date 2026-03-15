import axios from 'axios';

// Base URL for API (works with Vite)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ======== AUTH SERVICES ========

export const authService = {
  login: async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminName', response.data.user.username);
        localStorage.setItem('adminRole', response.data.user.role);
      }
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  register: async (username, email, password) => {
    try {
      const response = await apiClient.post('/auth/register', { username, email, password });
      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminRole');
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }
};

// ======== RECIPE SERVICES ========
export const recipeService = {
  // Add recipe (simple method for form submission)
  addRecipe: async (data) => {
    try {
      const response = await apiClient.post('/recipes', data);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  // Get all recipes (used by user page)
  getRecipes: async () => {
    try {
      const response = await apiClient.get('/recipes');
      return response.data;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return [];
    }
  },

  // Get all recipes with filters
  getAllRecipes: async (category = null, search = null, limit = 10, skip = 0) => {
    try {
      let params = { limit, skip };
      if (category) params.category = category;
      if (search) params.search = search;
      
      const response = await apiClient.get('/recipes', { params });
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  getRecipeById: async (id) => {
    try {
      const response = await apiClient.get(`/recipes/${id}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  getRecipesByCategory: async (categoryId) => {
    try {
      const response = await apiClient.get(`/recipes/category/${categoryId}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  createRecipe: async (recipeData) => {
    try {
      // Convert ingredients array to string if needed
      const data = {
        ...recipeData,
        ingredients: Array.isArray(recipeData.ingredients) 
          ? recipeData.ingredients 
          : recipeData.ingredients.split('\n')
      };
      
      console.log('API: Posting recipe to /recipes endpoint');
      const response = await apiClient.post('/recipes', data);
      console.log('API response status:', response.status);
      console.log('API response data:', response.data);
      
      // Return just the recipe object, not the entire response
      return response.data.recipe || response.data;
    } catch (error) {
      console.error('API Error creating recipe:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create recipe');
    }
  },

  updateRecipe: async (id, recipeData) => {
    try {
      const data = {
        ...recipeData,
        ingredients: Array.isArray(recipeData.ingredients) 
          ? recipeData.ingredients 
          : recipeData.ingredients.split('\n')
      };
      
      console.log('API: Updating recipe', id);
      const response = await apiClient.put(`/recipes/${id}`, data);
      console.log('API response data:', response.data);
      
      // Return just the recipe object, not the entire response
      return response.data.recipe || response.data;
    } catch (error) {
      console.error('API Error updating recipe:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update recipe');
    }
  },

  deleteRecipe: async (id) => {
    try {
      console.log('API: Deleting recipe', id);
      const response = await apiClient.delete(`/recipes/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error deleting recipe:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete recipe');
    }
  }
};

// ======== CATEGORY SERVICES ========

export const categoryService = {
  getAllCategories: async () => {
    try {
      const response = await apiClient.get('/categories');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  getCategoryById: async (id) => {
    try {
      const response = await apiClient.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  createCategory: async (categoryData) => {
    try {
      const response = await apiClient.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const response = await apiClient.put(`/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await apiClient.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }
};

export default apiClient;
