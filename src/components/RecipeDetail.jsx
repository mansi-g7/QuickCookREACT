import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { playlistService, recipeService, userService } from '../services/api';
import './RecipeDetail.css';
import PlaylistSelector from './PlaylistSelector';

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  useEffect(() => {
    const syncAuthState = () => {
      const token = localStorage.getItem('token');
      setIsUserLoggedIn(Boolean(token));
    };

    syncAuthState();
    window.addEventListener('storage', syncAuthState);
    window.addEventListener('auth-changed', syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('auth-changed', syncAuthState);
    };
  }, []);

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await recipeService.getRecipeById(id);
        if (data.recipe) {
          setRecipe(data.recipe);
        } else if (data._id) {
          setRecipe(data);
        } else {
          setError('Recipe not found');
        }

        // Load user's liked and saved recipes
        if (isUserLoggedIn) {
          const [likedRes, savedRes, playlistsRes] = await Promise.all([
            userService.getLikedRecipes(),
            userService.getSavedRecipes(),
            playlistService.getAllPlaylists()
          ]);
          
          const likedIds = (likedRes.likedRecipes || []).map(r => String(r._id));
          const directSavedIds = (savedRes.savedRecipes || []).map(r => String(r._id));
          const playlistSavedIds = (playlistsRes.playlists || [])
            .flatMap((playlist) => playlist.recipes || [])
            .map((recipe) => String(recipe._id || recipe));
          const savedIds = Array.from(new Set([...directSavedIds, ...playlistSavedIds]));

          setIsLiked(likedIds.includes(String(id)));
          setIsSaved(savedIds.includes(String(id)));
        }
      } catch (err) {
        setError('Failed to load recipe: ' + err.message);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id, isUserLoggedIn]);

  if (loading) return <div className="container py-5 text-center">Loading recipe...</div>;
  if (error) return <div className="container py-5 text-center text-danger">{error}</div>;
  if (!recipe) return <div className="container py-5 text-center">Recipe not found</div>;

  const handleLike = async () => {
    if (!isUserLoggedIn) {
      alert('Please login to like recipes');
      return;
    }

    try {
      let result;
      if (isLiked) {
        console.log('Unliking recipe:', id);
        result = await userService.unlikeRecipe(id);
      } else {
        console.log('Liking recipe:', id);
        result = await userService.likeRecipe(id);
      }
      
      console.log('Like/Unlike result:', result);
      
      if (result && result.success !== false) {
        setIsLiked(!isLiked);
        console.log('Like status updated successfully');
      } else {
        const errorMsg = result?.message || 'Failed to update like status';
        console.error('API Error:', errorMsg);
        alert(errorMsg);
      }
    } catch (err) {
      console.error('Error liking recipe:', err);
      alert('Failed to update like status: ' + err.message);
    }
  };

  const handleSave = async () => {
    if (!isUserLoggedIn) {
      alert('Please login to save recipes');
      return;
    }

    setShowPlaylistModal(true);
  };

  const handlePlaylistSaved = () => {
    setIsSaved(true);
    setShowPlaylistModal(false);
  };

  return (
    <div className="recipe-detail py-5">
      <div className="container">
        <Link to="/" className="btn btn-outline-secondary mb-4">
          <i className="bi bi-arrow-left me-2"></i>Back to Home
        </Link>

        <div className="row">
          <div className="col-md-6">
            {recipe.image && (
              <img src={recipe.image} alt={recipe.name} className="img-fluid rounded shadow mb-4" />
            )}
          </div>

          <div className="col-md-6">
            <h1 className="fw-bold mb-3">{recipe.name}</h1>
            
            <p className="text-muted mb-4">{recipe.description}</p>

            {recipe.category && (
              <div className="mb-3">
                <span className="badge" style={{ 
                  backgroundColor: recipe.category.color || '#dc3545'
                }}>
                  {recipe.category.name || recipe.category}
                </span>
              </div>
            )}

            <div className="recipe-meta mb-4">
              <div className="row">
                <div className="col-6">
                  <p><strong>⏱️ Cooking Time:</strong> {recipe.cookingTime || 30} mins</p>
                </div>
                <div className="col-6">
                  <p><strong>👥 Servings:</strong> {recipe.servings || 4}</p>
                </div>
                <div className="col-6">
                  <p><strong>📊 Difficulty:</strong> {recipe.difficulty || 'Medium'}</p>
                </div>
              </div>
            </div>

            {/* Like and Save Buttons */}
            <div className="recipe-actions mb-4 d-flex gap-3">
              <button
                className={`btn btn-lg rounded-pill fw-bold ${isLiked ? 'btn-danger' : 'btn-outline-danger'}`}
                onClick={handleLike}
                title={isLiked ? 'Unlike' : 'Like'}
              >
                <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'} me-2`}></i>
                {isLiked ? 'Liked' : 'Like'}
              </button>
              <button
                className={`btn btn-lg rounded-pill fw-bold ${isSaved ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={handleSave}
                title={isSaved ? 'Saved in cook-list' : 'Save'}
              >
                <i className={`bi ${isSaved ? 'bi-bookmark-fill' : 'bi-bookmark'} me-2`}></i>
                {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>

            <hr />

            <h3 className="fw-bold mb-3">Ingredients</h3>
            <ul className="list-group mb-4">
              {recipe.ingredients && recipe.ingredients.map((ingredient, idx) => (
                <li key={idx} className="list-group-item">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  {ingredient}
                </li>
              ))}
            </ul>

            <h3 className="fw-bold mb-3">Instructions</h3>
            <p className="bg-light p-4 rounded">
              {recipe.instructions || recipe.steps?.join(' → ') || 'No instructions available'}
            </p>

            <div className="mt-4">
              <Link to="/feedback" className="btn btn-warning fw-bold text-dark px-4 rounded-pill shadow-sm">
                <i className="bi bi-chat-left-text me-2"></i>Send Your Feedback
              </Link>
            </div>
          </div>
        </div>
      </div>

      <PlaylistSelector
        recipeId={id}
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        onSave={handlePlaylistSaved}
      />
    </div>
  );
};

export default RecipeDetail;
