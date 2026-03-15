import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Category.css';

// 1. Move static data outside the component to fix the dependency error
const allRecipes = [
  { id: 1, name: 'Spicy Ramen', cat: 'Spicy Specials', img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=60', desc: 'Authentic spicy miso ramen.' },
  { id: 2, name: 'Grilled Chicken', cat: 'Dinner', img: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=500&q=60', desc: 'Perfectly seasoned grilled chicken breast.' },
  { id: 4, name: 'Chocolate Cake', cat: 'Desserts', img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=60', desc: 'Rich and moist triple chocolate cake.' }
];

const Category = () => {
  const { categoryName } = useParams();
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    // 2. Filter the data
    const filtered = allRecipes.filter(r => r.cat === categoryName);
    setRecipes(filtered);
    
    // 3. Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categoryName]); // 'allRecipes' is now outside, so it's not needed here

  return (
    <div className="category-page">
      <div className="category-hero d-flex align-items-center justify-content-center">
        <h1 className="display-4 fw-bold text-white">
          Explore <span className="text-warning">{categoryName}</span>
        </h1>
      </div>

      <div className="container py-5">
        <div className="row g-4">
          {recipes.length > 0 ? (
            recipes.map((recipe) => (
              <div key={recipe.id} className="col-md-4">
                <div className="card h-100 shadow-sm border-0 recipe-result-card">
                  <img src={recipe.img} className="card-img-top" alt={recipe.name} style={{height: '220px', objectFit: 'cover'}} />
                  <div className="card-body">
                    <h5 className="fw-bold text-dark">{recipe.name}</h5>
                    <p className="text-muted small">{recipe.desc}</p>
                    <button className="btn btn-danger rounded-pill w-100 mt-2 shadow-sm">
                        View Full Recipe
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-search text-muted display-1"></i>
              <h3 className="text-muted mt-3">No recipes found for "{categoryName}" yet.</h3>
              <p>Try searching for another category in the menu!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;