import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recipeService, userService } from '../services/api';
import './CategoryRecipes.css';
import PlaylistSelector from './PlaylistSelector';

const CategoryRecipes = () => {
  const { name } = useParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedRecipeForPlaylist, setSelectedRecipeForPlaylist] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsUserLoggedIn(true);
      loadUserRecipeInteractions();
    }
  }, []);

  const loadUserRecipeInteractions = async () => {
    try {
      const [likedRes, savedRes] = await Promise.all([
        userService.getLikedRecipes(),
        userService.getSavedRecipes()
      ]);

      setLikedRecipes((likedRes.likedRecipes || []).map((r) => String(r._id)));
      setSavedRecipes((savedRes.savedRecipes || []).map((r) => String(r._id)));
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
      const isCurrentlyLiked = likedRecipes.includes(recipeId);
      const result = isCurrentlyLiked
        ? await userService.unlikeRecipe(recipeId)
        : await userService.likeRecipe(recipeId);

      if (result && result.success !== false) {
        await loadUserRecipeInteractions();
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

  const handlePlaylistSaved = async () => {
    await loadUserRecipeInteractions();
    setShowPlaylistModal(false);
  };

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await recipeService.getAllRecipes();
        
        // Handle response format
        const allRecipes = Array.isArray(data) ? data : data.recipes || [];
        
        // Filter by category name
        const categoryRecipes = allRecipes.filter(r => {
          const categoryName = r.category?.name || r.category;
          return categoryName === name;
        });

        if (categoryRecipes.length === 0) {
          setError(`No recipes found in ${name} category`);
        }
        setRecipes(categoryRecipes);
      } catch (err) {
        setError('Failed to load recipes: ' + err.message);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [name]);

  if (loading) return <div className="container py-5 text-center">Loading recipes...</div>;

  return (
    <div className="category-recipes py-5">
      <div className="container">
        <Link to="/" className="btn btn-outline-secondary mb-4">
          <i className="bi bi-arrow-left me-2"></i>Back to Categories
        </Link>

        <h1 className="fw-bold mb-5">
          <span className="text-danger">{name}</span> Recipes 
          <span className="text-muted ms-2">({recipes.length})</span>
        </h1>

        {error && <div className="alert alert-danger">{error}</div>}

        {recipes.length === 0 ? (
          <div className="alert alert-info">No recipes available in this category</div>
        ) : (
          <div className="row g-4">
            {recipes.map((recipe) => (
              <div className="col-md-4" key={recipe._id}>
                <div className="card shadow-sm h-100 border-0 recipe-card position-relative">
                  {recipe.image && (
                    <img src={recipe.image} className="card-img-top" alt={recipe.name} />
                  )}

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

                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title fw-bold">{recipe.name}</h5>
                    <p className="card-text text-muted small flex-grow-1">
                      {recipe.description}
                    </p>

                    {recipe.category && (
                      <div className="mb-2 d-flex align-items-center gap-2">
                        <span
                          className="badge"
                          style={{ backgroundColor: recipe.category.color || '#dc3545' }}
                        >
                          {recipe.category.name || recipe.category}
                        </span>

                        <button
                          type="button"
                          className={`save-btn-pill ${savedRecipes.includes(recipe._id) ? 'saved' : ''}`}
                          onClick={(e) => handleSave(recipe._id, e)}
                          title={savedRecipes.includes(recipe._id) ? 'Saved' : 'Save'}
                        >
                          <i className={`bi ${savedRecipes.includes(recipe._id) ? 'bi-bookmark-fill' : 'bi-bookmark'}`}></i>
                          <span className="save-text">{savedRecipes.includes(recipe._id) ? 'Saved' : 'Save'}</span>
                        </button>
                      </div>
                    )}
                    
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
                      className="btn btn-sm btn-warning fw-bold text-dark w-100 mt-auto"
                    >
                      <i className="bi bi-eye me-2"></i>View Recipe
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PlaylistSelector
        recipeId={selectedRecipeForPlaylist}
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        onSave={handlePlaylistSaved}
      />
    </div>
  );
};

export default CategoryRecipes;
