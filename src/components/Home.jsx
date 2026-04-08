// src/components/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recipeService, categoryService, settingsService, userService } from '../services/api';
import './Home.css';
import PlaylistSelector from './PlaylistSelector';

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [selectedRecipeForPlaylist, setSelectedRecipeForPlaylist] = useState(null);

    const renderHighlightedTitle = (title, defaultLeadingText, defaultHighlightedText) => {
      if (title && title.trim()) {
        const words = title.trim().split(/\s+/);
        if (words.length === 1) {
          return <><span>{words[0]}</span></>;
        }

        return (
          <>
            {words.slice(0, -1).join(' ')} <span className="text-warning">{words[words.length - 1]}</span>
          </>
        );
      }

      return (
        <>
          {defaultLeadingText} <span className="text-warning">{defaultHighlightedText}</span>
        </>
      );
    };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsUserLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    loadData();
    
    // Refresh data every 30 seconds to catch new recipes added by admin
    const interval = setInterval(loadData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isUserLoggedIn) {
      loadUserRecipeInteractions();
    }
  }, [isUserLoggedIn]);

  const loadUserRecipeInteractions = async () => {
    try {
      const [likedRes, savedRes] = await Promise.all([
        userService.getLikedRecipes(),
        userService.getSavedRecipes()
      ]);
      
      setLikedRecipes((likedRes.likedRecipes || []).map(r => String(r._id)));
      setSavedRecipes((savedRes.savedRecipes || []).map(r => String(r._id)));
    } catch (err) {
      console.error('Error loading user interactions:', err);
    }
  };

  const handleLike = async (recipeId, e) => {
    e.preventDefault();
    if (!isUserLoggedIn) {
      alert('Please login to like recipes');
      return;
    }

    try {
      let result;
      const isCurrentlyLiked = likedRecipes.includes(recipeId);
      
      console.log('Like action:', { recipeId, isCurrentlyLiked });
      
      if (isCurrentlyLiked) {
        result = await userService.unlikeRecipe(recipeId);
        console.log('Unlike result:', result);
        if (result && result.success !== false) {
          await loadUserRecipeInteractions();
        } else {
          console.error('Unlike failed:', result?.message);
        }
      } else {
        result = await userService.likeRecipe(recipeId);
        console.log('Like result:', result);
        if (result && result.success !== false) {
          await loadUserRecipeInteractions();
        } else {
          console.error('Like failed:', result?.message);
        }
      }
    } catch (err) {
      console.error('Error liking recipe:', err);
    }
  };

  const handleSave = async (recipeId, e) => {
    e.preventDefault();
    if (!isUserLoggedIn) {
      alert('Please login to save recipes');
      return;
    }

      setSelectedRecipeForPlaylist(recipeId);
      setShowPlaylistModal(true);
  };

    const handlePlaylistSaved = () => {
      // Refresh recipes to get updated playlist counts
      loadData();
      setShowPlaylistModal(false);
    };
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch recipes, categories, and settings
      const [recipesData, categoriesData, settingsData] = await Promise.all([
        recipeService.getAllRecipes(),
        categoryService.getAllCategories(),
        settingsService.getSettings()
      ]);
      
      // Handle recipe data format
      let recipes = Array.isArray(recipesData) ? recipesData : recipesData.recipes || [];
      
      // Ensure all recipes have likesCount and savesCount fields with safe defaults
      recipes = recipes.map(recipe => ({
        ...recipe,
        likesCount: recipe.likesCount !== undefined ? recipe.likesCount : 0,
        savesCount: recipe.savesCount !== undefined ? recipe.savesCount : 0
      }));
      
      // Handle category data format - API returns {success, count, categories}
      const categories = categoriesData.categories || categoriesData || [];
      
      // Handle settings data
      const settingsData_final = settingsData.settings || settingsData || {};
      
      setRecipes(recipes);
      setCategories(Array.isArray(categories) ? categories : []);
      setSettings(settingsData_final);
    } catch (err) {
      setError('Failed to load recipes. Please try again later.');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const latestRecipes = [...recipes]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <h1 className="display-4 fw-bold">
            {renderHighlightedTitle(settings?.homePageTitle, 'Welcome to', 'QuickCook')}
          </h1>
          <p className="lead fs-4">{settings?.homePageSubtitle || 'Healthy eating starts with the right choices.'}</p>
          <a href="#explore" className="btn btn-warning fw-bold text-danger px-4 rounded-pill mt-3 shadow-sm">
            {settings?.homePageCTA || 'Explore Menu'}
          </a>
        </div>
      </div>

      {/* Categories Section */}
      <div id="explore" className="container py-5 my-5 text-center">
        <div className="mb-5">
          <h2 className="fw-bold">Explore Our <span className="text-danger">Kitchen</span></h2>
          <p className="text-muted">{settings?.homePageDescription || 'Discover delicious hand-picked recipes just for you.'}</p>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading recipes...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}
          </div>
        ) : (
          <div className="row g-4">
            {categories.length === 0 ? (
              <div className="col-12">
                <div className="alert alert-info" role="alert">
                  <i className="bi bi-info-circle me-2"></i>
                  No categories available yet. Check back soon!
                </div>
              </div>
            ) : (
              categories.map((category) => {
                // Count recipes in this category
                const categoryRecipeCount = recipes.filter(r => 
                  r.category && r.category._id === category._id
                ).length;

                return (
                  <div className="col-md-3" key={category._id}>
                    <div className="category-card shadow-sm">
                      <div className="standard-icon" style={{ 
                        color: category.color, 
                        background: category.color + '20' 
                      }}>
                        <i className={`bi ${category.icon}`}></i>
                      </div>
                      <h4 className="fw-bold">{category.name}</h4>
                      <p className="text-muted small">{category.description || 'Delicious recipes in this category'}</p>
                      <small className="text-secondary d-block mb-2">
                        {categoryRecipeCount} recipe{categoryRecipeCount !== 1 ? 's' : ''}
                      </small>
                      <Link 
                        to={`/category/${category.name}`} 
                        className="btn btn-outline-warning btn-sm rounded-pill px-4 mt-2 fw-bold text-dark"
                      >
                        View Recipes
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Recipes Section */}
      {!loading && !error && recipes.length > 0 && (
        <div className="bg-light py-5">
          <div className="container">
            <h3 className="fw-bold mb-5 text-center">
              Latest <span className="text-danger">Recipes</span>
            </h3>

            <p className="text-center text-muted mb-4">
              Total Recipes: <strong>{recipes.length}</strong>
            </p>
            
            <div className="row g-4">
              {latestRecipes.map((recipe) => (
                <div className="col-md-3" key={recipe._id}>
                  <div className="card shadow-sm h-100 border-0 recipe-card position-relative">
                    {recipe.image && (
                      <img src={recipe.image} className="card-img-top" alt={recipe.name} />
                    )}
                    
                    {/* Like button (top right of image) */}
                    <div className="recipe-actions position-absolute top-0 end-0 p-3 d-flex gap-2">
                      <button
                        type="button"
                        className={`like-btn ${likedRecipes.includes(recipe._id) ? 'liked' : ''}`}
                        onClick={(e) => handleLike(recipe._id, e)}
                        title={likedRecipes.includes(recipe._id) ? 'Unlike' : 'Like'}
                      >
                        <i className={`bi ${likedRecipes.includes(recipe._id) ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                        <span className="like-label">{likedRecipes.includes(recipe._id) ? 'Liked' : 'Like'}</span>
                      </button>
                    </div>

                    <div className="card-body">
                      <h5 className="card-title fw-bold">{recipe.name}</h5>
                      <p className="card-text text-muted small text-truncate">
                        {recipe.description || 'A delicious recipe'}
                      </p>
                      
                      <div className="mb-3 d-flex align-items-center gap-2">
                        {recipe.category && (
                          <span className="badge" style={{ 
                            backgroundColor: recipe.category.color 
                          }}>
                            {recipe.category.name}
                          </span>
                        )}
                        <button
                          type="button"
                          className={`save-btn-pill ${savedRecipes.includes(recipe._id) ? 'saved' : ''}`}
                          onClick={(e) => handleSave(recipe._id, e)}
                          title={savedRecipes.includes(recipe._id) ? 'Unsave' : 'Save'}
                        >
                          <i className={`bi ${savedRecipes.includes(recipe._id) ? 'bi-bookmark-fill' : 'bi-bookmark'}`}></i>
                          <span className="save-text">{savedRecipes.includes(recipe._id) ? 'Saved' : 'Save'}</span>
                        </button>
                      </div>

                      <div className="mb-3">
                        <small className="text-muted d-block">
                          <i className="bi bi-clock me-1"></i>
                          {recipe.cookingTime || '30'} mins | 
                          <i className="bi bi-people ms-2 me-1"></i>
                          {recipe.servings || '4'} servings
                        </small>
                      </div>

                      <Link 
                        to={`/recipe/${recipe._id}`}
                        className="btn btn-sm btn-warning fw-bold text-dark w-100"
                      >
                        <i className="bi bi-eye me-2"></i>View Recipe
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-5">
              <Link to="/all-recipes" className="all-recipes-cta">
                <span className="all-recipes-cta__icon" aria-hidden="true">
                  <i className="bi bi-grid-3x3-gap-fill"></i>
                </span>
                <span className="all-recipes-cta__label">All Recipes</span>
                <span className="all-recipes-cta__count">{recipes.length}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* How it Works Section */}
      <div className="bg-light py-5 border-top">
        <div className="container text-center">
          <h3 className="fw-bold mb-5">How <span className="text-danger">QuickCook</span> Works</h3>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="text-danger fs-1 mb-2">1</div>
              <h5 className="fw-bold">Check Your Fridge</h5>
              <p className="text-muted small">See what ingredients you have today.</p>
            </div>
            <div className="col-md-4 mb-4">
              <div className="text-danger fs-1 mb-2">2</div>
              <h5 className="fw-bold">Select Category</h5>
              <p className="text-muted small">Pick a collection that fits your mood.</p>
            </div>
            <div className="col-md-4 mb-4">
              <div className="text-danger fs-1 mb-2">3</div>
              <h5 className="fw-bold">Get Cooking!</h5>
              <p className="text-muted small">Follow simple steps to a great meal.</p>
            </div>
          </div>
        </div>
      </div>

        {/* Playlist Selector Modal */}
        <PlaylistSelector
          recipeId={selectedRecipeForPlaylist}
          isOpen={showPlaylistModal}
          onClose={() => setShowPlaylistModal(false)}
          onSave={handlePlaylistSaved}
        />
    </div>
  );
};

export default Home;