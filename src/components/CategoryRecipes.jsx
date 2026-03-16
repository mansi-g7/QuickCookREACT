import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recipeService } from '../services/api';
import './CategoryRecipes.css';

const CategoryRecipes = () => {
  const { name } = useParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
                <div className="card shadow-sm h-100 border-0 recipe-card">
                  {recipe.image && (
                    <img src={recipe.image} className="card-img-top" alt={recipe.name} />
                  )}
                  <div className="card-body">
                    <h5 className="card-title fw-bold">{recipe.name}</h5>
                    <p className="card-text text-muted small">
                      {recipe.description}
                    </p>
                    
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
        )}
      </div>
    </div>
  );
};

export default CategoryRecipes;
