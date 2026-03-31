import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeService, categoryService, userService, feedbackService, contactMessageService } from '../../services/api';
import { parseIngredients, validateRecipeAdminForm, validateCategoryAdminForm } from './adminFormValidation';
import './AdminDashboard.css';

const AdminDashboard = ({ adminName, setIsAdminLoggedIn, setAdminName }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [showEditRecipeModal, setShowEditRecipeModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryForView, setSelectedCategoryForView] = useState(null);
  const [selectedRecipeForView, setSelectedRecipeForView] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [contactMessages, setContactMessages] = useState([]);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: 'bi-egg-fried',
    color: '#FF6B6B'
  });
  const [recipeForm, setRecipeForm] = useState({
    name: '',
    description: '',
    image: null,
    imagePreview: '',
    ingredients: '',
    instructions: '',
    cookingTime: '',
    servings: '',
    difficulty: 'Medium',
    isPublished: true
  });
  const [recipeFormErrors, setRecipeFormErrors] = useState({});
  const [categoryFormErrors, setCategoryFormErrors] = useState({});
  const imageInputRef = React.useRef(null);

  // Fetch data on component mount
  useEffect(() => {
    loadCategories();
    loadRecipes();
    loadUsers();
    loadFeedbacks();
    loadContactMessages();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      // Handle response format {success, count, categories: [...]}
      const categoriesList = data.categories || data || [];
      setCategories(Array.isArray(categoriesList) ? categoriesList : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadRecipes = async () => {
    try {
      setRecipesLoading(true);
      const data = await recipeService.getAllRecipes();
      const recipesList = Array.isArray(data) ? data : (data.recipes || []);
      setRecipes(Array.isArray(recipesList) ? recipesList : []);
    } catch (err) {
      console.error('Failed to load recipes:', err);
    } finally {
      setRecipesLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await userService.getAllUsers();
      if (response.success && Array.isArray(response.users)) {
        setUsers(response.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadFeedbacks = async () => {
    try {
      setFeedbackLoading(true);
      setFeedbackError('');
      const response = await feedbackService.getAllFeedbacks();
      if (response.success && Array.isArray(response.feedbacks)) {
        setFeedbacks(response.feedbacks);
      } else {
        setFeedbacks([]);
        setFeedbackError(response.message || 'Failed to load feedbacks.');
      }
    } catch (err) {
      console.error('Failed to load feedbacks:', err);
      setFeedbacks([]);
      setFeedbackError('Failed to load feedbacks.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    const confirmed = window.confirm('Are you sure you want to delete this feedback?');
    if (!confirmed) return;

    const result = await feedbackService.deleteFeedback(feedbackId);

    if (!result.success) {
      alert(result.message || 'Failed to delete feedback.');
      return;
    }

    setFeedbacks((prev) => prev.filter((item) => item._id !== feedbackId));
  };

  const loadContactMessages = async () => {
    try {
      setContactLoading(true);
      setContactError('');
      const response = await contactMessageService.getAllContactMessages();

      if (response.success && Array.isArray(response.contactMessages)) {
        setContactMessages(response.contactMessages);
      } else {
        setContactMessages([]);
        setContactError(response.message || 'Failed to load contact messages.');
      }
    } catch (err) {
      console.error('Failed to load contact messages:', err);
      setContactMessages([]);
      setContactError('Failed to load contact messages.');
    } finally {
      setContactLoading(false);
    }
  };

  const handleDeleteContactMessage = async (messageId) => {
    const confirmed = window.confirm('Are you sure you want to delete this contact message?');
    if (!confirmed) return;

    const result = await contactMessageService.deleteContactMessage(messageId);

    if (!result.success) {
      alert(result.message || 'Failed to delete contact message.');
      return;
    }

    setContactMessages((prev) => prev.filter((item) => item._id !== messageId));
  };

  const activeUsersCount = users.filter((user) => user.isActive).length;
  const newestUser = users.length > 0
    ? [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
    : null;

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    
    // Update parent state
    setIsAdminLoggedIn(false);
    setAdminName('');
    
    // Redirect to admin login
    navigate('/admin');
  };

  const handleAddRecipe = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const validationErrors = validateRecipeAdminForm(recipeForm, selectedCategory);
    if (Object.keys(validationErrors).length > 0) {
      setRecipeFormErrors(validationErrors);
      setLoading(false);
      return;
    }

    setRecipeFormErrors({});

    try {
      // Parse ingredients array
      const ingredientsArray = parseIngredients(recipeForm.ingredients || '');

      const recipeData = {
        name: recipeForm.name,
        description: recipeForm.description,
        image: recipeForm.imagePreview || null,
        category: selectedCategory._id,
        ingredients: ingredientsArray,
        instructions: recipeForm.instructions,
        cookingTime: parseInt(recipeForm.cookingTime) || 30,
        servings: parseInt(recipeForm.servings) || 4,
        difficulty: recipeForm.difficulty,
        isPublished: true
      };

      console.log('Sending recipe data:', recipeData);
      const newRecipe = await recipeService.createRecipe(recipeData);
      console.log('Recipe response:', newRecipe);
      
      if (!newRecipe || newRecipe.success === false) {
        setError(newRecipe?.message || 'Failed to add recipe');
        setLoading(false);
        return;
      }
      
      // Add the new recipe to the list
      setRecipes([...recipes, newRecipe]);
      
      // Reset form
      resetForm();
      setShowAddRecipeModal(false);
      
      alert('Recipe added successfully!');
    } catch (err) {
      console.error('Add recipe error:', err);
      setError(err.message || 'Failed to add recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecipe = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const validationErrors = validateRecipeAdminForm(recipeForm, selectedCategory);
    if (Object.keys(validationErrors).length > 0) {
      setRecipeFormErrors(validationErrors);
      setLoading(false);
      return;
    }

    setRecipeFormErrors({});

    try {
      const ingredientsArray = parseIngredients(recipeForm.ingredients || '');

      const recipeData = {
        name: recipeForm.name,
        description: recipeForm.description,
        image: recipeForm.imagePreview || editingRecipe.image,
        category: selectedCategory._id,
        ingredients: ingredientsArray,
        instructions: recipeForm.instructions,
        cookingTime: parseInt(recipeForm.cookingTime) || 30,
        servings: parseInt(recipeForm.servings) || 4,
        difficulty: recipeForm.difficulty,
        isPublished: true
      };

      console.log('Updating recipe with data:', recipeData);
      const updatedRecipe = await recipeService.updateRecipe(editingRecipe._id, recipeData);
      console.log('Updated recipe response:', updatedRecipe);
      
      if (!updatedRecipe) {
        setError('Failed to update recipe');
        setLoading(false);
        return;
      }
      
      // Update recipe in list
      setRecipes(recipes.map(r => r._id === editingRecipe._id ? updatedRecipe : r));
      
      resetForm();
      setShowEditRecipeModal(false);
      setEditingRecipe(null);
      
      alert('Recipe updated successfully!');
    } catch (err) {
      console.error('Edit recipe error:', err);
      setError(err.message || 'Failed to update recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRecipeForm({
      name: '',
      description: '',
      image: null,
      imagePreview: '',
      ingredients: '',
      instructions: '',
      cookingTime: '',
      servings: '',
      difficulty: 'Medium',
      isPublished: true
    });
    setRecipeFormErrors({});
    setSelectedCategory(null);
  };

  const openEditModal = (recipe) => {
    setEditingRecipe(recipe);
    setRecipeForm({
      name: recipe.name,
      description: recipe.description,
      image: null,
      imagePreview: recipe.image,
      ingredients: recipe.ingredients?.join('\n') || '',
      instructions: recipe.instructions || '',
      cookingTime: recipe.cookingTime || 30,
      servings: recipe.servings || 4,
      difficulty: recipe.difficulty || 'Medium',
      isPublished: recipe.isPublished || true
    });
    const foundCategory = categories.find(c => c._id === recipe.category._id || c._id === recipe.category);
    setSelectedCategory(foundCategory);
    setRecipeFormErrors({});
    setShowEditRecipeModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Limit file size to 500KB
      if (file.size > 500000) {
        setError('Image size must be less than 500KB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress image by creating a canvas
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Scale down if too large
          if (width > 800) {
            height = Math.round(height * (800 / width));
            width = 800;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to compressed JPEG
          const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
          setRecipeForm({...recipeForm, image: file, imagePreview: compressedImage});
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteRecipe = async (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        console.log('Deleting recipe:', recipeId);
        await recipeService.deleteRecipe(recipeId);
        setRecipes(recipes.filter(r => r._id !== recipeId));
        alert('Recipe deleted successfully!');
      } catch (err) {
        console.error('Delete recipe error:', err);
        alert('Failed to delete recipe: ' + err.message);
      }
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const validationErrors = validateCategoryAdminForm(categoryForm);
    if (Object.keys(validationErrors).length > 0) {
      setCategoryFormErrors(validationErrors);
      setLoading(false);
      return;
    }

    setCategoryFormErrors({});

    try {
      const result = await categoryService.createCategory({
        name: categoryForm.name,
        description: categoryForm.description,
        icon: categoryForm.icon,
        color: categoryForm.color
      });

      if (result.success || result._id) {
        setCategories([...categories, result]);
        resetCategoryForm();
        setShowCategoryModal(false);
        alert('Category added successfully!');
      } else {
        setError(result.message || 'Failed to add category');
      }
    } catch (err) {
      console.error('Add category error:', err);
      setError(err.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const validationErrors = validateCategoryAdminForm(categoryForm);
    if (Object.keys(validationErrors).length > 0) {
      setCategoryFormErrors(validationErrors);
      setLoading(false);
      return;
    }

    setCategoryFormErrors({});

    try {
      const result = await categoryService.updateCategory(editingCategory._id, {
        name: categoryForm.name,
        description: categoryForm.description,
        icon: categoryForm.icon,
        color: categoryForm.color
      });

      if (result.success || result._id) {
        setCategories(categories.map(c => c._id === editingCategory._id ? result : c));
        resetCategoryForm();
        setShowCategoryModal(false);
        setEditingCategory(null);
        alert('Category updated successfully!');
      } else {
        setError(result.message || 'Failed to update category');
      }
    } catch (err) {
      console.error('Edit category error:', err);
      setError(err.message || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        setLoading(true);
        const result = await categoryService.deleteCategory(categoryId);
        console.log('Delete result:', result);
        
        // Check if deletion was successful
        if (result.success === true || result.success === undefined) {
          // Remove from state
          setCategories(categories.filter(c => c._id !== categoryId));
          if (selectedCategoryForView?._id === categoryId) {
            setSelectedCategoryForView(null);
          }
          alert('Category deleted successfully!');
          // Reload categories from database to ensure persistence
          await loadCategories();
        } else {
          alert(result.message || 'Failed to delete category');
        }
      } catch (err) {
        console.error('Delete category error:', err);
        alert('Failed to delete category: ' + err.message);
        // Reload to ensure consistency with database
        await loadCategories();
      } finally {
        setLoading(false);
      }
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      icon: 'bi-egg-fried',
      color: '#FF6B6B'
    });
    setCategoryFormErrors({});
  };

  const openEditCategoryModal = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color
    });
    setCategoryFormErrors({});
    setShowCategoryModal(true);
  };

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <i className="bi bi-shield-check"></i>
            <h4 className="mb-0">Admin Panel</h4>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav flex-column">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <i className="bi bi-speedometer2 me-3"></i>Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'recipes' ? 'active' : ''}`}
                onClick={() => setActiveTab('recipes')}
              >
                <i className="bi bi-book me-3"></i>Recipes
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <i className="bi bi-people me-3"></i>Users
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveTab('categories')}
              >
                <i className="bi bi-tags me-3"></i>Categories
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'feedback' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('feedback');
                  loadFeedbacks();
                }}
              >
                <i className="bi bi-chat-left-text me-3"></i>Feedback
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'contactMessages' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('contactMessages');
                  loadContactMessages();
                }}
              >
                <i className="bi bi-envelope-paper me-3"></i>Contact Messages
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <i className="bi bi-gear me-3"></i>Settings
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link"
                onClick={() => navigate('/')}
              >
                <i className="bi bi-house me-3"></i>Go to User Side
              </button>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-danger w-100 fw-bold mb-2" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2"></i>Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        {/* Top Bar */}
        <div className="admin-topbar">
          <div className="topbar-left">
            <h2 className="mb-0 d-flex align-items-center" style={{ fontSize: '18px' }}>
              <img 
                src="/images/QuickCookLogo.png" 
                alt="QuickCook Logo" 
                style={{ height: '75px', marginRight: '0px' }}
                title="QuickCook"
              />
            </h2>
          </div>

          <div className="topbar-right">
            <button 
              className="btn btn-outline-info fw-bold text-info me-3"
              onClick={() => navigate('/')}
              title="Back to User Side"
            >
              <i className="bi bi-house me-2"></i>User Side
            </button>
            
            <div className="admin-user-profile">
              <div className="user-avatar">
                <i className="bi bi-person-fill"></i>
              </div>
              <div className="user-info">
                <p className="user-name fw-bold mb-0">{adminName}</p>
                <p className="user-role text-muted mb-0">Administrator</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="admin-content">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-section">
              <h3 className="mb-4 fw-bold">Dashboard Overview</h3>
              
              <div className="row g-4 mb-5">
                {/* Stats Cards */}
                <div className="col-md-4">
                  <div className="stat-card" onClick={() => setActiveTab('recipes')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon bg-warning">
                      <i className="bi bi-book"></i>
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Total Recipes</p>
                      <h3 className="stat-value">{recipes.length}</h3>
                      <small className="text-success">+12 this month</small>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="stat-card" onClick={() => setActiveTab('users')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon bg-danger">
                      <i className="bi bi-people"></i>
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Active Users</p>
                      <h3 className="stat-value">{activeUsersCount}</h3>
                      <small className="text-muted">{users.length} registered users</small>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="stat-card" onClick={() => setActiveTab('categories')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon bg-info">
                      <i className="bi bi-tags"></i>
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Categories</p>
                      <h3 className="stat-value">{categories.length}</h3>
                      <small className="text-muted">Total categories</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="recent-activity">
                <h4 className="fw-bold mb-3">Recent Activity</h4>
                <div className="activity-list">
                  <div 
                    className="activity-item" 
                    style={{ cursor: recipes.length > 0 ? 'pointer' : 'default', transition: 'all 0.3s ease' }}
                    onClick={() => {
                      if (recipes.length > 0) {
                        setSelectedRecipeForView(recipes[recipes.length - 1]);
                      }
                    }}
                    onMouseEnter={(e) => recipes.length > 0 && (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="activity-icon">
                      <i className="bi bi-file-earmark-plus"></i>
                    </div>
                    <div className="activity-content">
                      <p className="mb-0"><strong>New Recipe Added</strong></p>
                      <small className="text-muted">{recipes.length > 0 ? recipes[recipes.length - 1].name : 'No recipes'} - 2 hours ago</small>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">
                      <i className="bi bi-person-plus"></i>
                    </div>
                    <div className="activity-content">
                      <p className="mb-0"><strong>New User Registration</strong></p>
                      <small className="text-muted">
                        {newestUser ? `${newestUser.name} joined - ${new Date(newestUser.createdAt).toLocaleDateString('en-IN')}` : 'No user registrations yet'}
                      </small>
                    </div>
                  </div>
                  <div 
                    className="activity-item" 
                    style={{ cursor: recipes.length > 1 ? 'pointer' : 'default', transition: 'all 0.3s ease' }}
                    onClick={() => {
                      if (recipes.length > 1) {
                        setSelectedRecipeForView(recipes[recipes.length - 2]);
                      } else if (recipes.length > 0) {
                        setSelectedRecipeForView(recipes[0]);
                      }
                    }}
                    onMouseEnter={(e) => recipes.length > 0 && (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="activity-icon">
                      <i className="bi bi-pencil-square"></i>
                    </div>
                    <div className="activity-content">
                      <p className="mb-0"><strong>Recipe Updated</strong></p>
                      <small className="text-muted">{recipes.length > 0 ? recipes[0].name : 'No recipes'} recipe updated - 30 minutes ago</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recipes Tab */}
          {activeTab === 'recipes' && (
            <div className="content-section">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold mb-0">Manage Recipes</h3>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={loadRecipes}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>Refresh
                  </button>
                  <button 
                    className="btn btn-warning fw-bold text-danger"
                    onClick={() => setShowAddRecipeModal(true)}
                  >
                    <i className="bi bi-plus-lg me-2"></i>Add New Recipe
                  </button>
                </div>
              </div>
              
              {recipesLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-warning" role="status" aria-hidden="true"></div>
                  <p className="mt-2 mb-0 text-muted">Loading recipes...</p>
                </div>
              ) : recipes.length === 0 ? (
                <div className="alert alert-info" role="alert">
                  <i className="bi bi-info-circle me-2"></i>
                  No recipes found. Click "Add New Recipe" to create one.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Recipe Name</th>
                        <th>Category</th>
                        <th>Created Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipes.map((recipe) => (
                        <tr key={recipe._id}>
                          <td>
                            <strong 
                              style={{ cursor: 'pointer', color: '#d32f2f' }}
                              onClick={() => setSelectedRecipeForView(recipe)}
                              title="Click to view recipe details"
                            >
                              {recipe.name}
                            </strong>
                          </td>
                          <td>
                            <span 
                              className="badge bg-info"
                              style={{ cursor: 'pointer' }}
                              onClick={() => setSelectedCategoryForView(categories.find(c => c._id === recipe.category._id || c._id === recipe.category))}
                              title="Click to view category recipes"
                            >
                              {recipe.category && recipe.category.name ? recipe.category.name : 'Uncategorized'}
                            </span>
                          </td>
                          <td>{new Date(recipe.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className="badge bg-success">
                              {recipe.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => openEditModal(recipe)}
                            >
                              <i className="bi bi-pencil"></i> Edit
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deleteRecipe(recipe._id)}
                            >
                              <i className="bi bi-trash"></i> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="content-section">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold mb-0">Manage Users ({users.length})</h3>
                <button
                  className="btn btn-outline-secondary"
                  onClick={loadUsers}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>Refresh
                </button>
              </div>
              
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>User Name</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Join Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <div className="spinner-border spinner-border-sm text-warning me-2" role="status" aria-hidden="true"></div>
                          <span className="text-muted">Loading users...</span>
                        </td>
                      </tr>
                    ) : users && users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user._id}>
                          <td><strong>{user.name}</strong></td>
                          <td>{user.email}</td>
                          <td>{user.mobile}</td>
                          <td>{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                          <td>
                            <span className={`badge ${user.isActive ? 'bg-success' : 'bg-danger'}`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-2">View</button>
                            <button className="btn btn-sm btn-outline-danger">Ban</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          No users registered yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="content-section">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold mb-0">Manage Categories {selectedCategoryForView && `- ${selectedCategoryForView.name}`}</h3>
                {selectedCategoryForView ? (
                  <button 
                    className="btn btn-warning fw-bold text-danger"
                    onClick={() => {
                      setSelectedCategory(selectedCategoryForView);
                      resetForm();
                      setShowAddRecipeModal(true);
                    }}
                  >
                    <i className="bi bi-plus-lg me-2"></i>Add Recipe
                  </button>
                ) : (
                  <button 
                    className="btn btn-warning fw-bold text-danger"
                    onClick={() => {
                      resetCategoryForm();
                      setEditingCategory(null);
                      setShowCategoryModal(true);
                    }}
                  >
                    <i className="bi bi-plus-lg me-2"></i>Add Category
                  </button>
                )}
              </div>
              
              {/* Categories Grid */}
              {!selectedCategoryForView ? (
                <>
                  {categories.length === 0 ? (
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      No categories available. Click "Add Category" to create one.
                    </div>
                  ) : (
                    <div className="row g-3">
                      {categories.map((category) => {
                        const categoryRecipeCount = recipes.filter(
                          r => r.category && 
                          (r.category._id === category._id || r.category === category._id)
                        ).length;

                        return (
                          <div key={category._id} className="col-md-4">
                            <div 
                              className="category-item"
                              role="button"
                              tabIndex={0}
                              onClick={() => setSelectedCategoryForView(category)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  setSelectedCategoryForView(category);
                                }
                              }}
                              style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 5px 20px rgba(255, 193, 7, 0.3)'}
                              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)'}
                            >
                              <i className={`bi ${category.icon}`} style={{ color: category.color, fontSize: '32px' }}></i>
                              <h5 className="fw-bold mt-2">{category.name}</h5>
                              <p className="text-muted small mb-3">
                                {categoryRecipeCount} {categoryRecipeCount === 1 ? 'recipe' : 'recipes'}
                              </p>
                              <button 
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditCategoryModal(category);
                                }}
                              >
                                Edit
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteCategory(category._id);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Back Button */}
                  <button 
                    className="btn btn-outline-secondary mb-4"
                    onClick={() => {
                      setSelectedCategoryForView(null);
                      setSelectedRecipeForView(null);
                    }}
                  >
                    <i className="bi bi-arrow-left me-2"></i>Back to Categories
                  </button>

                  {/* Category Details Header */}
                  <div className="category-details-header mb-4 p-4 rounded" style={{ backgroundColor: selectedCategoryForView.color + '20', borderLeft: `5px solid ${selectedCategoryForView.color}` }}>
                    <div className="d-flex align-items-center gap-3">
                      <i className={`bi ${selectedCategoryForView.icon}`} style={{ color: selectedCategoryForView.color, fontSize: '48px' }}></i>
                      <div>
                        <h2 className="fw-bold mb-1">{selectedCategoryForView.name}</h2>
                        <p className="text-muted mb-0">{selectedCategoryForView.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Recipes in This Category */}
                  <h4 className="fw-bold mb-3">Recipes in this Category</h4>
                  {recipes.filter(r => r.category && (r.category._id === selectedCategoryForView._id || r.category === selectedCategoryForView._id)).length === 0 ? (
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      No recipes in this category yet.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Recipe Name</th>
                            <th>Description</th>
                            <th>Cooking Time</th>
                            <th>Difficulty</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recipes.filter(r => r.category && (r.category._id === selectedCategoryForView._id || r.category === selectedCategoryForView._id)).map((recipe) => (
                            <tr key={recipe._id}>
                              <td>
                                <strong 
                                  style={{ cursor: 'pointer', color: '#d32f2f' }}
                                  onClick={() => setSelectedRecipeForView(recipe)}
                                  title="Click to view full details"
                                >
                                  {recipe.name}
                                </strong>
                              </td>
                              <td>{recipe.description?.substring(0, 50)}...</td>
                              <td>{recipe.cookingTime} min</td>
                              <td>
                                <span className={`badge bg-${recipe.difficulty === 'Easy' ? 'success' : recipe.difficulty === 'Medium' ? 'warning' : 'danger'}`}>
                                  {recipe.difficulty}
                                </span>
                              </td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-primary me-2"
                                  onClick={() => openEditModal(recipe)}
                                >
                                  <i className="bi bi-pencil"></i> Edit
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => deleteRecipe(recipe._id)}
                                >
                                  <i className="bi bi-trash"></i> Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'feedback' && (
            <div className="content-section">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold mb-0">All Feedback ({feedbacks.length})</h3>
                <button
                  className="btn btn-outline-secondary"
                  onClick={loadFeedbacks}
                  disabled={feedbackLoading}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  {feedbackLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {feedbackLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-warning" role="status" aria-hidden="true"></div>
                  <p className="mt-2 mb-0 text-muted">Loading feedback...</p>
                </div>
              ) : feedbackError ? (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {feedbackError}
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  No feedback submitted yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Rating</th>
                        <th>Message</th>
                        <th>Submitted On</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedbacks.map((feedback) => (
                        <tr key={feedback._id}>
                          <td><strong>{feedback.name}</strong></td>
                          <td>{feedback.email}</td>
                          <td style={{ fontSize: '1.3rem' }}>{feedback.rating}</td>
                          <td>{feedback.message}</td>
                          <td>{new Date(feedback.createdAt).toLocaleString('en-IN')}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteFeedback(feedback._id)}
                            >
                              <i className="bi bi-trash me-1"></i>Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contactMessages' && (
            <div className="content-section">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold mb-0">All Contact Messages ({contactMessages.length})</h3>
                <button
                  className="btn btn-outline-secondary"
                  onClick={loadContactMessages}
                  disabled={contactLoading}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  {contactLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {contactLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-warning" role="status" aria-hidden="true"></div>
                  <p className="mt-2 mb-0 text-muted">Loading contact messages...</p>
                </div>
              ) : contactError ? (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {contactError}
                </div>
              ) : contactMessages.length === 0 ? (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  No contact messages submitted yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Subject</th>
                        <th>Message</th>
                        <th>Submitted On</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contactMessages.map((item) => (
                        <tr key={item._id}>
                          <td><strong>{item.fullName}</strong></td>
                          <td>{item.email}</td>
                          <td>{item.subject}</td>
                          <td>{item.message}</td>
                          <td>{new Date(item.createdAt).toLocaleString('en-IN')}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteContactMessage(item._id)}
                            >
                              <i className="bi bi-trash me-1"></i>Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="content-section">
              <h3 className="fw-bold mb-4">Settings</h3>
              
              <div className="settings-form">
                <div className="mb-4">
                  <label className="form-label fw-semibold">Site Title</label>
                  <input type="text" className="form-control" value="QuickCook Recipe Finder" />
                </div>
                
                <div className="mb-4">
                  <label className="form-label fw-semibold">Site Description</label>
                  <textarea className="form-control" rows="3" defaultValue="Providing the best recipes for every kitchen since 2026."></textarea>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Email Notifications</label>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="emailNotif" defaultChecked />
                    <label className="form-check-label" htmlFor="emailNotif">
                      Send me email notifications for new activities
                    </label>
                  </div>
                </div>

                <button className="btn btn-success fw-bold">
                  <i className="bi bi-check-lg me-2"></i>Save Changes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Recipe Modal */}
        {(showAddRecipeModal || showEditRecipeModal) && (
          <div className="modal-overlay" onClick={() => {
            setShowAddRecipeModal(false);
            setShowEditRecipeModal(false);
            resetForm();
            setEditingRecipe(null);
          }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="fw-bold mb-0">
                  {showEditRecipeModal ? 'Edit Recipe' : 'Add New Recipe'}
                </h3>
                <button 
                  className="btn-close" 
                  onClick={() => {
                    setShowAddRecipeModal(false);
                    setShowEditRecipeModal(false);
                    resetForm();
                  }}
                ></button>
              </div>

              <form onSubmit={showEditRecipeModal ? handleEditRecipe : handleAddRecipe} className="modal-body" style={{ gridTemplateColumns: '1fr', gap: '10px', padding: '15px 20px' }}>
                {error && (
                  <div className="alert alert-danger alert-sm mb-2" style={{ gridColumn: '1 / -1' }}>
                    <i className="bi bi-exclamation-circle me-2"></i>{error}
                  </div>
                )}
                
                {/* Recipe Name */}
                <div>
                  <label className="form-label">Recipe Name *</label>
                  <input 
                    type="text" 
                    className={`form-control ${recipeFormErrors.name ? 'is-invalid' : ''}`}
                    placeholder="e.g., Spaghetti Carbonara"
                    value={recipeForm.name}
                    onChange={(e) => {
                      setRecipeForm({...recipeForm, name: e.target.value});
                      if (recipeFormErrors.name) {
                        setRecipeFormErrors((prev) => ({ ...prev, name: '' }));
                      }
                    }}
                    style={{ fontSize: '12px', padding: '5px 8px' }}
                  />
                  {recipeFormErrors.name && <div className="text-danger small mt-1">{recipeFormErrors.name}</div>}
                </div>

                {/* Description */}
                <div>
                  <label className="form-label">Description *</label>
                  <textarea 
                    className={`form-control ${recipeFormErrors.description ? 'is-invalid' : ''}`}
                    rows="1"
                    placeholder="Brief description..."
                    value={recipeForm.description}
                    onChange={(e) => {
                      setRecipeForm({...recipeForm, description: e.target.value});
                      if (recipeFormErrors.description) {
                        setRecipeFormErrors((prev) => ({ ...prev, description: '' }));
                      }
                    }}
                    style={{ fontSize: '12px', padding: '5px 8px', minHeight: '40px' }}
                  ></textarea>
                  {recipeFormErrors.description && <div className="text-danger small mt-1">{recipeFormErrors.description}</div>}
                </div>

                {/* Category Selector */}
                <div>
                  <label className="form-label">Category *</label>
                  <div className="category-selector" style={{ display: 'flex', gap: '6px', padding: '6px', flexWrap: 'wrap' }}>
                    {categories.length === 0 ? (
                      <small className="text-muted">No categories</small>
                    ) : (
                      categories.map((category) => (
                        <button
                          key={category._id}
                          type="button"
                          className={`btn btn-sm ${selectedCategory?._id === category._id ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
                          onClick={() => {
                            setSelectedCategory(category);
                            if (recipeFormErrors.category) {
                              setRecipeFormErrors((prev) => ({ ...prev, category: '' }));
                            }
                          }}
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                        >
                          <i className={`bi ${category.icon} me-1`}></i>{category.name}
                        </button>
                      ))
                    )}
                  </div>
                  {recipeFormErrors.category && <div className="text-danger small mt-1">{recipeFormErrors.category}</div>}
                </div>

                {/* Cooking Time & Servings */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="form-label">Cooking Time (min)</label>
                    <input 
                      type="number" 
                      className={`form-control ${recipeFormErrors.cookingTime ? 'is-invalid' : ''}`}
                      placeholder="30"
                      value={recipeForm.cookingTime}
                      onChange={(e) => {
                        setRecipeForm({...recipeForm, cookingTime: e.target.value});
                        if (recipeFormErrors.cookingTime) {
                          setRecipeFormErrors((prev) => ({ ...prev, cookingTime: '' }));
                        }
                      }}
                      style={{ fontSize: '12px', padding: '5px 8px' }}
                    />
                    {recipeFormErrors.cookingTime && <div className="text-danger small mt-1">{recipeFormErrors.cookingTime}</div>}
                  </div>
                  <div>
                    <label className="form-label">Servings</label>
                    <input 
                      type="number" 
                      className={`form-control ${recipeFormErrors.servings ? 'is-invalid' : ''}`}
                      placeholder="4"
                      value={recipeForm.servings}
                      onChange={(e) => {
                        setRecipeForm({...recipeForm, servings: e.target.value});
                        if (recipeFormErrors.servings) {
                          setRecipeFormErrors((prev) => ({ ...prev, servings: '' }));
                        }
                      }}
                      style={{ fontSize: '12px', padding: '5px 8px' }}
                    />
                    {recipeFormErrors.servings && <div className="text-danger small mt-1">{recipeFormErrors.servings}</div>}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="form-label">Difficulty</label>
                  <select 
                    className={`form-select ${recipeFormErrors.difficulty ? 'is-invalid' : ''}`}
                    value={recipeForm.difficulty}
                    onChange={(e) => {
                      setRecipeForm({...recipeForm, difficulty: e.target.value});
                      if (recipeFormErrors.difficulty) {
                        setRecipeFormErrors((prev) => ({ ...prev, difficulty: '' }));
                      }
                    }}
                    style={{ fontSize: '12px', padding: '5px 8px' }}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  {recipeFormErrors.difficulty && <div className="text-danger small mt-1">{recipeFormErrors.difficulty}</div>}
                </div>

                {/* Image Upload */}
                <div>
                  <label className="form-label">Recipe Image</label>
                  <input 
                    ref={imageInputRef}
                    type="file" 
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                  />
                  <small className="text-muted d-block mt-1">JPG, PNG (max 500KB)</small>
                </div>

                {/* Image Preview */}
                {recipeForm.imagePreview && (
                  <div>
                    <div className="image-preview-container">
                      <img src={recipeForm.imagePreview} alt="Recipe Preview" />
                      <div style={{ marginTop: '8px', display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button 
                          type="button"
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => imageInputRef.current?.click()}
                        >
                          <i className="bi bi-arrow-repeat"></i> Change
                        </button>
                        <button 
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setRecipeForm({...recipeForm, image: null, imagePreview: ''})}
                        >
                          <i className="bi bi-trash"></i> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ingredients */}
                <div>
                  <label className="form-label">Ingredients *</label>
                  <textarea 
                    className={`form-control ${recipeFormErrors.ingredients ? 'is-invalid' : ''}`}
                    rows="2"
                    placeholder="500g Pasta&#10;2 Eggs"
                    value={recipeForm.ingredients}
                    onChange={(e) => {
                      setRecipeForm({...recipeForm, ingredients: e.target.value});
                      if (recipeFormErrors.ingredients) {
                        setRecipeFormErrors((prev) => ({ ...prev, ingredients: '' }));
                      }
                    }}
                    style={{ fontSize: '12px', padding: '5px 8px', minHeight: '50px' }}
                  ></textarea>
                  <small className="text-muted">One per line</small>
                  {recipeFormErrors.ingredients && <div className="text-danger small mt-1">{recipeFormErrors.ingredients}</div>}
                </div>

                {/* Instructions */}
                <div>
                  <label className="form-label">Steps to Make *</label>
                  <textarea 
                    className={`form-control ${recipeFormErrors.instructions ? 'is-invalid' : ''}`}
                    rows="2"
                    placeholder="1. First step&#10;2. Second step"
                    value={recipeForm.instructions}
                    onChange={(e) => {
                      setRecipeForm({...recipeForm, instructions: e.target.value});
                      if (recipeFormErrors.instructions) {
                        setRecipeFormErrors((prev) => ({ ...prev, instructions: '' }));
                      }
                    }}
                    style={{ fontSize: '12px', padding: '5px 8px', minHeight: '50px' }}
                  ></textarea>
                  <small className="text-muted">Step-by-step</small>
                  {recipeFormErrors.instructions && <div className="text-danger small mt-1">{recipeFormErrors.instructions}</div>}
                </div>

                {/* Published Checkbox */}
                <div>
                  <div className="form-check mt-2">
                    <input 
                      className="form-check-input"
                      type="checkbox" 
                      id="publishRecipe"
                      checked={recipeForm.isPublished || false}
                      onChange={(e) => setRecipeForm({...recipeForm, isPublished: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="publishRecipe" style={{ fontSize: '12px' }}>
                      ✓ Publish this recipe
                    </label>
                  </div>
                </div>
              </form>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddRecipeModal(false);
                    setShowEditRecipeModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    if (showEditRecipeModal) {
                      handleEditRecipe(e);
                    } else {
                      handleAddRecipe(e);
                    }
                  }}
                  className="btn btn-warning fw-bold text-danger"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {showEditRecipeModal ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <i className={`bi ${showEditRecipeModal ? 'bi-check-lg' : 'bi-plus-lg'} me-2`}></i>
                      {showEditRecipeModal ? 'Update Recipe' : 'Add Recipe'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recipe Details View Modal */}
        {selectedRecipeForView && (
          <div className="modal-overlay" onClick={() => setSelectedRecipeForView(null)}>
            <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto', width: '90%', maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="fw-bold mb-0">{selectedRecipeForView.name}</h3>
                <button 
                  className="btn-close" 
                  onClick={() => setSelectedRecipeForView(null)}
                ></button>
              </div>

              <div className="modal-body" style={{ display: 'block' }}>
                {/* Recipe Image */}
                {selectedRecipeForView.image && (
                  <div style={{ marginBottom: '20px' }}>
                    <img 
                      src={selectedRecipeForView.image} 
                      alt={selectedRecipeForView.name}
                      style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                )}

                {/* Recipe Info Grid */}
                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted d-block">Category</small>
                      <strong className="d-block" style={{ color: selectedCategoryForView?.color || '#333' }}>
                        {selectedRecipeForView.category?.name || 'Uncategorized'}
                      </strong>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted d-block"><i className="bi bi-clock me-1"></i>Cooking Time</small>
                      <strong className="d-block">{selectedRecipeForView.cookingTime || 30} min</strong>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted d-block"><i className="bi bi-people me-1"></i>Servings</small>
                      <strong className="d-block">{selectedRecipeForView.servings || 4}</strong>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted d-block"><i className="bi bi-bar-chart me-1"></i>Difficulty</small>
                      <strong className="d-block">{selectedRecipeForView.difficulty || 'Medium'}</strong>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedRecipeForView.description && (
                  <div className="mb-4">
                    <h5 className="fw-bold">Description</h5>
                    <p>{selectedRecipeForView.description}</p>
                  </div>
                )}

                {/* Ingredients */}
                <div className="mb-4">
                  <h5 className="fw-bold">Ingredients</h5>
                  <ul>
                    {selectedRecipeForView.ingredients && selectedRecipeForView.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div className="mb-4">
                  <h5 className="fw-bold">Instructions</h5>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{selectedRecipeForView.instructions}</p>
                </div>

                {/* Status */}
                <div className="alert alert-info">
                  <small>
                    <strong>Status:</strong> {selectedRecipeForView.isPublished ? '✓ Published' : '✗ Draft'} | 
                    <strong className="ms-2">Created:</strong> {new Date(selectedRecipeForView.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setSelectedRecipeForView(null)}
                >
                  Close
                </button>
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => {
                    openEditModal(selectedRecipeForView);
                    setSelectedRecipeForView(null);
                  }}
                >
                  <i className="bi bi-pencil me-2"></i>Edit Recipe
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Category Modal */}
        {showCategoryModal && (
          <div className="modal-overlay" onClick={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
            resetCategoryForm();
          }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="fw-bold mb-0">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <button 
                  className="btn-close" 
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                    resetCategoryForm();
                  }}
                ></button>
              </div>

              <form onSubmit={editingCategory ? handleEditCategory : handleAddCategory} className="modal-body" style={{ gridTemplateColumns: '1fr', gap: '10px', padding: '15px 20px' }}>
                {error && (
                  <div className="alert alert-danger alert-sm mb-2" style={{ gridColumn: '1 / -1' }}>
                    <i className="bi bi-exclamation-circle me-2"></i>{error}
                  </div>
                )}
                
                {/* Category Name */}
                <div>
                  <label className="form-label">Category Name *</label>
                  <input 
                    type="text" 
                    className={`form-control ${categoryFormErrors.name ? 'is-invalid' : ''}`}
                    placeholder="e.g., Breakfast"
                    value={categoryForm.name}
                    onChange={(e) => {
                      setCategoryForm({...categoryForm, name: e.target.value});
                      if (categoryFormErrors.name) {
                        setCategoryFormErrors((prev) => ({ ...prev, name: '' }));
                      }
                    }}
                    style={{ fontSize: '12px', padding: '5px 8px' }}
                  />
                  {categoryFormErrors.name && <div className="text-danger small mt-1">{categoryFormErrors.name}</div>}
                </div>

                {/* Description */}
                <div>
                  <label className="form-label">Description</label>
                  <textarea 
                    className={`form-control ${categoryFormErrors.description ? 'is-invalid' : ''}`}
                    rows="2"
                    placeholder="Brief description..."
                    value={categoryForm.description}
                    onChange={(e) => {
                      setCategoryForm({...categoryForm, description: e.target.value});
                      if (categoryFormErrors.description) {
                        setCategoryFormErrors((prev) => ({ ...prev, description: '' }));
                      }
                    }}
                    style={{ fontSize: '12px', padding: '5px 8px', minHeight: '50px' }}
                  ></textarea>
                  {categoryFormErrors.description && <div className="text-danger small mt-1">{categoryFormErrors.description}</div>}
                </div>

                {/* Icon Selector */}
                <div>
                  <label className="form-label">Icon</label>
                  <div className="d-flex gap-2 flex-wrap">
                    {['bi-egg-fried', 'bi-sun', 'bi-moon-stars', 'bi-cake2', 'bi-fire', 'bi-cup-hot', 'bi-water', 'bi-leaf'].map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        className={`btn ${categoryForm.icon === icon ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => {
                          setCategoryForm({...categoryForm, icon});
                          if (categoryFormErrors.icon) {
                            setCategoryFormErrors((prev) => ({ ...prev, icon: '' }));
                          }
                        }}
                        style={{ padding: '5px 10px', fontSize: '14px' }}
                      >
                        <i className={`bi ${icon}`}></i>
                      </button>
                    ))}
                  </div>
                  {categoryFormErrors.icon && <div className="text-danger small mt-1">{categoryFormErrors.icon}</div>}
                </div>

                {/* Color Picker */}
                <div>
                  <label className="form-label">Color</label>
                  <div className="d-flex gap-2 flex-wrap">
                    {['#FF6B6B', '#4ECDC4', '#44A08D', '#F7B731', '#5F27CD', '#FF6B35', '#004E89', '#AA96DA'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`btn ${categoryForm.color === color ? 'btn-outline-dark' : 'btn-outline-secondary'}`}
                        onClick={() => {
                          setCategoryForm({...categoryForm, color});
                          if (categoryFormErrors.color) {
                            setCategoryFormErrors((prev) => ({ ...prev, color: '' }));
                          }
                        }}
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          padding: '0',
                          backgroundColor: color,
                          border: categoryForm.color === color ? '3px solid #000' : '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                  {categoryFormErrors.color && <div className="text-danger small mt-1">{categoryFormErrors.color}</div>}
                </div>
              </form>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                    resetCategoryForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    if (editingCategory) {
                      handleEditCategory(e);
                    } else {
                      handleAddCategory(e);
                    }
                  }}
                  className="btn btn-warning fw-bold text-danger"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {editingCategory ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <i className={`bi ${editingCategory ? 'bi-check-lg' : 'bi-plus-lg'} me-2`}></i>
                      {editingCategory ? 'Update Category' : 'Add Category'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
