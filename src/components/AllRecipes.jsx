import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { playlistService, recipeService, userService } from '../services/api';
import './AllRecipes.css';
import PlaylistSelector from './PlaylistSelector';

const AllRecipes = () => {
  const [searchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filterCategory, setFilterCategory] = useState('');
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedRecipeForPlaylist, setSelectedRecipeForPlaylist] = useState(null);

  // Load user's liked and saved recipes
  useEffect(() => {
    const syncAuthState = () => {
      const token = localStorage.getItem('token');
      const loggedIn = Boolean(token);
      setIsUserLoggedIn(loggedIn);

      if (loggedIn) {
        loadUserRecipeInteractions();
      } else {
        setLikedRecipes([]);
        setSavedRecipes([]);
      }
    };

    syncAuthState();
    window.addEventListener('storage', syncAuthState);
    window.addEventListener('auth-changed', syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('auth-changed', syncAuthState);
    };
  }, []);

  const loadUserRecipeInteractions = async () => {
    try {
      const [likedRes, savedRes, playlistsRes] = await Promise.all([
        userService.getLikedRecipes(),
        userService.getSavedRecipes(),
        playlistService.getAllPlaylists()
      ]);

      const likedIds = (likedRes.likedRecipes || []).map((r) => String(r._id));
      const directSavedIds = (savedRes.savedRecipes || []).map((r) => String(r._id));
      const playlistSavedIds = (playlistsRes.playlists || [])
        .flatMap((playlist) => playlist.recipes || [])
        .map((recipe) => String(recipe._id || recipe));

      setLikedRecipes(likedIds);
      setSavedRecipes(Array.from(new Set([...directSavedIds, ...playlistSavedIds])));
    } catch (err) {
      console.error('Error loading user interactions:', err);
    }
  };

  const handleLike = async (recipeId, e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
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
    const token = localStorage.getItem('token');
    if (!token) {
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
        let allRecipes = Array.isArray(data) ? data : data.recipes || [];

        // Ensure all recipes have likesCount and savesCount with safe defaults
        allRecipes = allRecipes.map(recipe => ({
          ...recipe,
          likesCount: recipe.likesCount !== undefined ? recipe.likesCount : 0,
          savesCount: recipe.savesCount !== undefined ? recipe.savesCount : 0
        }));

        setRecipes(allRecipes);
      } catch (err) {
        setError('Failed to load recipes: ' + err.message);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
    
    // Refresh recipes every 30 seconds to catch new recipes added by admin
    const interval = setInterval(fetchRecipes, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Filter recipes based on search and category
  const filteredRecipes = recipes.filter(recipe => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const recipeName = (recipe.name || '').toLowerCase();
    const recipeDescription = (recipe.description || '').toLowerCase();
    const recipeIngredients = Array.isArray(recipe.ingredients)
      ? recipe.ingredients.join(' ').toLowerCase()
      : (recipe.ingredients || '').toLowerCase();

    const matchesSearch = !normalizedSearch ||
      recipeName.includes(normalizedSearch) ||
      recipeDescription.includes(normalizedSearch) ||
      recipeIngredients.includes(normalizedSearch);

    const matchesCategory = !filterCategory || 
                           (recipe.category?.name === filterCategory) ||
                           (recipe.category === filterCategory);
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [...new Set(recipes.map(r => r.category?.name || r.category).filter(Boolean))];

  if (loading) return <div className="container py-5 text-center">Loading recipes...</div>;

  return (
    <div className="all-recipes py-5">
      <div className="container">
        <Link to="/" className="btn btn-outline-secondary mb-4">
          <i className="bi bi-arrow-left me-2"></i>Back to Home
        </Link>

        <h1 className="fw-bold mb-5">
          All <span className="text-danger">Recipes</span>
          <span className="text-muted ms-2">({filteredRecipes.length})</span>
        </h1>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Search and Filter */}
        <div className="row mb-5">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control form-control-lg border-warning shadow-sm"
              placeholder="Search by recipe name or ingredient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <select
              className="form-select form-select-lg border-warning shadow-sm"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Recipes Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="alert alert-info text-center py-5">
            <h5>No recipes found</h5>
            <p className="text-muted">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredRecipes.map((recipe) => (
              (() => {
                const recipeId = String(recipe._id);
                const isLiked = likedRecipes.includes(recipeId);
                const isSaved = savedRecipes.includes(recipeId);
                return (
              <div className="col-md-4 col-lg-3" key={recipe._id}>
                <div className="card shadow-sm h-100 border-0 recipe-card position-relative">
                  {recipe.image && (
                    <img src={recipe.image} className="card-img-top" alt={recipe.name} />
                  )}
                  
                  {/* Like button (top right of image) */}
                  <div className="recipe-actions position-absolute top-0 end-0 p-3 d-flex gap-2">
                    <button
                      type="button"
                      className={`like-btn ${isLiked ? 'liked' : ''}`}
                      onClick={(e) => handleLike(recipe._id, e)}
                      title={isLiked ? 'Unlike' : 'Like'}
                    >
                      <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                      <span className="like-label">{isLiked ? 'Liked' : 'Like'}</span>
                    </button>
                  </div>

                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title fw-bold">{recipe.name}</h5>
                    <p className="card-text text-muted small flex-grow-1">
                      {recipe.description}
                    </p>
                    
                    {recipe.category && (
                      <div className="mb-2 d-flex align-items-center gap-2">
                        <span className="badge" style={{ 
                          backgroundColor: recipe.category.color || '#dc3545'
                        }}>
                          {recipe.category.name || recipe.category}
                        </span>
                        <button
                          type="button"
                          className={`save-btn-pill ${isSaved ? 'saved' : ''}`}
                          onClick={(e) => handleSave(recipe._id, e)}
                          title={isSaved ? 'Saved in cook-list' : 'Save'}
                        >
                          <i className={`bi ${isSaved ? 'bi-bookmark-fill' : 'bi-bookmark'}`}></i>
                          <span className="save-text">{isSaved ? 'Saved' : 'Save'}</span>
                        </button>
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <small className="text-muted d-block">
                        <i className="bi bi-clock me-1"></i>
                        {recipe.cookingTime || '30'} mins
                      </small>
                    </div>

                    <Link 
                      to={`/recipe/${recipe._id}`}
                      className="btn btn-sm btn-warning fw-bold text-dark w-100 mt-auto"
                    >
                      <i className="bi bi-eye me-2"></i>View
                    </Link>
                  </div>
                </div>
              </div>
                );
              })()
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

export default AllRecipes;
