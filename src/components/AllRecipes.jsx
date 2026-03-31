import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { recipeService } from '../services/api';
import './AllRecipes.css';

const AllRecipes = () => {
  const [searchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    setSearchTerm(urlSearch);
  }, [searchParams]);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await recipeService.getAllRecipes();
        
        // Handle response format
        const allRecipes = Array.isArray(data) ? data : data.recipes || [];
        setRecipes(allRecipes);
      } catch (err) {
        setError('Failed to load recipes: ' + err.message);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
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
              <div className="col-md-4 col-lg-3" key={recipe._id}>
                <div className="card shadow-sm h-100 border-0 recipe-card">
                  {recipe.image && (
                    <img src={recipe.image} className="card-img-top" alt={recipe.name} />
                  )}
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title fw-bold">{recipe.name}</h5>
                    <p className="card-text text-muted small flex-grow-1">
                      {recipe.description}
                    </p>
                    
                    {recipe.category && (
                      <div className="mb-2">
                        <span className="badge" style={{ 
                          backgroundColor: recipe.category.color || '#dc3545'
                        }}>
                          {recipe.category.name || recipe.category}
                        </span>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllRecipes;
