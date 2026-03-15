// src/components/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recipeService, categoryService } from '../services/api';
import './Home.css';

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch both recipes and categories
      const [recipesData, categoriesData] = await Promise.all([
        recipeService.getAllRecipes(),
        categoryService.getAllCategories()
      ]);
      
      // Handle recipe data format
      const recipes = Array.isArray(recipesData) ? recipesData : recipesData.recipes || [];
      
      // Handle category data format - API returns {success, count, categories}
      const categories = categoriesData.categories || categoriesData || [];
      
      setRecipes(recipes);
      setCategories(Array.isArray(categories) ? categories : []);
    } catch (err) {
      setError('Failed to load recipes. Please try again later.');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <h1 className="display-4 fw-bold">Welcome to <span className="text-warning">QuickCook</span></h1>
          <p className="lead fs-4">Healthy eating starts with the right choices.</p>
          <a href="#explore" className="btn btn-warning fw-bold text-danger px-4 rounded-pill mt-3 shadow-sm">
            Explore Menu
          </a>
        </div>
      </div>

      {/* Categories Section */}
      <div id="explore" className="container py-5 my-5 text-center">
        <div className="mb-5">
          <h2 className="fw-bold">Explore Our <span className="text-danger">Kitchen</span></h2>
          <p className="text-muted">Discover delicious hand-picked recipes just for you.</p>
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
              Latest <span className="text-danger">Recipes</span> ({recipes.length})
            </h3>
            
            <div className="row g-4">
              {recipes.slice(0, 8).map((recipe) => (
                <div className="col-md-3" key={recipe._id}>
                  <div className="card shadow-sm h-100 border-0">
                    {recipe.image && (
                      <img src={recipe.image} className="card-img-top" alt={recipe.name} />
                    )}
                    <div className="card-body">
                      <h5 className="card-title fw-bold">{recipe.name}</h5>
                      <p className="card-text text-muted small text-truncate">
                        {recipe.description || 'A delicious recipe'}
                      </p>
                      
                      <div className="mb-3">
                        {recipe.category && (
                          <span className="badge" style={{ 
                            backgroundColor: recipe.category.color 
                          }}>
                            {recipe.category.name}
                          </span>
                        )}
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

            {recipes.length > 8 && (
              <div className="text-center mt-5">
                <Link to="/all-recipes" className="btn btn-danger fw-bold px-5 rounded-pill">
                  View All Recipes ({recipes.length})
                </Link>
              </div>
            )}
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
    </div>
  );
};

export default Home;