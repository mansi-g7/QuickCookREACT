import axios from 'axios';

// Base URL for API (works with Vite)
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = rawApiUrl.endsWith('/api')
  ? rawApiUrl
  : `${rawApiUrl.replace(/\/$/, '')}/api`;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const notifyAuthStateChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-changed'));
  }
};

// Add token to every request
apiClient.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('token');
    const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const token = isAdminPath ? (adminToken || userToken) : (userToken || adminToken);
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
// ======== USER SERVICES (Guest/User) ========

export const userService = {

  register: async (formData) => {
    try {
      const response = await apiClient.post('/users/register', formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userName', response.data.user.name);
        if (response.data.user.profilePicture) {
          localStorage.setItem('profilePicture', response.data.user.profilePicture);
        }
        notifyAuthStateChanged();
      }

      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  login: async (email, password) => {
    try {
      const response = await apiClient.post('/users/login', { email, password });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userName', response.data.user.name);
        if (response.data.user.profilePicture) {
          localStorage.setItem('profilePicture', response.data.user.profilePicture);
        }
        notifyAuthStateChanged();
      }

      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  getProfile: async () => {
    try {
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  updateProfile: async (formData) => {
    try {
      const response = await apiClient.put('/users/me', formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  changePassword: async (oldPassword, newPassword, confirmPassword) => {
    try {
      const response = await apiClient.post('/users/change-password', { 
        oldPassword, 
        newPassword, 
        confirmPassword 
      });
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/users/forgot-password', { email });
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  resetPassword: async (token, password, confirmPassword) => {
    try {
      const response = await apiClient.post('/users/reset-password', {
        token,
        password,
        confirmPassword
      });
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('profilePicture');
    notifyAuthStateChanged();
  },

  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message, users: [] };
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  updateUserStatus: async (userId, isActive) => {
    try {
      const response = await apiClient.patch(`/users/${userId}/status`, { isActive });
      return response.data;
    } catch (error) {
      const status = error.response?.status;

      if (status === 404 || status === 405) {
        try {
          const fallbackResponse = await apiClient.post(`/users/${userId}/status`, { isActive });
          return fallbackResponse.data;
        } catch (fallbackError) {
          return { success: false, message: fallbackError.response?.data?.message || fallbackError.message };
        }
      }

      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  likeRecipe: async (recipeId) => {
    try {
      const response = await apiClient.post(`/users/like/${recipeId}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  unlikeRecipe: async (recipeId) => {
    try {
      const response = await apiClient.post(`/users/unlike/${recipeId}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  saveRecipe: async (recipeId) => {
    try {
      const response = await apiClient.post(`/users/save/${recipeId}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  unsaveRecipe: async (recipeId) => {
    try {
      const response = await apiClient.post(`/users/unsave/${recipeId}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  getLikedRecipes: async () => {
    try {
      const response = await apiClient.get('/users/liked-recipes');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message, likedRecipes: [] };
    }
  },

  getSavedRecipes: async () => {
    try {
      const response = await apiClient.get('/users/saved-recipes');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message, savedRecipes: [] };
    }
  }

};

  export const playlistService = {
    createPlaylist: async (name, description = '', color = '#ff9547') => {
      try {
        const response = await apiClient.post('/playlists/create', { name, description, color });
        return response.data;
      } catch (error) {
        return { success: false, message: error.response?.data?.message || error.message };
      }
    },

    getAllPlaylists: async () => {
      try {
        const response = await apiClient.get('/playlists/all');
        return response.data;
      } catch (error) {
        return { success: false, message: error.response?.data?.message || error.message, playlists: [] };
      }
    },

    getPlaylist: async (playlistId) => {
      try {
        const response = await apiClient.get(`/playlists/${playlistId}`);
        return response.data;
      } catch (error) {
        return { success: false, message: error.response?.data?.message || error.message };
      }
    },

    updatePlaylist: async (playlistId, { name, description, color }) => {
      try {
        const response = await apiClient.put(`/playlists/${playlistId}`, { name, description, color });
        return response.data;
      } catch (error) {
        return { success: false, message: error.response?.data?.message || error.message };
      }
    },

    deletePlaylist: async (playlistId) => {
      try {
        const response = await apiClient.delete(`/playlists/${playlistId}`);
        return response.data;
      } catch (error) {
        return { success: false, message: error.response?.data?.message || error.message };
      }
    },

    addRecipeToPlaylist: async (playlistId, recipeId) => {
      try {
        const response = await apiClient.post(`/playlists/${playlistId}/add-recipe/${recipeId}`);
        return response.data;
      } catch (error) {
        return { success: false, message: error.response?.data?.message || error.message };
      }
    },

    removeRecipeFromPlaylist: async (playlistId, recipeId) => {
      try {
        const response = await apiClient.post(`/playlists/${playlistId}/remove-recipe/${recipeId}`);
        return response.data;
      } catch (error) {
        return { success: false, message: error.response?.data?.message || error.message };
      }
    },

    checkRecipeInPlaylists: async (recipeId) => {
      try {
        const response = await apiClient.get(`/playlists/check/${recipeId}`);
        return response.data;
      } catch (error) {
        return { success: false, message: error.response?.data?.message || error.message, inPlaylist: false, playlists: [] };
      }
    }
  };

export const feedbackService = {
  submitFeedback: async (feedbackData) => {
    try {
      const response = await apiClient.post('/feedback', feedbackData);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  getAllFeedbacks: async () => {
    try {
      const response = await apiClient.get('/feedback');
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        feedbacks: []
      };
    }
  },

  deleteFeedback: async (id) => {
    try {
      const response = await apiClient.delete(`/feedback/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  }
};

export const contactMessageService = {
  submitContactMessage: async (contactData) => {
    try {
      const response = await apiClient.post('/contact-messages', contactData);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  getAllContactMessages: async () => {
    try {
      const response = await apiClient.get('/contact-messages');
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        contactMessages: []
      };
    }
  },

  deleteContactMessage: async (id) => {
    try {
      const response = await apiClient.delete(`/contact-messages/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  }
};

// ======== SETTINGS SERVICES (Admin & Public) ========

export const settingsService = {
  getSettings: async () => {
    try {
      const response = await apiClient.get('/settings');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  updateSettings: async (settingsData) => {
    try {
      const response = await apiClient.put('/settings', settingsData);
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  resetSettings: async () => {
    try {
      const response = await apiClient.post('/settings/reset');
      return response.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }
};

export default apiClient;
