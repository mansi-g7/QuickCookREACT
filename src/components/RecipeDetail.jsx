import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recipeService } from '../services/api';
import './RecipeDetail.css';

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      } catch (err) {
        setError('Failed to load recipe: ' + err.message);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  if (loading) return <div className="container py-5 text-center">Loading recipe...</div>;
  if (error) return <div className="container py-5 text-center text-danger">{error}</div>;
  if (!recipe) return <div className="container py-5 text-center">Recipe not found</div>;

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
