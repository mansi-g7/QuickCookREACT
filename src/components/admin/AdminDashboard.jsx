import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeService, categoryService } from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = ({ adminName, setIsAdminLoggedIn, setAdminName }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [showEditRecipeModal, setShowEditRecipeModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryForView, setSelectedCategoryForView] = useState(null);
  const [selectedRecipeForView, setSelectedRecipeForView] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
  const imageInputRef = React.useRef(null);

  // Fetch categories on component mount
  useEffect(() => {
    loadCategories();
    loadRecipes();
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
      const data = await recipeService.getAllRecipes();
      // Handle response format - data can be array or object with recipes property
      const recipesList = Array.isArray(data) ? data : (data.recipes || []);
      setRecipes(Array.isArray(recipesList) ? recipesList : []);
    } catch (err) {
      console.error('Failed to load recipes:', err);
    }
  };

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

    if (!selectedCategory) {
      setError('Please select a category');
      setLoading(false);
      return;
    }
    if (!recipeForm.name.trim()) {
      setError('Please enter recipe name');
      setLoading(false);
      return;
    }

    try {
      // Parse ingredients array
      const ingredientsArray = recipeForm.ingredients
        .split('\n')
        .map(i => i.trim())
        .filter(i => i.length > 0);

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

    if (!selectedCategory) {
      setError('Please select a category');
      setLoading(false);
      return;
    }

    try {
      const ingredientsArray = recipeForm.ingredients
        .split('\n')
        .map(i => i.trim())
        .filter(i => i.length > 0);

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
            <h2 className="mb-0 fw-bold">
              <i className="bi bi-egg-fried text-warning me-2"></i>QuickCook
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
                <div className="col-md-3">
                  <div className="stat-card">
                    <div className="stat-icon bg-warning">
                      <i className="bi bi-book"></i>
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Total Recipes</p>
                      <h3 className="stat-value">247</h3>
                      <small className="text-success">+12 this month</small>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="stat-card">
                    <div className="stat-icon bg-danger">
                      <i className="bi bi-people"></i>
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Active Users</p>
                      <h3 className="stat-value">1,324</h3>
                      <small className="text-success">+45 this week</small>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="stat-card">
                    <div className="stat-icon bg-info">
                      <i className="bi bi-tags"></i>
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Categories</p>
                      <h3 className="stat-value">8</h3>
                      <small className="text-muted">Total categories</small>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="stat-card">
                    <div className="stat-icon bg-secondary">
                      <i className="bi bi-eye"></i>
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Page Views</p>
                      <h3 className="stat-value">45.2K</h3>
                      <small className="text-success">+8% from last week</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="recent-activity">
                <h4 className="fw-bold mb-3">Recent Activity</h4>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon">
                      <i className="bi bi-file-earmark-plus"></i>
                    </div>
                    <div className="activity-content">
                      <p className="mb-0"><strong>New Recipe Added</strong></p>
                      <small className="text-muted">Spaghetti Carbonara - 2 hours ago</small>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">
                      <i className="bi bi-person-plus"></i>
                    </div>
                    <div className="activity-content">
                      <p className="mb-0"><strong>New User Registration</strong></p>
                      <small className="text-muted">5 new users registered - 1 hour ago</small>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">
                      <i className="bi bi-pencil-square"></i>
                    </div>
                    <div className="activity-content">
                      <p className="mb-0"><strong>Recipe Updated</strong></p>
                      <small className="text-muted">Chocolate Cake recipe updated - 30 minutes ago</small>
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
                <button 
                  className="btn btn-warning fw-bold text-danger"
                  onClick={() => setShowAddRecipeModal(true)}
                >
                  <i className="bi bi-plus-lg me-2"></i>Add New Recipe
                </button>
              </div>
              
              {recipes.length === 0 ? (
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
              <h3 className="fw-bold mb-4">Manage Users</h3>
              
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>User Name</th>
                      <th>Email</th>
                      <th>Join Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>John Doe</strong></td>
                      <td>john@example.com</td>
                      <td>2026-02-15</td>
                      <td><span className="badge bg-success">Active</span></td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-2">View</button>
                        <button className="btn btn-sm btn-outline-danger">Ban</button>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Jane Smith</strong></td>
                      <td>jane@example.com</td>
                      <td>2026-01-20</td>
                      <td><span className="badge bg-success">Active</span></td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-2">View</button>
                        <button className="btn btn-sm btn-outline-danger">Ban</button>
                      </td>
                    </tr>
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
                <button className="btn btn-warning fw-bold text-danger">
                  <i className="bi bi-plus-lg me-2"></i>Add Category
                </button>
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
                                }}
                              >
                                Edit
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={(e) => {
                                  e.stopPropagation();
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
                    className="form-control"
                    placeholder="e.g., Spaghetti Carbonara"
                    value={recipeForm.name}
                    onChange={(e) => setRecipeForm({...recipeForm, name: e.target.value})}
                    style={{ fontSize: '12px', padding: '5px 8px' }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="form-label">Description *</label>
                  <textarea 
                    className="form-control"
                    rows="1"
                    placeholder="Brief description..."
                    value={recipeForm.description}
                    onChange={(e) => setRecipeForm({...recipeForm, description: e.target.value})}
                    style={{ fontSize: '12px', padding: '5px 8px', minHeight: '40px' }}
                  ></textarea>
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
                          onClick={() => setSelectedCategory(category)}
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                        >
                          <i className={`bi ${category.icon} me-1`}></i>{category.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Cooking Time & Servings */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="form-label">Cooking Time (min)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      placeholder="30"
                      value={recipeForm.cookingTime}
                      onChange={(e) => setRecipeForm({...recipeForm, cookingTime: e.target.value})}
                      style={{ fontSize: '12px', padding: '5px 8px' }}
                    />
                  </div>
                  <div>
                    <label className="form-label">Servings</label>
                    <input 
                      type="number" 
                      className="form-control"
                      placeholder="4"
                      value={recipeForm.servings}
                      onChange={(e) => setRecipeForm({...recipeForm, servings: e.target.value})}
                      style={{ fontSize: '12px', padding: '5px 8px' }}
                    />
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="form-label">Difficulty</label>
                  <select 
                    className="form-select"
                    value={recipeForm.difficulty}
                    onChange={(e) => setRecipeForm({...recipeForm, difficulty: e.target.value})}
                    style={{ fontSize: '12px', padding: '5px 8px' }}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
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
                    className="form-control"
                    rows="2"
                    placeholder="500g Pasta&#10;2 Eggs"
                    value={recipeForm.ingredients}
                    onChange={(e) => setRecipeForm({...recipeForm, ingredients: e.target.value})}
                    style={{ fontSize: '12px', padding: '5px 8px', minHeight: '50px' }}
                  ></textarea>
                  <small className="text-muted">One per line</small>
                </div>

                {/* Instructions */}
                <div>
                  <label className="form-label">Steps to Make *</label>
                  <textarea 
                    className="form-control"
                    rows="2"
                    placeholder="1. First step&#10;2. Second step"
                    value={recipeForm.instructions}
                    onChange={(e) => setRecipeForm({...recipeForm, instructions: e.target.value})}
                    style={{ fontSize: '12px', padding: '5px 8px', minHeight: '50px' }}
                  ></textarea>
                  <small className="text-muted">Step-by-step</small>
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
      </main>
    </div>
  );
};

export default AdminDashboard;
